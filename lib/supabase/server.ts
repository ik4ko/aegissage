import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for route handlers.
 *
 * Uses the service role key so /api/contact can insert into `contacts`
 * while the table stays locked down by RLS (no public insert policy). The
 * service role key must never be exposed to the browser — this module is
 * `server-only` so importing it from a client component is a build error.
 *
 * Returns null when Supabase is not configured, so local development and
 * preview builds work without credentials. Callers must handle null.
 */
export function getServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'aegissage' } },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
