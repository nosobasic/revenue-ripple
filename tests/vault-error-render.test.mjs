import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
const reactUrl = process.env.RETENTION_REACT_URL || import.meta.resolve('react');
const { default: React } = await import(reactUrl);
const { default: Renderer } = await import(process.env.RETENTION_RENDERER_URL || import.meta.resolve('react-test-renderer'));

test('vault renders denied/unavailable states and retry reloads without crashing', async () => {
  let reloads = 0;
  globalThis.window = { location: { reload: () => reloads++ } };
  let source = await readFile(new URL('../src/pages/Vault.jsx', import.meta.url), 'utf8');
  source = source.replace(/^import .*;\n/gm, '');
  source = `import React, {useState,useEffect} from '${reactUrl}';
const useAuth=()=>({user:{id:'fixture'}}), useNavigate=()=>()=>{};
const useRetentionContent=()=>({data:null,loading:false,error:new Error('Membership access needs verification.')});
const Navbar=()=>null, AIAssistantWidget=()=>null, Link=()=>null;
` + source;
  const { code } = await transform(source, { loader: 'jsx', format: 'esm' });
  const { default: Vault } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  let view;
  await Renderer.act(async () => { view = Renderer.create(React.createElement(Vault)); });
  assert.match(JSON.stringify(view.toJSON()), /Membership access needs verification/);
  view.root.findByType('button').props.onClick();
  assert.equal(reloads, 1);
  await Renderer.act(async () => view.unmount());
});
