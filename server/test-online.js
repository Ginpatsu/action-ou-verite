// Test bout-en-bout contre le serveur Socket.io EN COURS (docker compose up).
// Simule create -> join -> finale, ce qui doit enregistrer la partie en base.
// Usage : node test-online.js
const { io } = require('../node_modules/socket.io-client');
const URL = process.env.URL || 'http://localhost:8787';

const host = io(URL, { transports: ['websocket'] });
host.on('connect', () => {
  host.emit('create', { id: 'H1', name: 'Alice' }, (res) => {
    const code = res && res.code;
    console.log('create -> code', code);
    host.on('hello', ({ id, name }) => {
      console.log('hello recu de', name);
      host.emit('state', {
        phase: 'finale',
        totalManches: 3,
        currentManche: 3,
        turn: null,
        players: [
          { id: 'H1', name: 'Alice', malus: 0, isChef: true },
          { id, name, malus: 3, isChef: false },
        ],
        result: { winnerIds: ['H1'], loserIds: [id], tie: false },
      });
      console.log('finale envoyee -> doit etre enregistree en base');
      setTimeout(() => process.exit(0), 900);
    });
    const client = io(URL, { transports: ['websocket'] });
    client.on('connect', () => client.emit('join', { id: 'C1', name: 'Bob', code }));
  });
});
host.on('connect_error', (e) => {
  console.log('connect_error', e.message);
  process.exit(1);
});
