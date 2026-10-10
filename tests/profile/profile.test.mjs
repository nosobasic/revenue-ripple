import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const root = process.env.RR_AUTH_TEST_ROOT || '/tmp/rr-auth-tests';
const require = createRequire(`${root}/package.json`);
const React = require('react');
const { act, create } = require('react-test-renderer');
let assertions = 0;
const check = (a,b) => { assert.deepEqual(a,b); assertions++; };
globalThis.fixture = { user: {id:'a',name:'Fixture member',email:'member@example.test',role:'admin',plan:'lifetime'}, calls:[], updates:[], navigation:[] };
globalThis.window = {location:{assign:url=>fixture.navigation.push(url)}};
fixture.request = async (path, options) => { fixture.calls.push([path,options?.method || 'GET']); return {ok:true,json:async()=>({state:'not_linked'})}; };
await build({stdin:{contents:`export {default as Profile} from './src/pages/Profile.jsx';export {default as Billing} from './src/components/MembershipBilling.jsx';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:`${root}/profile.cjs`,plugins:[{name:'fixtures',setup(b){
 b.onResolve({filter:/^react$/},()=>({path:require.resolve('react'),external:true}));
 b.onResolve({filter:/AuthContext|useUserRole|react-router-dom|authenticatedFetch|Navbar|\.css$/},a=>({path:a.path,namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path.includes('AuthContext')?`export const useAuth=()=>({user:globalThis.fixture.user,updateUserProfile:async data=>globalThis.fixture.updates.push(data),logout:async()=>{}});`:a.path.includes('useUserRole')?`export const useUserRole=()=>({role:globalThis.fixture.user?.role});`:a.path.includes('react-router')?`import React from 'react'; export const useNavigate=()=>()=>{};export const Link=({to,children,...rest})=>React.createElement('a',{href:to,...rest},children);`:a.path.includes('authenticatedFetch')?`export const authenticatedFetch=(...args)=>globalThis.fixture.request(...args);`:a.path.includes('Navbar')?'export default function Navbar(){return null}':'',loader:'js'}));
}}]});
const {Profile,Billing}=require(`${root}/profile.cjs`);
let renderer;
async function mount(component=React.createElement(Profile)){await act(async()=>{renderer=create(component)})}
async function click(text){await act(async()=>renderer.root.findAllByType('button').find(node=>node.children.join('')===text).props.onClick())}
const text=()=>JSON.stringify(renderer.toJSON());
await mount();
check(fixture.calls,[['/api/billing/status','GET']]);check(text().includes('buy your membership again'),true);check(text().includes('lifetime'),true);
check(renderer.root.findAllByType('input').every(input=>input.props.readOnly),true);
for (const input of [...renderer.root.findAllByType('input'),...renderer.root.findAllByType('textarea')]) check(renderer.root.findAllByType('label').some(label=>label.props.htmlFor===input.props.id),true);
await click('Edit profile');check(renderer.root.findAllByType('input').every(input=>!input.props.readOnly),true);
await act(async()=>renderer.root.findByProps({id:'profile-name'}).props.onChange({target:{value:'Changed name'}}));
await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault(){}}));
check(fixture.updates[0].name,'Changed name');check('role' in fixture.updates[0],false);check(text().includes('Profile saved'),true);
await act(async()=>renderer.unmount());
// Explicit click only; token refresh/same account renders cause no duplicate request.
fixture.calls=[]; fixture.request=async(path,options)=>{fixture.calls.push([path,options?.method||'GET']);return {ok:true,json:async()=>path.endsWith('status')?{state:'linked'}:{state:'ready',url:'https://billing.stripe.com/p/synthetic'}}};
await mount();check(fixture.calls.length,1);await act(async()=>renderer.update(React.createElement(Profile)));check(fixture.calls.length,1);
await click('Manage membership in Stripe');check(fixture.calls.at(-1),['/api/billing/portal','POST']);check(fixture.navigation,['https://billing.stripe.com/p/synthetic']);await act(async()=>renderer.unmount());
// Loading/error with retry; no checkout or entitlement write.
fixture.request=async()=>{throw Error('offline')};await mount();check(text().includes('unavailable right now'),true);
fixture.request=async()=>({ok:true,json:async()=>({state:'not_linked'})});await click('Retry billing lookup');check(text().includes('buy your membership again'),true);await act(async()=>renderer.unmount());
// Late portal responses after account switch/unmount never redirect.
let resolve;
fixture.navigation=[];fixture.request=async path=>path.endsWith('status')?{ok:true,json:async()=>({state:'linked'})}:new Promise(done=>{resolve=done});
await mount(React.createElement(Billing,{userId:'a'}));
let pending;
await act(async()=>{pending=renderer.root.findByType('button').props.onClick()});
check(renderer.root.findByType('button').props.disabled,true);
await act(async()=>renderer.update(React.createElement(Billing,{userId:'b'})));
await act(async()=>{resolve({ok:true,json:async()=>({state:'ready',url:'https://billing.stripe.com/p/old'})});await pending});check(fixture.navigation,[]);await act(async()=>renderer.unmount());
// Hostile provider URL is never followed.
fixture.request=async path=>({ok:true,json:async()=>path.endsWith('status')?{state:'linked'}:{state:'ready',url:'https://evil.test'}});
await mount();await click('Manage membership in Stripe');check(fixture.navigation,[]);check(text().includes('unavailable right now'),true);await act(async()=>renderer.unmount());
console.log(`Profile/portal: ${assertions} assertions passed (synthetic only)`);
// Preserve distinct optional upgrade journeys; never show a repurchase prompt to admin.
for (const role of ['admin','member','affiliate','reseller','pro_reseller']) {
 fixture.user={...fixture.user,role};fixture.request=async()=>({ok:true,json:async()=>({state:'not_linked'})});
 await mount();
 check(text().includes('Explore upgrade options'),['affiliate','reseller'].includes(role));
 check(text().includes('Explore Reseller'),role==='affiliate');
 await act(async()=>renderer.unmount());
}
// Timeout is an unavailable/retry state, not missing membership.
const originalTimeout=globalThis.setTimeout;
let timeout;
globalThis.setTimeout=(callback,delay,...args)=>delay===15000?(timeout=callback,0):originalTimeout(callback,delay,...args);
fixture.request=async()=>new Promise(()=>{}); // stalled session lookup ignores signal
await mount();check(text().includes('Checking your linked'),true);
await act(async()=>timeout());check(text().includes('unavailable right now'),true);check(text().includes('Retry billing lookup'),true);
await act(async()=>renderer.unmount());globalThis.setTimeout=originalTimeout;
// A stalled portal/session lookup also times out, without a redirect or grant.
globalThis.setTimeout=(callback,delay,...args)=>delay===15000?(timeout=callback,0):originalTimeout(callback,delay,...args);
fixture.request=async path=>path.endsWith('status')?{ok:true,json:async()=>({state:'linked'})}:new Promise(()=>{});
await mount();
await act(async()=>{pending=renderer.root.findByProps({className:'profile-button',disabled:false}).props.onClick()});
await act(async()=>{timeout();await pending});
check(text().includes('Retry billing lookup'),true);check(fixture.navigation,[]);
await act(async()=>renderer.unmount());globalThis.setTimeout=originalTimeout;
console.log(`Profile/portal total: ${assertions} assertions passed`);
