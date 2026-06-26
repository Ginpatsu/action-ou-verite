import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { GameState } from '../types';
import { initialOnlineState, onlineReducer, type OnlineAction } from '../game/onlineReducer';
import { connectRoom, type Room, type RoomStatus } from '../net/room';
import { gameServerConfigured, getGameServer, loadGameServer, setGameServer } from '../net/config';
import { getAccountId, savePseudo } from '../utils/identity';

type Session = { code: string; isHost: boolean; myId: string; myName: string };
type ConnectParams = { id: string; name: string; isHost: boolean; code?: string };

type OnlineValue = {
  configured: boolean;
  serverUrl: string;
  setServer: (input: string) => void;
  session: Session | null;
  state: GameState | null;
  status: RoomStatus;
  error: string | null;
  myId: string | null;
  isHost: boolean;
  createRoom: (name: string) => void;
  join: (code: string, name: string) => void;
  act: (action: OnlineAction) => void;
  leave: () => void;
  playerById: (id: string | null | undefined) => GameState['players'][number] | undefined;
};

const Ctx = createContext<OnlineValue | null>(null);

// Délai avant de retirer pour de bon un joueur déconnecté (veille / app en
// arrière-plan). En deçà, on le garde dans la partie : s'il revient, il reprend
// sa place. Au-delà, on considère qu'il a abandonné.
const REMOVE_AFTER_MS = 10 * 60 * 1000; // 10 minutes

export function OnlineProvider({ onExit, children }: { onExit: () => void; children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  const roomRef = useRef<Room | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const isHostRef = useRef(false);
  const accountIdRef = useRef<string | null>(null);
  const connectParamsRef = useRef<ConnectParams | null>(null);
  // Retraits différés en attente, par id de joueur (hôte uniquement).
  const removalTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Identifiant de compte persistant.
  useEffect(() => {
    getAccountId().then((id) => {
      accountIdRef.current = id;
    });
  }, []);

  // Adresse serveur persistée (ou détectée).
  useEffect(() => {
    loadGameServer().then(() => {
      setConfigured(gameServerConfigured());
      setServerUrl(getGameServer());
    });
  }, []);

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

  // Annule un retrait programmé (le joueur est revenu à temps).
  const cancelRemoval = useCallback((id: string) => {
    const t = removalTimers.current.get(id);
    if (t) {
      clearTimeout(t);
      removalTimers.current.delete(id);
    }
  }, []);

  // Programme le retrait d'un joueur après le délai d'inactivité, plutôt que de
  // le virer dès la déconnexion (veille/arrière-plan coupent le socket).
  const scheduleRemoval = useCallback(
    (id: string) => {
      cancelRemoval(id);
      const t = setTimeout(() => {
        removalTimers.current.delete(id);
        hostApply({ type: 'REMOVE_PLAYER', id });
      }, REMOVE_AFTER_MS);
      removalTimers.current.set(id, t);
    },
    [cancelRemoval, hostApply]
  );

  // (Ré)ouvre la connexion Socket.io pour ces paramètres et câble les handlers.
  const openChannel = useCallback(
    (p: ConnectParams) => {
      roomRef.current?.leave();
      setStatus('connecting');
      roomRef.current = connectRoom(p, {
        onStatus: (s) => {
          setStatus(s);
          // À chaque (re)connexion, l'hôte renvoie l'état courant -> resync des clients.
          if (s === 'connected' && p.isHost && stateRef.current) roomRef.current?.broadcastState(stateRef.current);
        },
        onCode: (code) => {
          p.code = code;
          setSession((prev) => (prev ? { ...prev, code } : prev));
        },
        onError: (err) => {
          setError(err);
          setStatus('error');
        },
        onHello: p.isHost
          ? (id, n) => {
              cancelRemoval(id); // de retour à temps : on annule un retrait en attente
              hostApply({ type: 'ADD_PLAYER', id, name: n });
              if (stateRef.current) roomRef.current?.broadcastState(stateRef.current);
            }
          : undefined,
        onAction: p.isHost ? (_id, action) => hostApply(action) : undefined,
        // Déconnexion (veille / app fermée) : on diffère le retrait. S'il revient
        // avant l'échéance, onHello annule ; sinon il est retiré au bout de 10 min.
        onLeave: p.isHost ? (id) => scheduleRemoval(id) : undefined,
        onState: !p.isHost
          ? (s) => {
              stateRef.current = s;
              setState(s);
            }
          : undefined,
      });
    },
    [hostApply, cancelRemoval, scheduleRemoval]
  );

  const createRoom = useCallback(
    async (name: string) => {
      const myId = accountIdRef.current ?? (await getAccountId());
      const safeName = name.trim() || 'Chef';
      savePseudo(safeName);
      const initial = initialOnlineState({ id: myId, name: safeName });
      isHostRef.current = true;
      stateRef.current = initial;
      setState(initial);
      setError(null);
      // Le code est attribué par le serveur (onCode) ; vide en attendant.
      setSession({ code: '', isHost: true, myId, myName: safeName });
      connectParamsRef.current = { id: myId, name: safeName, isHost: true };
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
      setError(null);
      const clean = code.trim();
      setSession({ code: clean, isHost: false, myId, myName: safeName });
      connectParamsRef.current = { id: myId, name: safeName, isHost: false, code: clean };
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
    removalTimers.current.forEach(clearTimeout);
    removalTimers.current.clear();
    roomRef.current?.leave();
    roomRef.current = null;
    stateRef.current = null;
    isHostRef.current = false;
    connectParamsRef.current = null;
    setSession(null);
    setState(null);
    setError(null);
    onExit();
  }, [onExit]);

  // L'hôte avance automatiquement les roulettes pour garder tous les tels synchros.
  const phase = state?.phase;
  useEffect(() => {
    if (!isHostRef.current) return;
    // Laisse le temps de l'animation (~3,2 s) + un battement pour savourer le
    // résultat avant d'enchaîner.
    if (phase === 'playerRoulette') {
      const t = setTimeout(() => hostApply({ type: 'TARGET_DONE' }), 4400);
      return () => clearTimeout(t);
    }
    if (phase === 'writerRoulette') {
      const t = setTimeout(() => hostApply({ type: 'WRITER_DONE' }), 4400);
      return () => clearTimeout(t);
    }
  }, [phase, hostApply]);

  // Ferme la connexion si le provider est démonté.
  useEffect(
    () => () => {
      removalTimers.current.forEach(clearTimeout);
      removalTimers.current.clear();
      roomRef.current?.leave();
    },
    []
  );

  // Au retour dans l'app (foreground), on relance la connexion (socket souvent
  // coupé en arrière-plan). socket.io reconnecte aussi seul, ceci accélère.
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
    error,
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
