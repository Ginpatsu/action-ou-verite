// Serveur de jeu "Action ou Vérité" — Express + Socket.io + PostgreSQL.
//
// Modèle : l'HÔTE fait autorité (il tient l'état du jeu et le diffuse). Le serveur
// gère les salons (rooms Socket.io) et relaie les messages ; il ne calcule pas la
// logique du jeu. Conçu pour tourner sur un plan GRATUIT (Render.com / Koyeb) avec
// une base PostgreSQL gratuite (Neon.tech / Supabase). Voir db.js + .env.example.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
const security = require('./security');

const PORT = process.env.PORT || 8787;
const MAX_PLAYERS = security.config.maxPlayers; // joueurs max par salon (anti-abus)

const app = express();
// Derrière le proxy de Render/Koyeb : nécessaire pour obtenir la vraie IP client
// (rate limiting par IP correct).
app.set('trust proxy', 1);
// En-têtes de sécurité + CSP (centralisés dans security.js).
app.use(security.helmetMiddleware());
// Rate limiting des endpoints HTTP publics.
app.use(security.httpLimiter());

// Endpoints HTTP : health-check (Render/Koyeb pinguent une URL) + petit "réveil".
app.get('/', (_req, res) => res.type('text').send('Action ou Verite - serveur OK'));
app.get('/health', (_req, res) => res.json({ ok: true, rooms: rooms.size, security: security.stats() }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }, // app mobile -> pas d'origine fixe
  maxHttpBufferSize: 64 * 1024, // 64 Ko max par message (anti-DoS)
  pingTimeout: 20000,
});

// code (4 chiffres) -> { host: socketId, phase }
const rooms = new Map();

function makeCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

// Retire les caractères de contrôle et borne la longueur d'un pseudo.
function sanitizeName(n) {
  return (
    String(n || '')
      .split('')
      .filter((c) => c.charCodeAt(0) >= 32)
      .join('')
      .trim()
      .slice(0, 24) || 'Joueur'
  );
}

function cleanId(id) {
  return String(id || '').slice(0, 64);
}

// Pseudo déjà pris dans le salon par un AUTRE joueur (insensible à la casse) ?
// Permet de refuser un pseudo en double dès le join (l'hôte garde aussi cette
// règle de son côté). Le même id qui se reconnecte n'est pas bloqué.
function nameTaken(room, id, name) {
  if (!room || !room.idToName) return false;
  const lower = String(name).toLowerCase();
  for (const [pid, pname] of room.idToName) {
    if (pid !== id && String(pname).toLowerCase() === lower) return true;
  }
  return false;
}

// Validation minimale de l'état avant relai / écriture en base.
function validState(s) {
  return (
    s &&
    typeof s === 'object' &&
    typeof s.phase === 'string' &&
    Array.isArray(s.players) &&
    s.players.length <= MAX_PLAYERS
  );
}

io.on('connection', (socket) => {
  // Anti-DDoS basique : si l'IP ouvre trop de sockets sur la fenêtre, on coupe.
  if (!security.allowConnection(socket)) {
    socket.disconnect(true);
    return;
  }

  // CREATE : l'hôte crée une partie ; le serveur génère un code à 4 chiffres unique.
  socket.on('create', (payload, cb) => {
    if (!security.allowEvent(socket, 'create')) return typeof cb === 'function' && cb({ error: 'rate-limited' });
    const id = cleanId(payload && payload.id);
    if (!id) return typeof cb === 'function' && cb({ error: 'bad-request' });
    const hostName = sanitizeName(payload && payload.name);
    const code = makeCode();
    // idToName : pseudos réservés dans le salon (pour refuser les doublons).
    rooms.set(code, { host: socket.id, phase: 'lobby', idToName: new Map([[id, hostName]]) });
    socket.data.code = code;
    socket.data.id = id;
    socket.data.name = hostName;
    socket.data.isHost = true;
    socket.join(code);
    db.upsertAccount(id, hostName);
    if (typeof cb === 'function') cb({ code });
  });

  // REHOST : l'hôte se reconnecte (retour dans l'app) et reprend SON salon.
  socket.on('rehost', (payload) => {
    const code = String((payload && payload.code) || '').slice(0, 8);
    if (!code) return;
    const id = cleanId(payload && payload.id);
    const room = rooms.get(code) || { phase: 'lobby', idToName: new Map() };
    room.host = socket.id;
    if (!room.idToName) room.idToName = new Map();
    room.idToName.set(id, sanitizeName(payload && payload.name)); // ré-réserve le pseudo de l'hôte
    rooms.set(code, room);
    socket.data.code = code;
    socket.data.id = id;
    socket.data.name = sanitizeName(payload && payload.name);
    socket.data.isHost = true;
    socket.join(code);
  });

  // JOIN : un joueur rejoint via le code ; on prévient l'hôte (event "hello").
  socket.on('join', (payload, cb) => {
    if (!security.allowEvent(socket, 'join')) return typeof cb === 'function' && cb({ error: 'rate-limited' });
    const code = String((payload && payload.code) || '').slice(0, 8);
    const id = cleanId(payload && payload.id);
    const name = sanitizeName(payload && payload.name);
    const room = rooms.get(code);
    if (!room) return typeof cb === 'function' && cb({ error: 'not-found' });
    const size = (io.sockets.adapter.rooms.get(code) || { size: 0 }).size;
    if (size >= MAX_PLAYERS) return typeof cb === 'function' && cb({ error: 'full' });
    // Pseudo déjà pris par un autre joueur du salon -> on refuse (retour clair).
    if (nameTaken(room, id, name)) return typeof cb === 'function' && cb({ error: 'name-taken' });
    if (!room.idToName) room.idToName = new Map();
    room.idToName.set(id, name);
    socket.data.code = code;
    socket.data.id = id;
    socket.data.name = name;
    socket.data.isHost = false;
    socket.join(code);
    db.upsertAccount(id, name);
    io.to(room.host).emit('hello', { id, name }); // l'hôte ajoute le joueur
    if (typeof cb === 'function') cb({ ok: true });
  });

  // STATE : seul l'HÔTE diffuse l'état faisant autorité (sinon un client pourrait
  // détourner la partie). On valide, on relaie aux autres, et on persiste à la fin.
  socket.on('state', (state) => {
    if (!security.allowMessage(socket) || !socket.data.isHost || !socket.data.code) return;
    if (!validState(state)) return;
    const room = rooms.get(socket.data.code);
    if (room) {
      if (state.phase === 'finale' && room.phase !== 'finale') db.recordGame(socket.data.code, state);
      room.phase = state.phase;
    }
    socket.to(socket.data.code).emit('state', state);
  });

  // ACTION : un client envoie une action ; on la relaie (l'hôte la reçoit).
  socket.on('action', (action) => {
    if (!security.allowMessage(socket) || !socket.data.code) return;
    socket.to(socket.data.code).emit('action', { id: socket.data.id, action });
  });

  socket.on('disconnect', () => {
    const code = socket.data.code;
    if (!code) return;
    socket.to(code).emit('peer-left', { id: socket.data.id });
    const room = rooms.get(code);
    // Libère le pseudo réservé par ce joueur (sauf l'hôte, qui reprend son salon).
    if (room && room.idToName && !socket.data.isHost) room.idToName.delete(socket.data.id);
    const size = (io.sockets.adapter.rooms.get(code) || { size: 0 }).size;
    if (size === 0) rooms.delete(code);
  });
});

db.init();
server.listen(PORT, () => console.log(`Serveur Socket.io sur le port ${PORT}`));
