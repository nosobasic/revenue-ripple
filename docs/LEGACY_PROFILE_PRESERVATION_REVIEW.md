# Legacy webhook profile preservation (local review only)

This backend-only follow-up does not deploy or activate billing, run a webhook,
change hosted records, introduce quota/commission rules, or migrate subscriptions.

The public `/webhook` authenticates the raw payload using Stripe SDK
`Webhook.construct_event(payload, stripe-signature, STRIPE_WEBHOOK_SECRET)`.
Missing secret returns 503; bad signatures return 400; unpaid completions return
pending without profile activation. After successful verification we parse that
same payload into a dictionary. This is necessary with the installed Stripe 16
SDK (unpinned project dependency): Event objects no longer implement `.get()`.
It is not a diagnosis of the owner's uncaptured Checkout failure.

All existing network callers of `set_user_role` are inside this verified paid
checkout handler. The unused `process_subscription_purchase` helper has no repo
callers or route; it now requires paid event context before any processing.
Both role and founder helpers recheck completion, payment status, mapped product,
and recipient email. These semantic checks are not signature authentication by
themselves; internal code must only pass events authenticated by the dispatcher.

Existing admin profiles keep their role, plan, and admin_access payment sentinel.
An existing lifetime plan stays lifetime while a non-admin can legitimately move
into reseller/pro_reseller from a paid checkout. Ordinary profiles retain the
existing product-to-role mappings; no hierarchy or universal historical mapping
is invented. Founder purchases also preserve admin/lifetime identity while
retaining the existing founder-benefit update. Updates target the unique profile
ID and compare the previously read role/plan so a concurrent promotion/lifetime
assignment is not overwritten. Ambiguous email matches are not bulk-updated.

Identical duplicate paid events do not repeat the regular membership profile
write. This does NOT deduplicate legacy subscription/commission/email side
effects; that existing unresolved reconciliation remains outside this patch.
Cancellation/failure events do not mutate historical profiles; this patch does
not introduce lifecycle-based revocation or reinterpret historical memberships.
A concurrent compare-and-set miss safely skips the profile write; reconciliation
of an interrupted ordinary transition remains an operational limitation.

Validation: 11 Python tests, including 80 ordinary transition subcases and seven
admin product subcases. Tests extract actual server function bodies, use the real
Stripe SDK signature verifier with synthetic signed payloads, and an in-memory
profile adapter. No server import side effects, network, live event replay,
service credentials, financial records, or hosted database are used. Tests cover
admin/lifetime, free/member/premium-plan/affiliate/reseller/pro_reseller fixtures,
founders, duplicates, cancellations, missing secret, invalid signature, unpaid
completion, mismatched product/recipient, and concurrent admin promotion.

Run:
`/Users/donte/Documents/Codex/2026-10-07/task/local-test-tools/python/bin/python -m unittest discover -s tests/billing -p 'test_*.py'`

Review separately from frontend changes. A future backend rollout requires an
explicitly approved Render deployment. Keep new access/commission branch,
price IDs, flags, scans, settings, and data migrations excluded.
