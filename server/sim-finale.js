// Simule une fin de partie pour vérifier l'enregistrement en BDD.
// (dev only) node sim-finale.js
const { WebSocket } = require('ws');
const ws = new WebSocket('ws://localhost:8787?room=SIM&id=H&name=Alice');
ws.on('open', () => {
  const state = {
    phase: 'finale',
    totalManches: 3,
    currentManche: 3,
    turn: null,
    players: [
      { id: 'H', name: 'Alice', malus: 0, isChef: true },
      { id: 'C', name: 'Bob', malus: 2, isChef: false },
    ],
    result: { winnerId: 'H', loserId: 'C', tie: false },
  };
  ws.send(JSON.stringify({ event: 'state', payload: { state } }));
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 600);
});
