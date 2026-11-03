import assert from 'node:assert/strict';
import test from 'node:test';
import { unpaidProfile } from '../../src/utils/unpaidProfile.js';

test('Google signup supplies all safe fields instead of relying on legacy database defaults', () => {
  const result = unpaidProfile({ id: 'synthetic-google-id', email: 'member@example.test', user_metadata: { full_name: 'Example Member', role: 'admin', plan: 'lifetime', has_paid: true, commission_rate: 1, is_founder: true } });
  assert.deepEqual(result, { id: 'synthetic-google-id', email: 'member@example.test', name: 'Example Member', role: 'member', plan: '', status: 'active', commission_rate: 0, has_paid: false, payment_status: 'pending', is_founder: false, subscription_type: null, founder_benefits: {}, username: null, value_engine_segment: null });
});
test('only display-name strings are copied from user metadata', () => {
  assert.equal(unpaidProfile({ id: 'id', email: 'a@example.test', user_metadata: { name: { role: 'admin' }, full_name: 'Google Name' } }).name, 'Google Name');
  assert.equal(unpaidProfile({ id: 'id', email: 'a@example.test' }).name, '');
});
test('an incomplete Auth identity never provisions an app profile', () => {
  for (const authUser of [null, {}, { id: 'id' }, { email: 'a@example.test' }]) assert.throws(() => unpaidProfile(authUser));
});
