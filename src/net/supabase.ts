import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from './config';

let client: SupabaseClient | null = null;

// Lazily created so the app doesn't crash when Supabase isn't configured yet.
export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error('Supabase non configuré (voir src/net/config.ts)');
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 20 } },
    });
  }
  return client;
}
