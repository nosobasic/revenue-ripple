import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch } from '../lib/authenticatedFetch';
import { getApiBase } from '../config/constants';
import { retentionMessage, visibleRetentionState } from '../lib/retentionState';

// No localStorage/query cache. A prior account's response is never rendered.
export function useRetentionContent(kind, id = '') {
  const { user, session, loading: authLoading } = useAuth();
  const identity = user?.id || '';
  const token = session?.access_token || '';
  const key = `${identity}:${kind}:${id}`;
  const [state, setState] = useState({ key: '', data: null, loading: true, error: null });
  useEffect(() => {
    let active = true, generation = 0, timer, controller;
    const load = async () => {
      const current = ++generation;
      controller?.abort(); clearTimeout(timer);
      setState({ key, data: null, loading: true, error: null });
      if (authLoading) return;
      if (!identity || !token) {
        setState({ key, data: null, loading: false, error: new Error(retentionMessage(401)) }); return;
      }
      controller = new AbortController();
      try {
        const suffix = kind === 'briefings' ? 'briefings' : `playbooks${id ? `/${encodeURIComponent(id)}` : ''}`;
        const response = await authenticatedFetch(`${getApiBase()}/api/vault/${suffix}`,
          { signal: controller.signal, cache: 'no-store' });
        const body = await response.json();
        if (!response.ok || body.success !== true) throw new Error(retentionMessage(response.status, body.code));
        const expires = body.access?.valid_until ? Date.parse(body.access.valid_until) : Infinity;
        if (body.access?.state !== 'allowed' || Number.isNaN(expires) || expires <= Date.now())
          throw new Error(retentionMessage(503));
        if (!active || current !== generation) return;
        setState({ key, token, data: id ? body.playbook : body[kind], loading: false, error: null, expires });
        // Expiry boundary and focus refresh clear bodies before revalidation.
        timer = setTimeout(load, Math.min(30000, Math.max(0, expires - Date.now())));
      } catch (error) {
        if (active && current === generation && error.name !== 'AbortError')
          setState({ key, data: null, loading: false, error });
      }
    };
    const focus = () => { if (document.visibilityState === 'visible') load(); };
    load(); window.addEventListener('focus', focus); document.addEventListener('visibilitychange', focus);
    return () => { active = false; generation++; clearTimeout(timer); controller?.abort();
      window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', focus); };
  }, [key, identity, token, authLoading, kind, id]);
  return visibleRetentionState(state, key, token, authLoading, Date.now());
}
