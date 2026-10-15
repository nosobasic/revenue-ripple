-- Operator-only aggregate reconciliation; no records, emails or provider identifiers returned.
-- Review current schema first. Does not depend on the proposed evidence tables being deployed.
BEGIN READ ONLY;
SELECT count(*) AS legacy_rows,
 count(*) FILTER(WHERE plan='premium' AND paid_until>now()) AS future_premium,
 count(*) FILTER(WHERE plan='premium' AND paid_until>now() AND status<>'active') AS inconsistent_future
FROM public.rr_subscriptions;
SELECT count(*) AS unprotected_historical_flags FROM public.users
WHERE role IS DISTINCT FROM 'admin' AND plan IS DISTINCT FROM 'lifetime' AND has_paid IS TRUE;
SELECT count(*) AS founder_rows FROM public.founders_annual_members;
SELECT content_type,count(*) AS items FROM public.ve_content_items GROUP BY content_type;
ROLLBACK;
