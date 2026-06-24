import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { GameState } from '../types';
import { initialOnlineState, onlineReducer, type OnlineAction } from '../game/onlineReducer';
import { joinRoom, type Room, type RoomStatus } from '../net/room';
import { gameServerConfigured, getGameServer, loadGameServer, setGameServer } from '../net/config';
import { getAccountId, savePseudo } from '../utils/identity';

type Session = { code: string; isHost: boolean; myId: string; myName: string };

type OnlineValue = {
  configured: boolean;
  serverUrl: string;
  setServer: (input: string) => void;
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
  const [configured, setConfigured] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

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

  // Charge l'adresse serveur persistée (ou détectée) au démarrage.
  useEffect(() => {
    loadGameServer().then(() => {
      setConfigured(gameServerConfigured());
      setServerUrl(getGameServer());
    });
  }, []);

  // Enregistre une adresse serveur saisie dans l'app (utile en build).
  const setServer = useCallback(async (input: string) => {
    const url = await setGameServer(input);
    setServerUrl(url);
    setConfigured(url.length > 0);
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

  // Paramètres de la dernière connexion, pour se reconnecter au retour dans l'app.
  const connectParamsRef = useRef<{ code: string; name: string; id: string; isHost: boolean } | null>(null);

  // (Ré)ouvre le canal réseau pour ces paramètres et câble les handlers.
  const openChannel = useCallback(
    (p: { code: string; name: string; id: string; isHost: boolean }) => {
      roomRef.current?.leave();
      setStatus('connecting');
      if (p.isHost) {
        roomRef.current = joinRoom(
          p.code,
          { id: p.id, name: p.name, isHost: true },
          {
            onStatus: (s) => {
              setStatus(s);
              // À chaque (re)connexion l'hôte renvoie l'état courant -> resync des clients.
              if (s === 'connected' && stateRef.current) roomRef.current?.broadcastState(stateRef.current);
            },
            onHello: (id, n) => {
              hostApply({ type: 'ADD_PLAYER', id, name: n });
              if (stateRef.current) roomRef.current?.broadcastState(stateRef.current);
            },
            onAction: (_id, action) => hostApply(action),
            onLeave: (id) => hostApply({ type: 'REMOVE_PLAYER', id }),
          }
        );
      } else {
        roomRef.current = joinRoom(
          p.code,
          { id: p.id, name: p.name, isHost: false },
          {
            onStatus: setStatus,
            onState: (s) => {
              stateRef.current = s;
              setState(s);
            },
          }
        );
      }
    },
    [hostApply]
  );

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
      connectParamsRef.current = { code, name: safeName, id: myId, isHost: true };
      openChannel(connectParamsRef.current);
    },
    [openChannel]
  );

  const join = useCallback(
    async (code: string, name: string) => {
      const myId = accountIdRef.current ?? (await getAccountId());
      const safeName = name.trim() || 'Joueur';
      savePseudo(safeName);
      isHostRef.current = false;
      stateRef.current = null;
      setState(null);
      const upper = code.toUpperCase();
      setSession({ code: upper, isHost: false, myId, myName: safeName });
      connectParamsRef.current = { code: upper, name: safeName, id: myId, isHost: false };
      openChannel(connectParamsRef.current);
    },
    [openChannel]
  );

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
    connectParamsRef.current = null;
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

  // Au retour dans l'app (foreground), on relance la connexion : le WebSocket est
  // souvent coupé en arrière-plan, ce qui bloquait la partie quand on revenait.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active' && connectParamsRef.current) openChannel(connectParamsRef.current);
    });
    return () => sub.remove();
  }, [openChannel]);

  const value: OnlineValue = {
    configured,
    serverUrl,
    setServer,
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
