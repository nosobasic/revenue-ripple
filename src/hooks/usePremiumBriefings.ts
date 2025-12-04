import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PremiumBriefing } from '../types/content';

interface UsePremiumBriefingsResult {
  data: PremiumBriefing[] | null;
  loading: boolean;
  error: Error | null;
}

export function usePremiumBriefings(): UsePremiumBriefingsResult {
  const [data, setData] = useState<PremiumBriefing[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBriefings() {
      try {
        setLoading(true);
        setError(null);

        // Query with proper ordering: published_at DESC (nulls last), then created_at DESC
        const { data: briefings, error: fetchError } = await supabase
          .from('ve_content_items')
          .select('*')
          .eq('level', 'member')
          .eq('content_type', 'premium_briefing')
          .order('published_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(20);

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          setData(briefings as PremiumBriefing[]);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch premium briefings'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBriefings();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

