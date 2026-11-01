import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAccountProfile, AccountProfileError } from '../../src/lib/resolveAccountProfile.js';

const identity = { id: 'synthetic-user', email: 'synthetic@example.invalid', user_metadata: { name: 'Synthetic Member', role: 'admin', plan: 'lifetime' } };
function fixture(initial = null, options = {}) {
  let row = initial;
  const writes = [];
  return { writes, get row() { return row; }, client: { from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => options.readError ? { error: { message: 'private-read' } } : { data: row } }) }),
    upsert: async (value, config) => {
      writes.push({ value, config });
      if (options.createError) return { error: { message: 'private-email-and-sql' } };
      if (!options.noInsert) row = options.concurrentRow || row || value;
      return {};
    },
    update: values => ({ eq: async () => {
      writes.push(values);
      if (options.updateError) return { error: { message: 'private-update' } };
      if (!options.noUpdate) row = { ...row, ...values };
      return {};
    } }),
  }) } };
}

test('Google and password identities create the same basic profile, ignoring role metadata', async () => {
  const google = fixture(); const password = fixture();
  assert.deepEqual(await resolveAccountProfile(google.client, { ...identity, app_metadata: { provider: 'google' } }),
    await resolveAccountProfile(password.client, { ...identity, app_metadata: { provider: 'email' } }));
  assert.equal(google.row.role, 'member'); assert.equal(google.row.plan, '');
  assert.deepEqual(google.writes[0].config, { onConflict: 'id', ignoreDuplicates: true });
});
test('repeated callbacks preserve existing admin lifetime and paid profile without writes', async () => {
  const original = { id: identity.id, email: identity.email, role: 'admin', plan: 'lifetime', has_paid: true };
  const f = fixture(original);
  assert.deepEqual(await resolveAccountProfile(f.client, identity), original);
  assert.deepEqual(await resolveAccountProfile(f.client, identity), original);
  assert.equal(f.writes.length, 0);
});
test('read failure cannot be interpreted as missing profile', async () => {
  const f = fixture(null, { readError: true });
  await assert.rejects(resolveAccountProfile(f.client, identity), { code: 'PROFILE_READ_FAILED' });
  assert.equal(f.writes.length, 0);
});
test('failed creation exposes only a sanitized retry error', async () => {
  const f = fixture(null, { createError: true });
  await assert.rejects(resolveAccountProfile(f.client, identity), error => {
    assert.ok(error instanceof AccountProfileError);
    assert.equal(error.code, 'PROFILE_CREATE_FAILED');
    assert.ok(!error.message.includes('private')); return true;
  });
});
test('successful write acknowledgement without a visible profile is not sign-in success', async () => {
  const f = fixture(null, { noInsert: true });
  await assert.rejects(resolveAccountProfile(f.client, identity), { code: 'PROFILE_CREATE_FAILED' });
});
test('duplicate race rereads and preserves the existing privileged profile', async () => {
  const original = { id: identity.id, email: identity.email, role: 'admin', plan: 'lifetime' };
  const f = fixture(null, { concurrentRow: original });
  assert.deepEqual(await resolveAccountProfile(f.client, identity), original);
});
test('email update errors and silent no-op updates fail verification', async () => {
  for (const options of [{ updateError: true }, { noUpdate: true }]) {
    const f = fixture({ id: identity.id, email: 'old@example.invalid', role: 'member' }, options);
    await assert.rejects(resolveAccountProfile(f.client, identity), { code: 'PROFILE_EMAIL_FAILED' });
  }
});
test('verified email refresh changes no entitlement fields', async () => {
  const f = fixture({ id: identity.id, email: 'old@example.invalid', role: 'admin', plan: 'lifetime', has_paid: true });
  const row = await resolveAccountProfile(f.client, identity);
  assert.equal(row.email, identity.email); assert.equal(row.plan, 'lifetime'); assert.equal(row.has_paid, true);
  assert.deepEqual(f.writes, [{ email: identity.email }]);
});
test('superseded session cannot start profile writes', async () => {
  const f = fixture();
  await assert.rejects(resolveAccountProfile(f.client, identity, () => false));
  assert.equal(f.writes.length, 0);
});
test('signup details retain paypal contact only, never role or plan overrides', async () => {
  const f = fixture();
  const row = await resolveAccountProfile(f.client, identity, undefined, { paypal_email: 'contact@example.invalid', role: 'admin', plan: 'lifetime' });
  assert.equal(row.paypal_email, 'contact@example.invalid'); assert.equal(row.role, 'member'); assert.equal(row.plan, '');
});
