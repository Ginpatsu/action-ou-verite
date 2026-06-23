import type { GameState } from '../types';
import type { OnlineAction } from '../game/onlineReducer';
import { GAME_SERVER } from './config';

export type RoomStatus = 'connecting' | 'connected' | 'error' | 'closed';

type Me = { id: string; name: string; isHost: boolean };

type Handlers = {
  onState?: (state: GameState) => void; // clients receive snapshots from the host
  onHello?: (id: string, name: string) => void; // host: a client announced itself
  onAction?: (id: string, action: OnlineAction) => void; // host: a client action
  onLeave?: (id: string) => void; // host: a device disconnected
  onStatus?: (status: RoomStatus) => void;
};

export type Room = {
  broadcastState: (state: GameState) => void;
  sendHello: () => void;
  sendAction: (action: OnlineAction) => void;
  leave: () => void;
};

// Connects to the WebSocket relay (./server) for a given room code.
// The server just forwards every message to the OTHER members of the room.
export function joinRoom(code: string, me: Me, handlers: Handlers): Room {
  const qs =
    `room=${encodeURIComponent(code.toUpperCase())}` +
    `&id=${encodeURIComponent(me.id)}` +
    `&name=${encodeURIComponent(me.name)}`;
  const ws = new WebSocket(`${GAME_SERVER}?${qs}`);

  const send = (event: string, payload: unknown) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ event, payload }));
  };
  const sendHello = () => send('hello', { id: me.id, name: me.name });

  ws.onopen = () => {
    handlers.onStatus?.('connected');
    if (!me.isHost) sendHello();
  };
  ws.onerror = () => handlers.onStatus?.('error');
  ws.onclose = () => handlers.onStatus?.('closed');
  ws.onmessage = (ev) => {
    let msg: { event?: string; payload?: any };
    try {
      msg = JSON.parse(typeof ev.data === 'string' ? ev.data : '');
    } catch {
      return;
    }
    switch (msg.event) {
      case 'state':
        handlers.onState?.(msg.payload.state as GameState);
        break;
      case 'hello':
        handlers.onHello?.(msg.payload.id, msg.payload.name);
        break;
      case 'action':
        handlers.onAction?.(msg.payload.id, msg.payload.action as OnlineAction);
        break;
      case 'leave':
        handlers.onLeave?.(msg.payload.id);
        break;
    }
  };

  return {
    broadcastState: (state) => send('state', { state }),
    sendHello,
    sendAction: (action) => send('action', { id: me.id, action }),
    leave: () => {
      try {
        ws.close();
      } catch {
        // ignore
      }
    },
  };
}
