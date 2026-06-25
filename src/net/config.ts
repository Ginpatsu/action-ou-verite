import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Adresse du serveur de jeu (Socket.io / Express) ──────────────────────────
//
// Résolution par ordre de priorité :
//   1. Adresse saisie dans l'app (persistée) — indispensable pour les BUILDS,
//      car un APK n'a pas de serveur Metro pour deviner l'IP.
//   2. Variable d'env de build EXPO_PUBLIC_GAME_SERVER.
//   3. IP détectée depuis Metro (la même que le QR code) — DEV / LAN uniquement.
//
// Le serveur écoute en HTTP(S) ; socket.io-client gère l'upgrade WebSocket.
//   - LAN/Docker  : http://192.168.x.x:8787
//   - Production  : https://mon-serveur.onrender.com

const GAME_PORT = 8787;
const STORE_KEY = 'aov.gameServer';

function deriveFromMetro(): string {
  const fromExpo = Constants.expoConfig?.hostUri;
  const fromGo = (Constants as unknown as { expoGoConfig?: { hostUri?: string } }).expoGoConfig?.hostUri;
  const host = (fromExpo || fromGo || '').split(':')[0];
  if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) return `http://${host}:${GAME_PORT}`;
  return '';
}

// Serveur cloud par défaut (Render) : utilisé en BUILD quand il n'y a ni saisie
// in-app, ni variable d'env, ni IP Metro. Permet à l'APK de marcher direct.
const PROD_SERVER = 'https://aov-game-server.onrender.com';

export const DETECTED_DEFAULT = process.env.EXPO_PUBLIC_GAME_SERVER || deriveFromMetro() || PROD_SERVER;

// Adresse saisie dans l'app (prioritaire). Chargée au démarrage via loadGameServer().
let override = '';

export async function loadGameServer(): Promise<void> {
  override = (await AsyncStorage.getItem(STORE_KEY).catch(() => null)) ?? '';
}

export function getGameServer(): string {
  return override || DETECTED_DEFAULT;
}

export function gameServerConfigured(): boolean {
  return getGameServer().length > 0;
}

// Accepte une IP ("192.168.1.20"), "host:port", ou une URL http(s)/ws(s).
// Normalise vers http://host:8787 si aucun schéma n'est fourni.
export function normalizeServer(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s.replace(/\/+$/, '');
  if (/^wss?:\/\//i.test(s)) return s.replace(/^ws/i, 'http').replace(/\/+$/, '');
  return `http://${s.includes(':') ? s : `${s}:${GAME_PORT}`}`;
}

export async function setGameServer(input: string): Promise<string> {
  const url = normalizeServer(input);
  override = url;
  if (url) await AsyncStorage.setItem(STORE_KEY, url).catch(() => {});
  else await AsyncStorage.removeItem(STORE_KEY).catch(() => {});
  return url;
}
