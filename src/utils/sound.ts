import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// Gestion centralisée des effets sonores du jeu.
// - Crash-safe : tout est encapsulé dans des try/catch, donc l'absence de module
//   natif (ex : web) ou une erreur de lecture ne casse jamais le jeu.
// - Interrupteur global persistant : l'utilisateur peut couper tous les sons.
const STORE_KEY = 'sound.enabled.v1';

const SOURCES = {
  tick: require('../../assets/sfx/tick.wav'),
  spin: require('../../assets/sfx/spin.wav'),
  win: require('../../assets/sfx/win.wav'),
  click: require('../../assets/sfx/click.wav'),
  confirm: require('../../assets/sfx/confirm.wav'),
  buzz: require('../../assets/sfx/buzz.wav'),
} as const;

type Sfx = keyof typeof SOURCES;

// Musique de fond (accueil + salons), jouée en boucle à bas volume.
const MUSIC_SOURCE = require('../../assets/music/verite-frappe-fort.mp3');

let enabled = true;
let ready = false;
const players: Partial<Record<Sfx, AudioPlayer>> = {};
const listeners = new Set<(v: boolean) => void>();

let music: AudioPlayer | null = null;
let musicWanted = false; // un écran "accueil/salon" souhaite la musique

// À appeler une fois au démarrage de l'app.
export async function initSound(): Promise<void> {
  if (ready) return;
  try {
    const saved = await AsyncStorage.getItem(STORE_KEY);
    if (saved != null) enabled = saved === '1';
  } catch {}
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    players.tick = createAudioPlayer(SOURCES.tick);
    players.spin = createAudioPlayer(SOURCES.spin);
    players.win = createAudioPlayer(SOURCES.win);
    players.click = createAudioPlayer(SOURCES.click);
    players.confirm = createAudioPlayer(SOURCES.confirm);
    players.buzz = createAudioPlayer(SOURCES.buzz);
    if (players.tick) players.tick.volume = 0.5;
    if (players.spin) players.spin.volume = 0.5;
    if (players.win) players.win.volume = 0.75;
    if (players.click) players.click.volume = 0.28; // discret : joué à chaque bouton
    if (players.confirm) players.confirm.volume = 0.6;
    if (players.buzz) players.buzz.volume = 0.55;
    music = createAudioPlayer(MUSIC_SOURCE);
    music.loop = true;
    music.volume = 0.32;
    ready = true;
    // Si un écran a déjà demandé la musique avant la fin du chargement.
    if (musicWanted && enabled) {
      try {
        music.play();
      } catch {}
    }
  } catch {
    // Audio indisponible : on garde des no-ops silencieux.
  }
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export async function setSoundEnabled(value: boolean): Promise<void> {
  enabled = value;
  listeners.forEach((l) => l(value));
  // Le bouton muet coupe aussi la musique de fond (et la reprend si réactivé).
  try {
    if (!value) music?.pause();
    else if (musicWanted) music?.play();
  } catch {}
  try {
    await AsyncStorage.setItem(STORE_KEY, value ? '1' : '0');
  } catch {}
}

export function toggleSound(): void {
  setSoundEnabled(!enabled);
}

// Permet aux composants UI (bouton muet) de réagir au changement.
export function subscribeSound(listener: (v: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function play(name: Sfx): void {
  if (!enabled || !ready) return;
  const p = players[name];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {}
}

export const playTick = (): void => play('tick');
export const playSpin = (): void => play('spin');
export const playWin = (): void => play('win');
export const playClick = (): void => play('click');
export const playConfirm = (): void => play('confirm');
export const playBuzz = (): void => play('buzz');

// Musique de fond. startMusic() est idempotent (ne redémarre pas si déjà en
// cours), donc passer accueil -> salon ne coupe pas la musique. Les écrans de
// jeu appellent stopMusic().
export function startMusic(): void {
  musicWanted = true;
  if (!enabled || !ready || !music) return;
  try {
    if (!music.playing) music.play();
  } catch {}
}

export function stopMusic(): void {
  musicWanted = false;
  try {
    music?.pause();
    music?.seekTo(0);
  } catch {}
}
