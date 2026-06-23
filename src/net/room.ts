import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GameState } from '../types';
import type { OnlineAction } from '../game/onlineReducer';
import { getSupabase } from './supabase';

export type RoomStatus = 'connecting' | 'connected' | 'error' | 'closed';

type Me = { id: string; name: string; isHost: boolean };

type Handlers = {
  onState?: (state: GameState) => void; // clients receive snapshots
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

const channelName = (code: string) => `aov-${code.toUpperCase()}`;

export function joinRoom(code: string, me: Me, handlers: Handlers): Room {
  const supabase = getSupabase();
  const channel: RealtimeChannel = supabase.channel(channelName(code), {
    config: { broadcast: { self: false }, presence: { key: me.id } },
  });

  channel.on('broadcast', { event: 'state' }, ({ payload }) => {
    handlers.onState?.(payload.state as GameState);
  });
  channel.on('broadcast', { event: 'hello' }, ({ payload }) => {
    handlers.onHello?.(payload.id as string, payload.name as string);
  });
  channel.on('broadcast', { event: 'action' }, ({ payload }) => {
    handlers.onAction?.(payload.id as string, payload.action as OnlineAction);
  });
  channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
    for (const p of leftPresences as Array<{ id?: string }>) {
      if (p.id) handlers.onLeave?.(p.id);
    }
  });

  const sendHello = () => {
    channel.send({ type: 'broadcast', event: 'hello', payload: { id: me.id, name: me.name } });
  };

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      handlers.onStatus?.('connected');
      channel.track({ id: me.id, name: me.name });
      if (!me.isHost) sendHello();
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      handlers.onStatus?.('error');
    } else if (status === 'CLOSED') {
      handlers.onStatus?.('closed');
    }
  });

  return {
    broadcastState: (state) => {
      channel.send({ type: 'broadcast', event: 'state', payload: { state } });
    },
    sendHello,
    sendAction: (action) => {
      channel.send({ type: 'broadcast', event: 'action', payload: { id: me.id, action } });
    },
    leave: () => {
      supabase.removeChannel(channel);
    },
  };
}
