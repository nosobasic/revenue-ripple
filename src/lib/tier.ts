import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type Tier = 'core' | 'growth' | 'partner';

export function mapPlanToTier(plan?: string | null): Tier {
	const p = (plan || 'member').toLowerCase();
	if (p === 'pro_reseller' || p === 'partner') return 'partner';
	if (p === 'reseller' || p === 'growth') return 'growth';
	return 'core';
}

export function useTier(): { tier: Tier, loading: boolean } {
	const [tier, setTier] = useState<Tier>('core');
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data } = await supabase.auth.getUser();
			const userId = data?.user?.id;
			if (!userId) { if (isMounted) setLoading(false); return; }
			const { data: row } = await supabase.from('users').select('plan').eq('id', userId).single();
			if (isMounted) {
				setTier(mapPlanToTier(row?.plan));
				setLoading(false);
			}
		})();
		return () => { isMounted = false; };
	}, []);
	return { tier, loading };
}
