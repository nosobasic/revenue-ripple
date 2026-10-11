import test from 'node:test';
import assert from 'node:assert/strict';
import { requireUnsubscribeSuccess } from '../../src/utils/unsubscribeResponse.js';

test('only confirmed successful unsubscribe responses resolve', async () => {
  for (const status of [200, 503, 500, 400]) {
    for (const payload of [{ success: true }, { success: false }, {}, null]) {
      const response = new Response(JSON.stringify(payload), { status });
      if (status === 200 && payload?.success === true) {
        assert.deepEqual(await requireUnsubscribeSuccess(response), payload);
      } else {
        await assert.rejects(requireUnsubscribeSuccess(response));
      }
    }
  }
  await assert.rejects(requireUnsubscribeSuccess(new Response('upstream unavailable', { status: 502 })));
});
