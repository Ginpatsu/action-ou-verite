import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { DareType, GameState, Player } from '../types';
import { computeResult, pickTarget, pickWriter, uid } from './logic';

export const MIN_PLAYERS = 2;
export const MAX_MANCHES = 50;

const initialState: GameState = {
  phase: 'lobby',
  players: [],
  totalManches: 5,
  currentManche: 1,
  turn: null,
  result: null,
};

type Action =
  | { type: 'GO_HOME' }
  | { type: 'GO_LOBBY' }
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'SET_MANCHES'; n: number }
  | { type: 'START_GAME' }
  | { type: 'SPIN_TARGET' }
  | { type: 'TARGET_DONE' }
  | { type: 'CHOOSE_TYPE'; dareType: DareType }
  | { type: 'WRITER_DONE' }
  | { type: 'WRITER_READY' }
  | { type: 'SET_DARE'; text: string }
  | { type: 'HAND_BACK_DONE' }
  | { type: 'GO_JUDGE_HANDOFF' }
  | { type: 'JUDGE_READY' }
  | { type: 'SET_VERDICT'; refused: boolean }
  | { type: 'NEXT' }
  | { type: 'PLAY_AGAIN' };

function reassignChef(players: Player[]): Player[] {
  if (players.length === 0 || players.some((p) => p.isChef)) return players;
  return players.map((p, i) => ({ ...p, isChef: i === 0 }));
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO_HOME':
      return { ...initialState };

    case 'GO_LOBBY':
      return { ...state, phase: 'lobby' };

    case 'ADD_PLAYER': {
      const name = action.name.trim();
      if (!name) return state;
      const player: Player = {
        id: uid(),
        name,
        malus: 0,
        isChef: state.players.length === 0,
      };
      return { ...state, players: [...state.players, player] };
    }

    case 'REMOVE_PLAYER': {
      const players = reassignChef(state.players.filter((p) => p.id !== action.id));
      return { ...state, players };
    }

    case 'SET_MANCHES':
      return { ...state, totalManches: Math.max(1, Math.min(MAX_MANCHES, Math.round(action.n))) };

    case 'START_GAME': {
      if (state.players.length < MIN_PLAYERS) return state;
      const players = state.players.map((p) => ({ ...p, malus: 0 }));
      return { ...state, players, currentManche: 1, turn: null, result: null, phase: 'turnIntro' };
    }

    case 'SPIN_TARGET': {
      const targetId = pickTarget(state.players);
      return {
        ...state,
        phase: 'playerRoulette',
        turn: { manche: state.currentManche, targetId, type: null, writerId: null, dare: null, refused: null },
      };
    }

    case 'TARGET_DONE':
      return { ...state, phase: 'chooseType' };

    case 'CHOOSE_TYPE': {
      if (!state.turn) return state;
      const writerId = pickWriter(state.players, state.turn.targetId);
      return { ...state, phase: 'writerRoulette', turn: { ...state.turn, type: action.dareType, writerId } };
    }

    case 'WRITER_DONE':
      return { ...state, phase: 'writerHandoff' };

    case 'WRITER_READY':
      return { ...state, phase: 'writeDare' };

    case 'SET_DARE': {
      if (!state.turn) return state;
      const text = action.text.trim();
      if (!text) return state;
      return { ...state, phase: 'handBack', turn: { ...state.turn, dare: text } };
    }

    case 'HAND_BACK_DONE':
      return { ...state, phase: 'reveal' };

    case 'GO_JUDGE_HANDOFF':
      return { ...state, phase: 'judgeHandoff' };

    case 'JUDGE_READY':
      return { ...state, phase: 'judge' };

    case 'SET_VERDICT': {
      if (!state.turn) return state;
      const players = action.refused
        ? state.players.map((p) => (p.id === state.turn!.targetId ? { ...p, malus: p.malus + 1 } : p))
        : state.players;
      return { ...state, players, phase: 'turnResult', turn: { ...state.turn, refused: action.refused } };
    }

    case 'NEXT': {
      if (state.currentManche < state.totalManches) {
        return { ...state, currentManche: state.currentManche + 1, turn: null, phase: 'turnIntro' };
      }
      return { ...state, result: computeResult(state.players), phase: 'finale' };
    }

    case 'PLAY_AGAIN': {
      const players = state.players.map((p) => ({ ...p, malus: 0 }));
      return { ...state, players, currentManche: 1, turn: null, result: null, phase: 'turnIntro' };
    }

    default:
      return state;
  }
}

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  // Convenience selectors
  playerById: (id: string | null | undefined) => Player | undefined;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      playerById: (id) => state.players.find((p) => p.id === id),
    }),
    [state]
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
