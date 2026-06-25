import { io, type Socket } from 'socket.io-client';
import type { GameState } from '../types';
import type { OnlineAction } from '../game/onlineReducer';
import { getGameServer } from './config';

export type RoomStatus = 'connecting' | 'connected' | 'error' | 'closed';

// Paramètres de connexion. `code` est absent quand l'hôte CRÉE (le serveur le
// génère), présent quand on REJOINT ou que l'hôte se reconnecte (rehost).
type Params = { id: string; name: string; isHost: boolean; code?: string };

type Handlers = {
  onStatus?: (s: RoomStatus) => void;
  onState?: (state: GameState) => void; // clients : snapshot reçu de l'hôte
  onHello?: (id: string, name: string) => void; // hôte : un joueur a rejoint
  onAction?: (id: string, action: OnlineAction) => void; // hôte : action d'un client
  onLeave?: (id: string) => void; // hôte : un joueur s'est déconnecté
  onCode?: (code: string) => void; // hôte : code attribué par le serveur
  onError?: (err: string) => void; // join : room introuvable / pleine
};

export type Room = {
  broadcastState: (state: GameState) => void;
  sendAction: (action: OnlineAction) => void;
  leave: () => void;
};

// Ouvre une connexion Socket.io et câble les événements du jeu.
// socket.io-client gère seul la reconnexion et le "cold start" (réveil du
// serveur gratuit) : il réémet 'connect' une fois le serveur réveillé.
export function connectRoom(params: Params, handlers: Handlers): Room {
  const socket: Socket = io(getGameServer(), {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  // À chaque (re)connexion : l'hôte crée/reprend son salon, le client rejoint.
  const register = () => {
    if (params.isHost && !params.code) {
      socket.emit('create', { id: params.id, name: params.name }, (res: { code?: string; error?: string }) => {
        if (res && res.code) {
          params.code = res.code;
          handlers.onCode?.(res.code);
        } else {
          handlers.onError?.((res && res.error) || 'create-failed');
        }
      });
    } else if (params.isHost && params.code) {
      socket.emit('rehost', { id: params.id, name: params.name, code: params.code });
    } else {
      socket.emit('join', { id: params.id, name: params.name, code: params.code }, (res: { ok?: boolean; error?: string }) => {
        if (!res || !res.ok) handlers.onError?.((res && res.error) || 'join-failed');
      });
    }
  };

  socket.on('connect', () => {
    handlers.onStatus?.('connected');
    register();
  });
  socket.on('connect_error', () => handlers.onStatus?.('connecting')); // cold start : on réessaie
  socket.on('disconnect', () => handlers.onStatus?.('closed'));
  socket.on('state', (s: GameState) => handlers.onState?.(s));
  socket.on('hello', (p: { id: string; name: string }) => handlers.onHello?.(p.id, p.name));
  socket.on('action', (p: { id: string; action: OnlineAction }) => handlers.onAction?.(p.id, p.action));
  socket.on('peer-left', (p: { id: string }) => handlers.onLeave?.(p.id));

  return {
    broadcastState: (state) => socket.emit('state', state),
    sendAction: (action) => socket.emit('action', action),
    leave: () => {
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
}
