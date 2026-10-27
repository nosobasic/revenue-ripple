import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { createMemoryRouter, RouterProvider, Navigate, Routes, Route, Link } from 'react-router-dom';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';

// Actual application guards/callback/checkout with the installed router.
// Only identity, attribution and endpoint boundaries are synthetic. No network.
const dir = await mkdtemp(path.join(process.cwd(), 'node_modules/.router-regression-'));
const output = path.join(dir, 'components.cjs');
globalThis.routerAuthContext = React.createContext(null);
await build({ stdin: { contents: `export {default as Guard} from './src/components/ProtectedRoute.jsx';export {default as SignedOut} from './src/components/SignedOutRoute.jsx';export {default as Callback} from './src/pages/AuthCallback.jsx';export {default as Checkout} from './src/pages/Checkout.jsx';export {default as Success} from './src/pages/MembershipSuccess.jsx';export {default as Cancel} from './src/pages/MembershipCancel.jsx';`, resolveDir: process.cwd(), loader: 'jsx' },
  bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: output,
  external: ['react', 'react/jsx-runtime', 'react-router-dom'],
  plugins: [{ name: 'offline-boundaries', setup(b) {
    b.onResolve({ filter: /context\/AuthContext$/ }, () => ({ path: 'auth', namespace: 'fixture' }));
    b.onResolve({ filter: /utils\/acquisitionAttribution$/ }, () => ({ path: 'attribution', namespace: 'fixture' }));
    b.onResolve({ filter: /config\/constants$/ }, () => ({ path: 'constants', namespace: 'fixture' }));
    b.onResolve({ filter: /\.css$/ }, () => ({ path: 'css', namespace: 'fixture' }));
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, a => ({ contents: {
      auth: "import React from 'react';export const useAuth=()=>React.useContext(globalThis.routerAuthContext)",
      attribution: 'export const acquisitionForSubmission=()=>({})',
      constants: "export const API_ENDPOINTS={BASE_URL:'https://fixture.invalid',MEMBERSHIP_SESSION:'/membership',QUARTERLY_GROWTH_SESSION:'/quarterly',TRIPWIRE_SESSION:'/dmd'}",
      css: ''
    }[a.path], loader: 'js' }));
  } }]
});
const { Guard, SignedOut, Callback, Checkout, Success, Cancel } = createRequire(import.meta.url)(output);
const el = React.createElement;
const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k,v) => m.set(k,String(v)), removeItem: k => m.delete(k) }; };
const signedOut = { user: null, session: null, loading: false, authError: null, refreshUserData() {} };
const member = { ...signedOut, user: { id: 'fixture', role: 'member' }, session: { user: { id: 'fixture' } } };
let root, router, identity, requests, redirects;
const text = () => JSON.stringify(root.toJSON());
const location = () => router.state.location.pathname + router.state.location.search + router.state.location.hash;
const tree = () => el(globalThis.routerAuthContext.Provider, { value: identity }, el(RouterProvider, { router }));
async function mount(entries, auth = signedOut) {
  identity = auth; requests = []; redirects = [];
  globalThis.sessionStorage = memory(); globalThis.localStorage = memory();
  globalThis.window = { location: { assign: url => redirects.push(url) }, history: { back: () => router.navigate(-1) } };
  globalThis.fetch = async (...args) => { requests.push(args); throw Error('Unexpected network request'); };
  router = createMemoryRouter([
    { path: '/', element: el('p', null, 'Home') },
    { path: '/dashboard', element: el(Guard, null, el('p', null, 'Dashboard')) },
    { path: '/courses/:course', element: el(Guard, null, el('p', null, 'Lesson')) },
    { path: '/affiliate-centre/*', element: el(Guard, null, el(React.Fragment, null, el(Link, { to: '/affiliate-centre/tools' }, 'Tools'), el(Routes, null, el(Route, { path: 'tools', element: el('p', null, 'Affiliate tools fixture') }), el(Route, { path: 'training', element: el('p', null, 'Affiliate training fixture') })))) },
    { path: '/admin', element: el(Guard, { requireAdmin: true }, el('p', null, 'Admin content')) },
    { path: '/login', element: el(SignedOut, null, el('p', null, 'Sign in form')) },
    { path: '/auth/callback', element: el(Callback) },
    { path: '/checkout', element: el(Checkout) },
    { path: '/membership-success', element: el(Success) },
    { path: '/membership-cancel', element: el(Cancel) },
    { path: '*', element: el(Navigate, { to: '/', replace: true }) }
  ], { initialEntries: entries });
  await act(async () => { root = create(tree()); });
}
async function auth(value) { identity = value; await act(async () => root.update(tree())); }
async function go(to) { await act(async () => { await router.navigate(to); }); }
async function close() { await act(async () => root.unmount()); router.dispose(); }

test('real router migration regression', async t => {
  try {
    await t.test('deep-link login return retains search/hash and replacement history', async () => {
      await mount(['/', '/courses/a?chapter=2#notes']);
      assert.equal(location(), '/login');
      assert.equal(router.state.location.state.from.pathname, '/courses/a');
      await auth(member); assert.equal(location(), '/courses/a?chapter=2#notes');
      await go(-1); assert.equal(location(), '/');
      await go(1); assert.equal(location(), '/courses/a?chapter=2#notes');
      assert.equal(requests.length, 0); await close();
    });
    await t.test('interrupted login, repeated navigation and admin denial', async () => {
      await mount(['/courses/a'], { ...signedOut, loading: true });
      assert.match(text(), /Checking authentication/);
      await auth({ ...signedOut, authError: 'Account check interrupted' });
      assert.match(text(), /Account check interrupted/); assert.equal(location(), '/courses/a');
      await auth(signedOut); assert.equal(location(), '/login');
      await auth(member); assert.equal(location(), '/courses/a');
      for (let n = 0; n < 3; n++) { await go('/dashboard'); await go('/courses/b?chapter=3#read'); }
      assert.equal(location(), '/courses/b?chapter=3#read');
      await go('/admin'); assert.match(text(), /Access Denied/); assert.doesNotMatch(text(), /Admin content/);
      assert.equal(requests.length, 0); await close();
    });
    await t.test('callback waits for identity, replaces history and clears stale purchase intent', async () => {
      // Set the hint before navigating to the callback route.
      await mount(['/'], { ...signedOut, loading: true });
      sessionStorage.setItem('oauth-return-to', '/courses/a?q=1#section');
      sessionStorage.setItem('intended-plan', 'quarterly');
      await go('/auth/callback'); assert.equal(location(), '/auth/callback');
      await auth({ ...signedOut, authError: 'Retry verification' }); assert.equal(location(), '/auth/callback');
      await auth(member); assert.equal(location(), '/courses/a?q=1#section');
      assert.equal(sessionStorage.getItem('intended-plan'), null);
      assert.equal(sessionStorage.getItem('oauth-return-to'), null);
      await auth({ ...member }); assert.equal(location(), '/courses/a?q=1#section');
      await go(-1); assert.equal(location(), '/'); await go(1); assert.equal(location(), '/courses/a?q=1#section');
      assert.equal(requests.length, 0); await close();
    });
    await t.test('unsafe callback return and signed-out callback stay internal', async () => {
      for (const value of ['https://evil.invalid', '//evil.invalid', '/\\evil.invalid', '/%2f%2fevil.invalid']) {
        await mount(['/'], member); sessionStorage.setItem('oauth-return-to', value);
        await go('/auth/callback'); assert.equal(location(), '/dashboard'); assert.deepEqual(redirects, []); await close();
      }
      await mount(['/auth/callback']); assert.equal(location(), '/login'); await close();
    });
    await t.test('checkout return paths and history never initiate or grant a purchase', async () => {
      await mount(['/', '/checkout?product=quarterly']); assert.equal(location(), '/login');
      await auth(member); assert.equal(location(), '/checkout?product=quarterly');
      assert.match(text(), /Review Quarterly Growth purchase/); assert.equal(requests.length, 0);
      for (let n = 0; n < 2; n++) {
        await go('/membership-success?session_id=synthetic'); assert.match(text(), /does not verify a payment/);
        await go('/membership-cancel'); assert.match(text(), /does not cancel a subscription/);
        await go(-1); assert.equal(location(), '/membership-success?session_id=synthetic');
        await go(1); assert.equal(location(), '/membership-cancel');
      }
      assert.equal(identity.user.role, 'member'); assert.equal(requests.length, 0); assert.deepEqual(redirects, []); await close();
    });
    await t.test('nested wildcard route matching and absolute links remain stable', async () => {
      await mount(['/affiliate-centre/tools'], member); assert.match(text(), /Affiliate tools fixture/);
      assert.equal(root.root.findByType('a').props.href, '/affiliate-centre/tools');
      await go('/affiliate-centre/training'); assert.match(text(), /Affiliate training fixture/);
      await go(-1); assert.match(text(), /Affiliate tools fixture/);
      await go(1); assert.match(text(), /Affiliate training fixture/);
      assert.equal(requests.length, 0); await close();
    });
    await t.test('pending checkout is aborted when navigation leaves the page', async () => {
      await mount(['/checkout?product=membership'], member);
      let finish, signal;
      globalThis.fetch = (_url, options) => { signal = options.signal; return new Promise(resolve => { finish = resolve; }); };
      let payment;
      await act(async () => { payment = root.root.findAllByType('button').find(b => b.props.children === 'Continue to payment').props.onClick(); });
      await go('/dashboard'); assert.equal(signal.aborted, true);
      await act(async () => { finish({ ok: true, json: async () => ({ url: 'https://checkout.stripe.com/fixture' }) }); await payment; });
      assert.deepEqual(redirects, []); assert.equal(location(), '/dashboard'); await close();
    });
  } finally { await rm(dir, { recursive: true, force: true }); }
});
