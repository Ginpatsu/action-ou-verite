import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Adresse du serveur de jeu (mode EN LIGNE) ────────────────────────────────
//
// Le multijoueur parle à un serveur WebSocket (dossier ./server, lancé en Docker).
// On résout son adresse dans cet ordre de priorité :
//   1. Adresse saisie dans l'app (persistée) — indispensable pour les BUILDS,
//      car un APK n'a pas de serveur Metro pour deviner l'IP.
//   2. Variable d'env de build EXPO_PUBLIC_GAME_SERVER.
//   3. IP détectée depuis Metro (la même que le QR code) — uniquement en DEV/LAN.

const GAME_PORT = 8787;
const STORE_KEY = 'aov.gameServer';

// En DEV (Expo Go / dev client), hostUri ressemble à "192.168.1.20:8081".
function deriveFromMetro(): string {
  const fromExpo = Constants.expoConfig?.hostUri;
  const fromGo = (Constants as unknown as { expoGoConfig?: { hostUri?: string } }).expoGoConfig?.hostUri;
  const host = (fromExpo || fromGo || '').split(':')[0];
  if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) return `ws://${host}:${GAME_PORT}`;
  return '';
}

// Défaut (sans saisie manuelle) : env de build, sinon IP Metro.
export const DETECTED_DEFAULT = process.env.EXPO_PUBLIC_GAME_SERVER || deriveFromMetro();

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

// Accepte une IP ("192.168.1.20"), un host, "host:port" ou une URL ws complète.
// Normalise vers ws://host:8787.
export function normalizeServer(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (/^wss?:\/\//i.test(s)) return s;
  return `ws://${s.includes(':') ? s : `${s}:${GAME_PORT}`}`;
}

export async function setGameServer(input: string): Promise<string> {
  const url = normalizeServer(input);
  override = url;
  if (url) await AsyncStorage.setItem(STORE_KEY, url).catch(() => {});
  else await AsyncStorage.removeItem(STORE_KEY).catch(() => {});
  return url;
}
