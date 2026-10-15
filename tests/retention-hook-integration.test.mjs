import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const reactUrl=process.env.RETENTION_REACT_URL || import.meta.resolve('react');
const {default:React}=await import(reactUrl);
const {default:Renderer}=await import(process.env.RETENTION_RENDERER_URL || import.meta.resolve('react-test-renderer'));
import {retentionMessage,visibleRetentionState} from '../src/lib/retentionState.js';
const payload=JSON.parse(await readFile(new URL('./retention/api-allowed-fixture.json',import.meta.url)));
let auth,fetcher,timer,shown,focus;
globalThis.window={addEventListener:(k,f)=>{focus=f;},removeEventListener:()=>{}};
globalThis.document={visibilityState:'visible',addEventListener:()=>{},removeEventListener:()=>{}};
globalThis.rrHook={useAuth:()=>auth,fetch:(...args)=>fetcher(...args),base:()=>'',retentionMessage,visibleRetentionState,
 setTimeout:f=>{timer=f;return 1;},clearTimeout:()=>{timer=null;}};
let src=await readFile(new URL('../src/hooks/useRetentionContent.js',import.meta.url),'utf8');
src=src.replace(/^import .*;\n/gm,'').replaceAll('setTimeout(', 'rrHook.setTimeout(').replaceAll('clearTimeout(','rrHook.clearTimeout(');
src=`import {useEffect,useState} from '${reactUrl}';
const {useAuth,fetch:authenticatedFetch,base:getApiBase,retentionMessage,visibleRetentionState}=globalThis.rrHook;\n`+src;
const {useRetentionContent}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
function View(){shown=useRetentionContent('playbooks');return React.createElement('div',null,shown.data?.[0]?.full_body||shown.error?.message||'loading');}
const ok=()=>({ok:true,status:200,json:async()=>payload});
function initialize(){auth={user:{id:'fixture'},session:{access_token:'fixture'},loading:false};fetcher=async()=>ok();}
test('real hook consumes SQL/API response and clears on review',async()=>{
 initialize();let view;await Renderer.act(async()=>{view=Renderer.create(React.createElement(View));});
 assert.equal(shown.data[0].id,1);
 fetcher=async()=>({ok:false,status:503,json:async()=>({code:'access_review',success:false})});
 await Renderer.act(async()=>focus());assert.equal(shown.data,null);assert.match(shown.error.message,/do not purchase again/);
 await Renderer.act(async()=>view.unmount());
});
test('account change with late response never repopulates old body',async()=>{
 initialize();let resolve,view;fetcher=()=>new Promise(r=>{resolve=r;});
 await Renderer.act(async()=>{view=Renderer.create(React.createElement(View));});let old=resolve;
 auth={user:{id:'different'},session:{access_token:'different'},loading:false};fetcher=async()=>({ok:false,status:403,json:async()=>({code:'membership_required'})});
 await Renderer.act(async()=>view.update(React.createElement(View)));
 await Renderer.act(async()=>old(ok()));assert.equal(shown.data,null);assert.match(shown.error.message,/free courses/);
 await Renderer.act(async()=>view.unmount());
});
test('expiry clears rendered content before pending revalidation',async()=>{
 initialize();let view;await Renderer.act(async()=>{view=Renderer.create(React.createElement(View));});assert.ok(shown.data);
 fetcher=()=>new Promise(()=>{});await Renderer.act(async()=>{timer();});assert.equal(shown.data,null);
 await Renderer.act(async()=>view.unmount());
});
