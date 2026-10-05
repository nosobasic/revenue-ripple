import { supabase } from '../supabase/client';
import { getApiBase } from '../config/constants';

// Scope the bearer token to the configured backend; never attach it elsewhere.
export async function authenticatedFetch(url, options = {}) {
  const backend = new URL(getApiBase(), window.location.origin);
  const target = new URL(url, backend);
  if (target.origin !== backend.origin) throw new Error('Unexpected API destination');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw new Error('Please sign in to continue.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  headers.delete('x-user-role');
  return fetch(target.href, { ...options, headers });
}
