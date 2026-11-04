import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

// Follow the existing vault render harness: execute the actual JSX with a mocked client.
const reactUrl = process.env.RETENTION_REACT_URL || import.meta.resolve('react');
const { default: React } = await import(reactUrl);
const { default: Renderer } = await import(process.env.RETENTION_RENDERER_URL || import.meta.resolve('react-test-renderer'));
const admin = await readFile(new URL('../src/pages/Admin.jsx', import.meta.url), 'utf8');
const source = admin.slice(admin.indexOf('const Analytics = () => {'), admin.indexOf('// DevOps Integration Component'));
const { code } = await transform(`import React, {useState,useEffect} from '${reactUrl}';
const supabase = {from: (...args) => globalThis.analyticsClient.from(...args)};
${source}
export default Analytics;`, { loader: 'jsx', format: 'esm' });
const { default: Analytics } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const rows = [{ percent_done: 100, status: 'completed' }, { percent_done: 50, status: 'in_progress' }];
const text = view => JSON.stringify(view.toJSON());
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

function mockProgress(reply) {
  const queries = [];
  globalThis.analyticsClient = {
    from(table) {
      return { select(columns) {
        queries.push({ table, columns });
        if (table === 'user_progress') return reply();
        const result = { data: [], error: null };
        return { ...result, gte: async () => result };
      } };
    }
  };
  return queries;
}
async function mount(t) {
  let view;
  await Renderer.act(async () => { view = Renderer.create(React.createElement(Analytics)); });
  t.after(async () => { await Renderer.act(async () => view.unmount()); delete globalThis.analyticsClient; });
  return view;
}
function unavailable(view) {
  assert.equal(view.root.findAllByProps({ role: 'alert' }).length, 1);
  assert.match(text(view), /Analytics unavailable/);
  assert.equal(view.root.findAllByProps({ className: 'stat-value' }).length, 0);
  assert.doesNotMatch(text(view), /Course Completion Rate|Average Course Progress|Course Completions/);
}
const retry = async view => { await Renderer.act(async () => view.root.findByType('button').props.onClick()); };
const changeRange = async (view, value) => { await Renderer.act(async () => view.root.findByType('select').props.onChange({ target: { value } })); };

test('successful query requests only supported fields and renders real course metrics', async t => {
  const queries = mockProgress(async () => ({ data: rows, error: null }));
  const view = await mount(t);
  assert.deepEqual(queries.filter(q => q.table === 'user_progress'), [{ table: 'user_progress', columns: 'percent_done, status' }]);
  assert.match(text(view), /75\.0/);
  assert.match(text(view), /50\.0/);
  assert.equal(view.root.findAllByProps({ role: 'alert' }).length, 0);
});

test('real empty result renders zero metrics without an error', async t => {
  mockProgress(async () => ({ data: [], error: null }));
  const view = await mount(t);
  assert.match(text(view), /Course Completion Rate/);
  assert.match(text(view), /0\.0/);
  assert.equal(view.root.findAllByProps({ role: 'alert' }).length, 0);
});

for (const mode of ['returned error', 'rejected request']) {
  test(`${mode} hides unavailable metrics; repeated retry then recovery works`, async t => {
    const failure = { message: 'fixture query failure', code: '42703' };
    let fail = true;
    mockProgress(async () => {
      if (!fail) return { data: rows, error: null };
      if (mode === 'rejected request') throw failure;
      // Even if a response contains data, its error must not be ignored.
      return { data: rows, error: failure };
    });
    const view = await mount(t);
    unavailable(view);
    await retry(view);
    unavailable(view);
    fail = false;
    await retry(view);
    assert.match(text(view), /75\.0/);
    assert.equal(view.root.findAllByProps({ role: 'alert' }).length, 0);
  });
}

test('successful data is hidden during reload and after a later failure', async t => {
  mockProgress(async () => ({ data: rows, error: null }));
  const view = await mount(t);
  const pending = deferred();
  mockProgress(() => pending.promise);
  await changeRange(view, '7');
  assert.match(text(view), /Loading analytics data/);
  assert.doesNotMatch(text(view), /75\.0/);
  await Renderer.act(async () => pending.resolve({ data: null, error: { message: 'offline' } }));
  unavailable(view);
});

test('superseded requests cannot overwrite the latest error or loading state', async t => {
  mockProgress(async () => ({ data: rows, error: null }));
  const view = await mount(t);
  const old = deferred();
  const latest = deferred();
  let calls = 0;
  mockProgress(() => (++calls === 1 ? old.promise : latest.promise));
  // Retain the callback to simulate a second queued selection after loading starts.
  const select = view.root.findByType('select').props.onChange;
  await Renderer.act(async () => { select({ target: { value: '7' } }); });
  await Renderer.act(async () => { select({ target: { value: '90' } }); });
  await Renderer.act(async () => old.resolve({ data: rows, error: null }));
  assert.match(text(view), /Loading analytics data/);
  await Renderer.act(async () => latest.resolve({ data: null, error: { message: 'latest failed' } }));
  unavailable(view);
});

test('late rejection from an unmounted instance cannot affect a fresh mount', async t => {
  const old = deferred();
  mockProgress(() => old.promise);
  const first = await mount(t);
  await Renderer.act(async () => first.unmount());
  mockProgress(async () => ({ data: rows, error: null }));
  const current = await mount(t);
  await Renderer.act(async () => old.reject(new Error('late failure')));
  assert.match(text(current), /75\.0/);
  assert.equal(current.root.findAllByProps({ role: 'alert' }).length, 0);
});

test('late failed request cannot replace a newer successful range', async t => {
  mockProgress(async () => ({ data: rows, error: null }));
  const view = await mount(t);
  const old = deferred();
  let calls = 0;
  mockProgress(() => ++calls === 1 ? old.promise : Promise.resolve({ data: [], error: null }));
  const select = view.root.findByType('select').props.onChange;
  await Renderer.act(async () => select({ target: { value: '7' } }));
  await Renderer.act(async () => select({ target: { value: '90' } }));
  await Renderer.act(async () => old.reject(new Error('superseded failure')));
  assert.match(text(view), /Course Completion Rate/);
  assert.match(text(view), /0\.0/);
  assert.equal(view.root.findAllByProps({ role: 'alert' }).length, 0);
});
