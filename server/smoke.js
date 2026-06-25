// Test local du serveur Socket.io, sans Docker ni base : node smoke.js
// Vérifie : create -> code à 4 chiffres, l'hôte reçoit "hello" au join,
// et le client reçoit le "state" diffusé par l'hôte.
const { io } = require('../node_modules/socket.io-client');
require('./server.js'); // démarre le serveur sur le port 8787

const URL = 'http://localhost:8787';

setTimeout(() => {
  const host = io(URL, { transports: ['websocket'] });
  let code = null;
  let hostGotHello = false;
  let clientGotState = false;

  host.on('connect', () => {
    host.emit('create', { id: 'H', name: 'Alice' }, (res) => {
      code = res && res.code;
      console.log('1) create -> code', code, code && /^\d{4}$/.test(code) ? 'OK' : 'ECHEC');

      host.on('hello', ({ id, name }) => {
        hostGotHello = true;
        console.log('2) hote recoit hello:', id, name, '-> OK');
        host.emit('state', {
          phase: 'lobby',
          players: [
            { id: 'H', name: 'Alice', malus: 0, isChef: true },
            { id, name, malus: 0, isChef: false },
          ],
        });
      });

      const client = io(URL, { transports: ['websocket'] });
      client.on('connect', () =>
        client.emit('join', { id: 'C', name: 'Bob', code }, (r) => console.log('3) join ->', JSON.stringify(r)))
      );
      client.on('state', (s) => {
        clientGotState = true;
        console.log('4) client recoit state, joueurs =', s.players.length, '-> OK');
      });

      setTimeout(() => {
        console.log('RESUME:', { codeOK: /^\d{4}$/.test(code || ''), hostGotHello, clientGotState });
        process.exit(0);
      }, 1500);
    });
  });
}, 400);
