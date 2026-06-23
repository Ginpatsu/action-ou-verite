// Relais WebSocket pour le mode en ligne d'Action ou Vérité.
// Aucune logique de jeu ici : l'hôte fait autorité côté app. Le serveur se
// contente de relayer chaque message aux AUTRES membres de la même room, et de
// signaler les déconnexions. Léger, sans état persistant.
const http = require('http');
const { WebSocketServer } = require('ws');
const db = require('./db');

const PORT = process.env.PORT || 8787;

// Health-check + page d'aide quand on ouvre http://<ip>:8787 dans un navigateur.
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Action ou Verite — serveur de jeu OK. Rooms actives: ' + rooms.size);
});

const wss = new WebSocketServer({ server });

/** @type {Map<string, Set<import('ws').WebSocket>>} */
const rooms = new Map();
/** Dernière phase vue par room, pour n'enregistrer une partie qu'une fois à la finale. */
const roomPhase = new Map();

// Observe les messages relayés pour la persistance (best-effort, non bloquant).
function observeForDb(code, text) {
  let msg;
  try {
    msg = JSON.parse(text);
  } catch {
    return;
  }
  if (msg.event === 'hello' && msg.payload) {
    db.upsertAccount(msg.payload.id, msg.payload.name);
  } else if (msg.event === 'state' && msg.payload && msg.payload.state) {
    const state = msg.payload.state;
    const prev = roomPhase.get(code);
    if (state.phase === 'finale' && prev !== 'finale') {
      db.recordGame(code, state);
    }
    roomPhase.set(code, state.phase);
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const code = (url.searchParams.get('room') || '').toUpperCase();
  const id = url.searchParams.get('id') || '';
  if (!code || !id) {
    ws.close();
    return;
  }

  ws.roomCode = code;
  ws.peerId = id;
  if (!rooms.has(code)) rooms.set(code, new Set());
  rooms.get(code).add(ws);
  console.log(`[+] ${id} a rejoint ${code} (${rooms.get(code).size} dans la room)`);

  ws.on('message', (data) => {
    const room = rooms.get(code);
    if (!room) return;
    const text = data.toString();
    for (const peer of room) {
      if (peer !== ws && peer.readyState === peer.OPEN) peer.send(text);
    }
    observeForDb(code, text);
  });

  ws.on('close', () => {
    const room = rooms.get(code);
    if (!room) return;
    room.delete(ws);
    const bye = JSON.stringify({ event: 'leave', payload: { id } });
    for (const peer of room) {
      if (peer.readyState === peer.OPEN) peer.send(bye);
    }
    if (room.size === 0) {
      rooms.delete(code);
      roomPhase.delete(code);
    }
    console.log(`[-] ${id} a quitté ${code}`);
  });
});

db.init();
server.listen(PORT, () => console.log(`Serveur de jeu sur le port ${PORT}`));
