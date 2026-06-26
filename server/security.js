// Sécurité centralisée : rate limiting (HTTP + temps réel) et en-têtes.
//
// TOUTES les limites vivent ici (un seul module, rien d'éparpillé), et sont
// pilotables par variables d'environnement avec des valeurs par défaut saines.
// Stockage en mémoire (compteurs à fenêtre glissante) : suffisant pour une
// instance unique sur hébergement gratuit (Render/Koyeb). Pour plusieurs
// instances, brancher un store partagé (Redis) — voir README.
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const num = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const IS_PROD = process.env.NODE_ENV === 'production';
// Exemption de dev : désactive tout le rate limiting (RATE_LIMIT_DISABLED=1).
const DISABLED = process.env.RATE_LIMIT_DISABLED === '1' || (!IS_PROD && process.env.RATE_LIMIT_DISABLED !== '0');

const config = {
  disabled: DISABLED,
  http: {
    windowMs: num(process.env.RL_HTTP_WINDOW_MS, 60_000),
    max: num(process.env.RL_HTTP_MAX, 120), // requêtes/fenêtre/IP (API publiques)
  },
  socket: {
    msgPerSec: num(process.env.RL_SOCKET_MSG_PER_SEC, 30), // anti-flood par socket
    connWindowMs: num(process.env.RL_CONN_WINDOW_MS, 60_000),
    connMax: num(process.env.RL_CONN_MAX, 60), // connexions/fenêtre/IP (anti-DDoS basique)
    createPerMin: num(process.env.RL_CREATE_PER_MIN, 20), // créations de partie/min/IP
    joinPerMin: num(process.env.RL_JOIN_PER_MIN, 60), // tentatives de join/min/IP
  },
  maxPlayers: num(process.env.MAX_PLAYERS, 12),
};

// Compteurs de blocages (monitoring, exposés via /health).
const blocked = { http: 0, conn: 0, message: 0, create: 0, join: 0 };
let lastLog = 0;
function note(kind, key) {
  blocked[kind] = (blocked[kind] || 0) + 1;
  const now = Date.now();
  if (now - lastLog > 2000) {
    lastLog = now;
    console.warn(`[security] blocage ${kind} (${key}) — totaux:`, JSON.stringify(blocked));
  }
}

// --- Fenêtres glissantes en mémoire ------------------------------------------
// connexions par IP, et events sensibles par "IP:kind".
const windows = new Map(); // key -> { start, count }

function hit(key, windowMs, max) {
  if (config.disabled) return true;
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now - w.start > windowMs) {
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  w.count += 1;
  return w.count <= max;
}

// Purge périodique des fenêtres expirées (évite la fuite mémoire).
setInterval(() => {
  const now = Date.now();
  for (const [k, w] of windows) if (now - w.start > 5 * 60_000) windows.delete(k);
}, 5 * 60_000).unref?.();

// --- IP réelle (derrière le proxy Render/Koyeb) ------------------------------
function socketIp(socket) {
  const fwd = socket.handshake.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return socket.handshake.address || 'unknown';
}

// --- API HTTP ----------------------------------------------------------------
function helmetMiddleware() {
  // Le serveur ne sert pas d'app web (l'app mobile n'est pas un navigateur),
  // donc la CSP protège surtout les endpoints / et /health et un éventuel futur
  // front web. CSP restrictive par défaut : tout en 'self'.
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // l'app mobile consomme l'API depuis une autre origine
  });
}

function httpLimiter() {
  return rateLimit({
    windowMs: config.http.windowMs,
    max: config.http.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.disabled,
    handler: (req, res) => {
      note('http', req.ip);
      res.status(429).json({ error: 'too-many-requests' });
    },
  });
}

// --- Temps réel (Socket.io) --------------------------------------------------
// À appeler à la connexion : refuse si l'IP ouvre trop de sockets.
function allowConnection(socket) {
  const ip = socketIp(socket);
  const ok = hit(`conn:${ip}`, config.socket.connWindowMs, config.socket.connMax);
  if (!ok) note('conn', ip);
  return ok;
}

// Anti-flood : messages/seconde par socket (fenêtre glissante d'1 s).
function allowMessage(socket) {
  if (config.disabled) return true;
  const now = Date.now();
  const w = socket.data.win || { t: now, n: 0 };
  if (now - w.t > 1000) {
    w.t = now;
    w.n = 0;
  }
  w.n += 1;
  socket.data.win = w;
  const ok = w.n <= config.socket.msgPerSec;
  if (!ok) note('message', socketIp(socket));
  return ok;
}

// Events sensibles (create/join) : plus stricts, par IP.
function allowEvent(socket, kind) {
  const ip = socketIp(socket);
  const perMin = kind === 'create' ? config.socket.createPerMin : config.socket.joinPerMin;
  const ok = hit(`${kind}:${ip}`, 60_000, perMin);
  if (!ok) note(kind, ip);
  return ok;
}

function stats() {
  return { disabled: config.disabled, blocked, trackedKeys: windows.size };
}

module.exports = {
  config,
  helmetMiddleware,
  httpLimiter,
  allowConnection,
  allowMessage,
  allowEvent,
  socketIp,
  stats,
};
