// Quick local check of the relay (no Docker needed): node smoke.js
// Verifies a message from A is forwarded to B (same room) and NOT echoed to A.
const { WebSocket } = require('ws');
require('./server.js'); // starts listening on 8787

const base = 'ws://localhost:8787';
setTimeout(() => {
  const a = new WebSocket(`${base}?room=TEST&id=A&name=Alice`);
  const b = new WebSocket(`${base}?room=TEST&id=B&name=Bob`);
  let bGot = null;
  let aGot = null;
  let leaveSeen = null;
  b.on('message', (d) => {
    const m = JSON.parse(d.toString());
    if (m.event === 'leave') leaveSeen = m.payload.id;
    else bGot = m;
  });
  a.on('message', (d) => (aGot = d.toString()));

  let open = 0;
  const onOpen = () => {
    if (++open === 2) {
      a.send(JSON.stringify({ event: 'hello', payload: { id: 'A', name: 'Alice' } }));
      setTimeout(check, 400);
    }
  };
  a.on('open', onOpen);
  b.on('open', onOpen);

  function check() {
    console.log('1) B a reçu le hello de A :', bGot && bGot.event === 'hello' ? 'OK' : 'ÉCHEC', JSON.stringify(bGot));
    console.log('2) A n\'a PAS reçu son propre message :', aGot === null ? 'OK' : 'ÉCHEC');
    a.close();
    setTimeout(() => {
      console.log('3) B a été notifié du départ de A :', leaveSeen === 'A' ? 'OK' : 'ÉCHEC');
      process.exit(0);
    }, 400);
  }
}, 300);
