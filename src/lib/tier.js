import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function mapPlanToTier(plan) {
	const p = (plan || 'member').toLowerCase();
	if (p === 'pro_reseller' || p === 'partner') return 'partner';
	if (p === 'reseller' || p === 'growth') return 'growth';
	return 'core';
}

export function useTier() {
	const [tier, setTier] = useState('core');
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