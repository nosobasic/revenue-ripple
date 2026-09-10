import { createClient } from '@supabase/supabase-js';

let client;

export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY)'
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}

export async function logActivity(supabase, eventType, payload) {
  const { error } = await supabase.from('content_activity_log').insert({
    event_type: eventType,
    payload: payload ?? {},
  });

  if (error) {
    console.error('content_activity_log insert failed:', error.message);
  }
}
