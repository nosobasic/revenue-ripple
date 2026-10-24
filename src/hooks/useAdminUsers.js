import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export function useAdminUsers({ enabled, adminId, pathname, searchTerm, filterStatus }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    let current = true;
    setUsers([]);
    setError(null);
    setLoading(false);
    if (!enabled || !adminId || !/^\/admin\/users\/?$/.test(pathname)) return;
    setLoading(true);
    async function load() {
      try {
        let query = supabase.from('users').select('*');
        if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        if (filterStatus !== 'all') query = query.eq('status', filterStatus);
        const { data, error: queryError } = await query.order('created_at', { ascending: false });
        if (queryError) throw new Error('query_failed');
        if (current) setUsers((data || []).map(user => ({
          id: user.id, name: user.name || 'N/A', email: user.email,
          status: user.status || 'inactive',
          memberSince: new Date(user.created_at).toLocaleDateString(),
          earnings: `$${user.total_earnings || 0}`, role: user.role || 'member',
        })));
      } catch {
        if (current) setError('Unable to load users. Please refresh to try again.');
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => { current = false; };
  }, [enabled, adminId, pathname, searchTerm, filterStatus, revision]);
  return { users, loading, error, refresh };
}
