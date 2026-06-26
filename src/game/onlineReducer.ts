import type { DareType, GameState, Player } from '../types';
import { computeResult, pickTargetWeighted, pickWriter, pushRecent } from './logic';


export const MIN_PLAYERS_ONLINE = 2;
export const MAX_PLAYERS_ONLINE = 12;
export const MAX_MANCHES = 50;

// Actions exchanged in online mode. The host is authoritative: it applies every
// action (its own + those received from clients) and broadcasts the new state.
// Online skips the pass-the-phone handoff phases (each player has their own phone),
// and the writer judges directly from the reveal screen.
export type OnlineAction =
  | { type: 'ADD_PLAYER'; id: string; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'SET_MANCHES'; n: number }
  | { type: 'START_GAME' }
  | { type: 'SPIN_TARGET' }
  | { type: 'TARGET_DONE' }
  | { type: 'CHOOSE_TYPE'; dareType: DareType }
  | { type: 'WRITER_DONE' }
  | { type: 'SET_DARE'; text: string }
  | { type: 'SET_VERDICT'; refused: boolean }
  | { type: 'NEXT' }
  | { type: 'PLAY_AGAIN' };

export function initialOnlineState(host: { id: string; name: string }): GameState {
  return {
    phase: 'lobby',
    players: [{ id: host.id, name: host.name, malus: 0, isChef: true }],
    totalManches: 10,
    currentManche: 1,
    turn: null,
    result: null,
  };
}

function reassignChef(players: Player[]): Player[] {
  if (players.length === 0 || players.some((p) => p.isChef)) return players;
  return players.map((p, i) => ({ ...p, isChef: i === 0 }));
}

export function onlineReducer(state: GameState, action: OnlineAction): GameState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      if (state.phase !== 'lobby') return state;
      const name = action.name.trim();
      if (!name || state.players.some((p) => p.id === action.id)) return state;
      if (state.players.length >= MAX_PLAYERS_ONLINE) return state; // 12 joueurs max
      // Pseudo unique (insensible à la casse) — garde côté hôte.
      if (state.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return state;
      return { ...state, players: [...state.players, { id: action.id, name, malus: 0, isChef: false }] };
    }

    case 'REMOVE_PLAYER':
      return { ...state, players: reassignChef(state.players.filter((p) => p.id !== action.id)) };

    case 'SET_MANCHES':
      return { ...state, totalManches: Math.max(1, Math.min(MAX_MANCHES, Math.round(action.n))) };

    case 'START_GAME': {
      if (state.players.length < MIN_PLAYERS_ONLINE) return state;
      return {
        ...state,
        players: state.players.map((p) => ({ ...p, malus: 0 })),
        currentManche: 1,
        turn: null,
        result: null,
        recentTargets: [],
        phase: 'turnIntro',
      };
    }

    case 'SPIN_TARGET': {
      if (state.phase !== 'turnIntro') return state;
      const targetId = pickTargetWeighted(state.players, state.recentTargets);
      return {
        ...state,
        phase: 'playerRoulette',
        recentTargets: pushRecent(state.recentTargets, targetId, state.players.length),
        turn: { manche: state.currentManche, targetId, type: null, writerId: null, dare: null, refused: null },
      };
    }

    case 'TARGET_DONE':
      return state.phase === 'playerRoulette' ? { ...state, phase: 'chooseType' } : state;

    case 'CHOOSE_TYPE': {
      if (state.phase !== 'chooseType' || !state.turn) return state;
      const writerId = pickWriter(state.players, state.turn.targetId);
      return { ...state, phase: 'writerRoulette', turn: { ...state.turn, type: action.dareType, writerId } };
    }

    case 'WRITER_DONE':
      return state.phase === 'writerRoulette' ? { ...state, phase: 'writeDare' } : state;

    case 'SET_DARE': {
      if (state.phase !== 'writeDare' || !state.turn) return state;
      const text = action.text.trim();
      if (!text) return state;
      return { ...state, phase: 'reveal', turn: { ...state.turn, dare: text } };
    }

    case 'SET_VERDICT': {
      if (state.phase !== 'reveal' || !state.turn) return state;
      const players = action.refused
        ? state.players.map((p) => (p.id === state.turn!.targetId ? { ...p, malus: p.malus + 1 } : p))
        : state.players;
      return { ...state, players, phase: 'turnResult', turn: { ...state.turn, refused: action.refused } };
    }

    case 'NEXT': {
      if (state.phase !== 'turnResult') return state;
      if (state.currentManche < state.totalManches) {
        // On enchaîne directement sur la roulette (plus d'écran intermédiaire).
        const nextManche = state.currentManche + 1;
        const recent = state.recentTargets ?? [];
        const targetId = pickTargetWeighted(state.players, recent);
        return {
          ...state,
          currentManche: nextManche,
          recentTargets: pushRecent(recent, targetId, state.players.length),
          turn: { manche: nextManche, targetId, type: null, writerId: null, dare: null, refused: null },
          phase: 'playerRoulette',
        };
      }
      return { ...state, result: computeResult(state.players), phase: 'finale' };
    }

    case 'PLAY_AGAIN':
      return {
        ...state,
        players: state.players.map((p) => ({ ...p, malus: 0 })),
        currentManche: 1,
        turn: null,
        result: null,
        recentTargets: [],
        phase: 'turnIntro',
      };

    default:
      return state;
  }
}
