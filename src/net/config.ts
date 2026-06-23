// ── Configuration Supabase (pour le mode EN LIGNE) ───────────────────────────
//
// 1. Crée un projet gratuit sur https://supabase.com (Project → New).
// 2. Settings → Data API : copie "Project URL" et la clé "anon / public".
// 3. Colle-les ci-dessous. (La clé "anon" est publique, pas de secret ici.)
//
// Le mode en ligne utilise uniquement Supabase Realtime (broadcast + presence),
// aucune table ni configuration de base de données n'est nécessaire.
//
// Astuce : tu peux aussi les définir via la variable d'env EXPO_PUBLIC_SUPABASE_URL
// / EXPO_PUBLIC_SUPABASE_ANON_KEY (elles ont la priorité si présentes).

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
