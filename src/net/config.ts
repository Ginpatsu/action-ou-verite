import Constants from 'expo-constants';

// ── Serveur de jeu (mode EN LIGNE) ───────────────────────────────────────────
//
// Le multijoueur parle à un petit serveur WebSocket (dossier ./server) que tu
// lances en Docker sur ton PC :  docker compose up -d --build
//
// ZÉRO CONFIG en LAN : l'app détecte l'IP de ton PC (la même que celle du QR
// code Metro) et s'y connecte sur le port 8787. Il suffit que les téléphones
// soient sur le MÊME Wi-Fi que le PC.
//
// Override possible : EXPO_PUBLIC_GAME_SERVER=ws://192.168.1.20:8787
// (utile en mode --tunnel, ou pour pointer vers un vrai serveur plus tard).

const GAME_PORT = 8787;

function deriveFromMetro(): string {
  // hostUri ressemble à "192.168.1.20:8081" quand on lance en LAN.
  const fromExpo = Constants.expoConfig?.hostUri;
  const fromGo = (Constants as unknown as { expoGoConfig?: { hostUri?: string } }).expoGoConfig?.hostUri;
  const host = (fromExpo || fromGo || '').split(':')[0];
  if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) return `ws://${host}:${GAME_PORT}`;
  return '';
}

export const GAME_SERVER = process.env.EXPO_PUBLIC_GAME_SERVER || deriveFromMetro();
export const serverConfigured = GAME_SERVER.length > 0;
