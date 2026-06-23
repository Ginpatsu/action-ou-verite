import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { GameState } from '../types';
import { initialOnlineState, onlineReducer, type OnlineAction } from '../game/onlineReducer';
import { joinRoom, type Room, type RoomStatus } from '../net/room';
import { serverConfigured } from '../net/config';
import { getAccountId, savePseudo } from '../utils/identity';

type Session = { code: string; isHost: boolean; myId: string; myName: string };

type OnlineValue = {
  configured: boolean;
  session: Session | null;
  state: GameState | null;
  status: RoomStatus;
  myId: string | null;
  isHost: boolean;
  createRoom: (name: string) => void;
  join: (code: string, name: string) => void;
  act: (action: OnlineAction) => void;
  leave: () => void;
  playerById: (id: string | null | undefined) => GameState['players'][number] | undefined;
};

const Ctx = createContext<OnlineValue | null>(null);

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function OnlineProvider({ onExit, children }: { onExit: () => void; children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<RoomStatus>('connecting');

  const roomRef = useRef<Room | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const isHostRef = useRef(false);
  const accountIdRef = useRef<string | null>(null);

  // Charge l'identifiant de compte persistant au montage.
  useEffect(() => {
    getAccountId().then((id) => {
      accountIdRef.current = id;
    });
  }, []);

  const setAuthoritative = (next: GameState) => {
    stateRef.current = next;
    setState(next);
    roomRef.current?.broadcastState(next);
  };

  const hostApply = useCallback((action: OnlineAction) => {
    if (!stateRef.current) return;
    setAuthoritative(onlineReducer(stateRef.current, action));
  }, []);

  const createRoom = useCallback(
    async (name: string) => {
      const myId = accountIdRef.current ?? (await getAccountId());
      const code = makeCode();
      const safeName = name.trim() || 'Chef';
      savePseudo(safeName);
      const initial = initialOnlineState({ id: myId, name: safeName });
      isHostRef.current = true;
      stateRef.current = initial;
      setState(initial);
      setSession({ code, isHost: true, myId, myName: safeName });
      setStatus('connecting');
      roomRef.current = joinRoom(
        code,
        { id: myId, name: safeName, isHost: true },
        {
          onStatus: setStatus,
          onHello: (id, n) => {
            hostApply({ type: 'ADD_PLAYER', id, name: n });
            // Always re-send current snapshot so the newcomer syncs immediately.
            if (stateRef.current) roomRef.current?.broadcastState(stateRef.current);
          },
          onAction: (_id, action) => hostApply(action),
          onLeave: (id) => hostApply({ type: 'REMOVE_PLAYER', id }),
        }
      );
    },
    [hostApply]
  );

  const join = useCallback(async (code: string, name: string) => {
    const myId = accountIdRef.current ?? (await getAccountId());
    const safeName = name.trim() || 'Joueur';
    savePseudo(safeName);
    isHostRef.current = false;
    stateRef.current = null;
    setState(null);
    setSession({ code: code.toUpperCase(), isHost: false, myId, myName: safeName });
    setStatus('connecting');
    roomRef.current = joinRoom(
      code,
      { id: myId, name: safeName, isHost: false },
      {
        onStatus: setStatus,
        onState: (s) => {
          stateRef.current = s;
          setState(s);
        },
      }
    );
  }, []);

  const act = useCallback(
    (action: OnlineAction) => {
      if (isHostRef.current) hostApply(action);
      else roomRef.current?.sendAction(action);
    },
    [hostApply]
  );

  const leave = useCallback(() => {
    roomRef.current?.leave();
    roomRef.current = null;
    stateRef.current = null;
    isHostRef.current = false;
    setSession(null);
    setState(null);
    onExit();
  }, [onExit]);

  // Host keeps all phones in sync by auto-advancing the roulette animations.
  const phase = state?.phase;
  useEffect(() => {
    if (!isHostRef.current) return;
    if (phase === 'playerRoulette') {
      const t = setTimeout(() => hostApply({ type: 'TARGET_DONE' }), 3800);
      return () => clearTimeout(t);
    }
    if (phase === 'writerRoulette') {
      const t = setTimeout(() => hostApply({ type: 'WRITER_DONE' }), 3800);
      return () => clearTimeout(t);
    }
  }, [phase, hostApply]);

  // Clean up the channel if the provider unmounts.
  useEffect(() => () => roomRef.current?.leave(), []);

  const value: OnlineValue = {
    configured: serverConfigured,
    session,
    state,
    status,
    myId: session?.myId ?? null,
    isHost: session?.isHost ?? false,
    createRoom,
    join,
    act,
    leave,
    playerById: (id) => state?.players.find((p) => p.id === id),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnline(): OnlineValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOnline must be used within an OnlineProvider');
  return ctx;
}
