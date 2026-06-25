// Couche base de données (optionnelle).
// Si DATABASE_URL n'est pas défini, tout devient no-op : le serveur reste un
// simple relais (utile pour `node smoke.js` ou un dev sans Postgres).
const fs = require('fs');
const path = require('path');

const url = process.env.DATABASE_URL;
let pool = null;

if (url) {
  const { Pool } = require('pg');
  // Les bases distantes (Neon, Supabase) exigent SSL ; en local (docker/localhost) non.
  const isLocal = /@(db|localhost|127\.0\.0\.1)[:/]/.test(url);
  pool = new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  pool.on('error', (e) => console.error('[db] pool error:', e.message));
}

const enabled = () => pool !== null;

async function q(text, params) {
  if (!pool) return null;
  try {
    return await pool.query(text, params);
  } catch (e) {
    console.error('[db] query error:', e.message);
    return null;
  }
}

// Idempotent : garantit le schéma même si le volume Postgres préexistait.
async function ensureSchema() {
  if (!pool) return;
  const sql = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
  // petite attente que Postgres soit prêt (depends_on healthcheck couvre déjà ça)
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(sql);
      console.log('[db] schéma OK');
      return;
    } catch (e) {
      console.log(`[db] Postgres pas prêt (${attempt}/10): ${e.message}`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function upsertAccount(id, pseudo) {
  if (!enabled() || !id || !pseudo) return;
  await q(
    `insert into accounts (id, pseudo, last_seen_at) values ($1, $2, now())
     on conflict (id) do update set pseudo = excluded.pseudo, last_seen_at = now()`,
    [id, pseudo]
  );
}

// Enregistre une partie terminée + met à jour les stats cumulées des comptes.
async function recordGame(code, state) {
  if (!enabled() || !state || !state.result) return;
  const players = state.players || [];
  const { winnerId, loserId } = state.result;
  const gameId = `${code}-${Date.now()}`;

  const winner = players.find((p) => p.id === winnerId);
  const loser = players.find((p) => p.id === loserId);

  await q(
    `insert into games (id, code, manches, winner_id, loser_id, winner_pseudo, loser_pseudo)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [gameId, code, state.totalManches || 0, winnerId, loserId, winner ? winner.name : null, loser ? loser.name : null]
  );

  for (const p of players) {
    await q(`insert into game_players (game_id, player_id, pseudo, malus) values ($1, $2, $3, $4)`, [gameId, p.id, p.name, p.malus]);
    await q(
      `insert into accounts (id, pseudo, last_seen_at, games_played, games_won, games_lost, total_malus)
       values ($1, $2, now(), 1, $3, $4, $5)
       on conflict (id) do update set
         pseudo = excluded.pseudo,
         last_seen_at = now(),
         games_played = accounts.games_played + 1,
         games_won = accounts.games_won + $3,
         games_lost = accounts.games_lost + $4,
         total_malus = accounts.total_malus + $5`,
      [p.id, p.name, p.id === winnerId ? 1 : 0, p.id === loserId ? 1 : 0, p.malus]
    );
  }
  console.log(`[db] partie ${gameId} enregistrée (${players.length} joueurs)`);
}

async function cleanupExpired() {
  if (!enabled()) return;
  const res = await q(`delete from games where expires_at < now()`);
  if (res && res.rowCount) console.log(`[db] ${res.rowCount} partie(s) expirée(s) purgée(s)`);
}

async function init() {
  if (!enabled()) {
    console.log('[db] DATABASE_URL absent → persistance désactivée (mode relais seul)');
    return;
  }
  await ensureSchema();
  await cleanupExpired();
  setInterval(cleanupExpired, 60 * 60 * 1000); // purge horaire
}

module.exports = { init, upsertAccount, recordGame, cleanupExpired, enabled };
