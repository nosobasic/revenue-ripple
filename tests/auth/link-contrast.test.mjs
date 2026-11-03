// CSS regression: node --test tests/auth/link-contrast.test.mjs
// Include real-browser checks: RUN_BROWSER_TESTS=1 node --test tests/auth/link-contrast.test.mjs
// Uses an installed Chromium (override with CHROMIUM_PATH). No network or account access.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import postcss from 'postcss';

const read = file => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const luminance = rgb => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

test('auth action styles override global button backgrounds without changing primary buttons', async () => {
  const css = postcss.parse(await read('src/pages.css'));
  const declarations = selector => {
    const result = {};
    css.walkRules(rule => {
      if (rule.selectors.includes(selector)) rule.walkDecls(decl => { result[decl.prop] = decl.value; });
    });
    return result;
  };
  for (const state of ['', ':hover', ':focus', ':active']) {
    const rule = declarations(`.auth-container button.auth-link${state}`);
    assert.equal(rule.background, 'transparent');
    assert.equal(rule.border, '0');
    assert.equal(rule.margin, '0');
  }
  const focus = declarations('.auth-container button.auth-link:focus-visible');
  assert.equal(focus.outline, '2px solid #1d4ed8');
  assert.equal(focus['outline-offset'], '4px');
  const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16));
  const background = rgb(declarations('.auth-container')['background-color']);
  for (const state of ['', ':hover', ':focus']) {
    const color = rgb(declarations(`.auth-link${state}`).color);
    assert.ok(contrast(color, background) >= 4.5);
  }
  assert.equal(declarations('button').background, '#2563eb', 'Global CTAs retain blue');
  assert.match(declarations('.auth-button').background, /linear-gradient/);
  for (const page of ['Login', 'AffiliateLogin']) {
    const source = await read(`src/pages/${page}.jsx`);
    assert.equal((source.match(/className="auth-link"/g) || []).length, 3);
    assert.match(source, /Forgot your password\?/);
    assert.match(source, /Back to login/);
    assert.match(source, /className="auth-container"/);
  }
});

test('auth action links remain readable through hover, focus, and press', {
  timeout: 30000,
  skip: process.env.RUN_BROWSER_TESTS !== '1' && 'Set RUN_BROWSER_TESTS=1 where Chromium is permitted',
}, async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), 'rr-auth-contrast-'));
  const child = spawn(process.env.CHROMIUM_PATH || 'chromium', [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-background-networking',
    '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let socket;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      let log = '';
      const timer = setTimeout(() => reject(Error('Chromium startup timed out')), 10000);
      child.stderr.on('data', chunk => {
        log += chunk;
        const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) { clearTimeout(timer); resolve(match[1]); }
      });
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', () => { clearTimeout(timer); reject(Error(`Chromium exited: ${log}`)); });
    });
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    let nextId = 0;
    const pending = new Map();
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      const request = pending.get(message.id);
      if (request) { pending.delete(message.id); message.error ? request.reject(Error(JSON.stringify(message.error))) : request.resolve(message.result); }
    });
    const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++nextId; pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
    const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
    const send = (method, params) => call(method, params, sessionId);
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await send('DOM.enable');
    await send('CSS.enable');
    const sheets = await Promise.all(['src/index.css', 'src/pages.css'].map(read));
    for (const page of ['Login', 'AffiliateLogin']) {
      const source = await read(`src/pages/${page}.jsx`);
      // Use the real action-button markup, stripping only the React callback.
      const buttons = [...source.matchAll(/<button\b[\s\S]*?<\/button>/g)]
        .filter(match => /className="auth-link"/.test(match[0]))
        .map(match => match[0].replace(/onClick=\{\(\) => setShowForgotPassword\((?:true|false)\)\}/g, '').replace('className=', 'class='));
      assert.equal(buttons.length, 2, `${page}: reset and back actions must be covered`);
      for (const reversed of [false, true]) {
        const css = (reversed ? [...sheets].reverse() : sheets).join('\n');
        const html = `<style>${css} * { transition: none !important; }</style><div class="auth-container"><form class="auth-form">${buttons.join('')}<button class="auth-button">Sign in</button></form></div>`;
        await evaluate(`document.documentElement.innerHTML = ${JSON.stringify(html)}`);
        const { root } = await send('DOM.getDocument');
        const { nodeIds } = await send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'button.auth-link' });
        for (const scheme of ['light', 'dark']) {
          await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
          for (const nodeId of nodeIds) {
            for (const state of [[], ['hover'], ['focus', 'focus-visible'], ['hover', 'active']]) {
              await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: state });
              const { object } = await send('DOM.resolveNode', { nodeId });
              const { result } = await send('Runtime.callFunctionOn', { objectId: object.objectId, returnByValue: true, functionDeclaration: `function() {
                const style = getComputedStyle(this);
                const background = getComputedStyle(this.closest('.auth-container')).backgroundColor;
                return { color: style.color, background: style.backgroundColor, image: style.backgroundImage, parent: background, outline: style.outlineStyle, outlineWidth: style.outlineWidth };
              }` });
              const value = result.value;
              const label = `${page}, reversed=${reversed}, ${scheme}, ${state.join('+') || 'normal'}`;
              assert.equal(value.background, 'rgba(0, 0, 0, 0)', label);
              assert.equal(value.image, 'none', label);
              const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
              assert.ok(contrast(rgb(value.color), rgb(value.parent)) >= 4.5, `${label}: insufficient contrast ${JSON.stringify(value)}`);
              if (state.includes('focus-visible')) { assert.equal(value.outline, 'solid', label); assert.equal(value.outlineWidth, '2px', label); }
            }
            await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
          }
          assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.auth-button')).backgroundImage`), 'none', 'Primary sign-in button keeps its gradient');
        }
      }
    }
  } finally {
    socket?.close();
    if (child.exitCode === null && child.signalCode === null) { const exited = new Promise(resolve => child.once('exit', resolve)); child.kill('SIGKILL'); await exited; }
    await rm(profile, { recursive: true, force: true });
  }
});
