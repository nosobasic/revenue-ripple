import test from 'node:test';
import assert from 'node:assert/strict';
import { startEmailReportRequest } from '../../src/pages/admin/emailReportRequest.js';
const settle = () => new Promise(resolve => setImmediate(resolve));

test('unmount/logout/account switch prevents late report or error from old request', async () => {
  for (const reject of [false, true]) {
    let finish;
    const output = [];
    const dispose = startEmailReportRequest(() => new Promise((resolve, fail) => { finish = reject ? fail : resolve; }), '30', value => output.push(value), value => output.push(value));
    await settle(); dispose();
    finish(reject ? Error('old account') : {ok:true, json:async () => ({privateReport:'old account'})});
    await settle(); await settle();
    assert.deepEqual(output, []);
  }
});
test('new account request succeeds independently after old request cancellation', async () => {
  let oldResolve; const output = [];
  const old = startEmailReportRequest(() => new Promise(resolve => { oldResolve = resolve; }), '30', value => output.push(value), () => {});
  await settle(); old();
  startEmailReportRequest(async () => ({ok:true,json:async () => 'new account'}), '7', value => output.push(value), () => {});
  oldResolve({ok:true,json:async () => 'old account'});
  await settle(); await settle();
  assert.deepEqual(output, ['new account']);
});
test('401 and 403 never expose server details as a report', async () => {
  for (const status of [401,403]) {
    const output = [];
    startEmailReportRequest(async () => ({ok:false,status,json:async () => ({recipient:'private'})}), '30', value => output.push(value), value => output.push(value));
    await settle(); await settle();
    assert.deepEqual(output, ['Administrator sign-in required.']);
  }
});
