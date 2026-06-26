// Génère des effets sonores libres de droits (synthétisés) pour la roulette.
// 16-bit PCM mono, 44.1 kHz. Lancer : node scripts/gen-sfx.js
const fs = require('fs');
const path = require('path');

const SR = 44100;
const OUT = path.join(__dirname, '..', 'assets', 'sfx');

function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE((s * 32767) | 0, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const env = (t, dur, a = 0.005, r = 0.05) => {
  if (t < a) return t / a;
  if (t > dur - r) return Math.max(0, (dur - t) / r);
  return 1;
};

// Tick : clic court et sec (cran de la roue).
function tick() {
  const dur = 0.045;
  const n = Math.floor(SR * dur);
  const s = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SR;
    const tone = Math.sin(2 * Math.PI * 1500 * t);
    const noise = (Math.random() * 2 - 1) * 0.4;
    s[i] = (tone * 0.6 + noise) * Math.exp(-t * 60) * env(t, dur) * 0.5;
  }
  return s;
}

// Spin : whoosh montant (lancement de la roulette).
function spin() {
  const dur = 1.1;
  const n = Math.floor(SR * dur);
  const s = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SR;
    const f = 180 + 320 * (t / dur); // monte en fréquence
    const noise = (Math.random() * 2 - 1) * 0.35;
    const tone = Math.sin(2 * Math.PI * f * t) * 0.5;
    s[i] = (tone + noise) * env(t, dur, 0.04, 0.18) * 0.45;
  }
  return s;
}

// Win : petit arpège ascendant joyeux (résultat / victoire).
function win() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const step = 0.12;
  const dur = step * notes.length + 0.5;
  const n = Math.floor(SR * dur);
  const s = new Array(n).fill(0);
  notes.forEach((f, k) => {
    const start = Math.floor(k * step * SR);
    for (let i = start; i < n; i += 1) {
      const t = (i - start) / SR;
      const a = Math.exp(-t * 4);
      s[i] += (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * a * 0.22;
    }
  });
  // léger fade out global
  for (let i = 0; i < n; i += 1) s[i] *= env(i / SR, dur, 0.002, 0.25);
  return s;
}

// Click : tap d'interface court et doux (retour des boutons).
function click() {
  const dur = 0.03;
  const n = Math.floor(SR * dur);
  const s = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SR;
    s[i] = Math.sin(2 * Math.PI * 850 * t) * Math.exp(-t * 90) * env(t, dur) * 0.35;
  }
  return s;
}

// Confirm : validation positive, deux notes ascendantes (action validée, succès).
function confirm() {
  const notes = [{ f: 880, at: 0 }, { f: 1318.5, at: 0.09 }]; // A5 -> E6
  const dur = 0.42;
  const n = Math.floor(SR * dur);
  const s = new Array(n).fill(0);
  notes.forEach(({ f, at }) => {
    const start = Math.floor(at * SR);
    for (let i = start; i < n; i += 1) {
      const t = (i - start) / SR;
      s[i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 6) * 0.3;
    }
  });
  for (let i = 0; i < n; i += 1) s[i] *= env(i / SR, dur, 0.003, 0.18);
  return s;
}

// Buzz : retour négatif (dégonflé / +1 malus), tonalité descendante un peu sale.
function buzz() {
  const dur = 0.3;
  const n = Math.floor(SR * dur);
  const s = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SR;
    const f = 300 - 120 * (t / dur); // descend
    const sq = Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.25; // bord carré léger
    const sine = Math.sin(2 * Math.PI * f * t) * 0.4;
    s[i] = (sine + sq) * Math.exp(-t * 3) * env(t, dur, 0.004, 0.12) * 0.5;
  }
  return s;
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'tick.wav'), toWav(tick()));
fs.writeFileSync(path.join(OUT, 'spin.wav'), toWav(spin()));
fs.writeFileSync(path.join(OUT, 'win.wav'), toWav(win()));
fs.writeFileSync(path.join(OUT, 'click.wav'), toWav(click()));
fs.writeFileSync(path.join(OUT, 'confirm.wav'), toWav(confirm()));
fs.writeFileSync(path.join(OUT, 'buzz.wav'), toWav(buzz()));
console.log('SFX générés dans assets/sfx/');
