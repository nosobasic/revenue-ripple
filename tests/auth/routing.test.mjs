import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { safeReturnTo } from '../../src/utils/loginRouting.js';
const testRoot = process.env.RR_AUTH_TEST_ROOT || '/tmp/rr-auth-tests';
const require = createRequire(`${testRoot}/package.json`);
const React = require('react');
const { create, act } = require('react-test-renderer');
let count=0;
const check=(actual,expected)=>{assert.deepEqual(actual,expected);count++};
for(const path of [undefined,'https://evil.test','//evil.test','/\\evil.test','/%2f%2fevil.test','/auth/callback','/login'])check(safeReturnTo(path),'/dashboard');
check(safeReturnTo({pathname:'/courses/lesson',search:'?chapter=2',hash:'#notes'}),'/courses/lesson?chapter=2#notes');
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
globalThis.localStorage=memory();globalThis.sessionStorage=memory();
globalThis.window={location:{origin:'http://fixture.test',assign:()=>{throw Error('Unexpected payment navigation')}}};
let listener,initial=null,profile={id:'a',role:'admin',plan:'lifetime',has_paid:true};
let deferred,failed=false;
const session=id=>({user:{id,email:'fixture@example.test',user_metadata:{role:'admin'}},access_token:'synthetic'});
globalThis.fixture={navigation:[],params:'product=membership',location:{pathname:'/courses/a',search:'?x=1',hash:'#part'},supabase:{
 auth:{getSession:async()=>({data:{session:initial}}),onAuthStateChange:cb=>{listener=cb;return {data:{subscription:{unsubscribe(){}}}}},signOut:async()=>{listener('SIGNED_OUT',null);return {}},signInWithPassword:async()=>({data:{user:session('a').user,session:session('a')}})},
 from:()=>({upsert:async()=>({}),select:()=>({eq:(_column,id)=>({single:()=>deferred?new Promise(resolve=>deferred.push({id,resolve})):Promise.resolve(failed?{error:{code:'offline'}}:{data:{...profile,id}})})})})
}};
await build({stdin:{contents:`export {AuthProvider,useAuth} from './src/context/AuthContext.jsx';export {default as Callback} from './src/pages/AuthCallback.jsx';export {default as Guard} from './src/components/ProtectedRoute.jsx';export {default as Checkout} from './src/pages/Checkout.jsx';export {default as Success} from './src/pages/MembershipSuccess.jsx';export {useUserRole} from './src/hooks/useUserRole.ts';`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,platform:'node',format:'cjs',jsx:'automatic',outfile:`${testRoot}/bundle.cjs`,external:['react','react/jsx-runtime'],plugins:[{name:'fixtures',setup(b){
 b.onResolve({filter:/supabase\/client$/},()=>({path:'supabase',namespace:'fixture'}));
 b.onResolve({filter:/services\/engagementTracking$/},()=>({path:'tracking',namespace:'fixture'}));
 b.onResolve({filter:/react-router-dom/},()=>({path:'router',namespace:'fixture'}));
 b.onResolve({filter:/config\/constants$/},()=>({path:'constants',namespace:'fixture'}));
 b.onResolve({filter:/utils\/acquisitionAttribution$/},()=>({path:'attribution',namespace:'fixture'}));
 b.onResolve({filter:/\.css$/},()=>({path:'css',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:({supabase:'export const supabase=globalThis.fixture.supabase',tracking:'export const trackDailyLogin=()=>{}',router:`import React from 'react';export const useNavigate=()=>globalThis.fixture.navigate;export const useLocation=()=>globalThis.fixture.location;export const useSearchParams=()=>[new URLSearchParams(globalThis.fixture.params)];export const Navigate=({to})=>React.createElement('redirect',{to});export const Link=({to,children})=>React.createElement('a',{href:to},children);`,constants:`export const API_ENDPOINTS={BASE_URL:'https://fixture.invalid',MEMBERSHIP_SESSION:'/membership',QUARTERLY_GROWTH_SESSION:'/quarterly',TRIPWIRE_SESSION:'/dmd'};`,attribution:'export const acquisitionForSubmission=()=>({})',css:''})[a.path],loader:'js'}));
}}]});
fixture.navigate=path=>fixture.navigation.push(path);
const {AuthProvider,useAuth,Callback,Guard,Checkout,Success,useUserRole}=require(`${testRoot}/bundle.cjs`);
let current,roles,root;
function Probe(){current=useAuth();roles=useUserRole();return null}
async function mount(child){await act(async()=>{root=create(React.createElement(AuthProvider,null,React.createElement(Probe),child))})}
async function unmount(){await act(async()=>root.unmount())}
initial=session('a');
await mount(React.createElement(Guard,{requireAdmin:true},React.createElement('p',null,'Admin page')));
check(current.user.role,'admin');check(current.loading,false);check(root.root.findAllByType('redirect').length,0);check(roles.hasSubscription,false);await unmount();
// Old purchase storage does not hijack login; callback is single-shot.
localStorage.setItem('oauth-redirect-path','/checkout?product=membership');sessionStorage.setItem('intended-plan','quarterly');
await mount(React.createElement(Callback));check(fixture.navigation,['/dashboard']);check(sessionStorage.getItem('intended-plan'),null);
await act(async()=>listener('TOKEN_REFRESHED',session('a')));check(fixture.navigation.length,1);await unmount();
// Explicit safe destination retains query/hash; no checkout request from OAuth.
fixture.navigation=[];sessionStorage.setItem('oauth-return-to','/checkout?product=quarterly');
await mount(React.createElement(Callback));check(fixture.navigation,['/checkout?product=quarterly']);await unmount();
// Slow and failed lookups never fabricate a member or deny an admin prematurely.
deferred=[];await mount(React.createElement(Guard,{requireAdmin:true},React.createElement('p',null,'Admin')));
check(current.loading,true);check(current.user,null);check(root.root.findAllByType('redirect').length,0);
await act(async()=>deferred.shift().resolve({error:{code:'offline'}}));check(current.user,null);check(Boolean(current.authError),true);check(root.root.findAllByType('redirect').length,0);
deferred=null;await act(async()=>current.refreshUserData());check(current.user.role,'admin');await unmount();
// Account switch and logout cannot be undone by a late profile response.
deferred=[];await mount();await act(async()=>listener('SIGNED_IN',session('b')));
await act(async()=>deferred.find(x=>x.id==='b').resolve({data:{id:'b',role:'member'}}));
await act(async()=>deferred.find(x=>x.id==='a').resolve({data:{id:'a',role:'admin'}}));check(current.user.id,'b');check(current.user.role,'member');
await act(async()=>listener('TOKEN_REFRESHED',session('b')));await act(async()=>current.logout());
await act(async()=>deferred.at(-1).resolve({data:{id:'b',role:'admin'}}));check(current.user,null);check(current.session,null);await unmount();deferred=null;
// Ordinary role mapping keeps partner distinctions without inventing subscription/credits.
for(const role of ['member','affiliate','reseller','pro_reseller','admin']){
 profile={id:'a',role,plan:role==='admin'?'lifetime':'',has_paid:role==='member'};fixture.navigation=[];await mount(React.createElement(Callback));check(fixture.navigation,['/dashboard']);
 check(roles.role,role);check(roles.isAffiliate,['affiliate','reseller','pro_reseller'].includes(role));check(roles.requiresCheckout,false);check(roles.hasSubscription,false);await unmount();
}
// Password login retains the profile and leaves Supabase's session serialization alone.
initial=null;await mount();localStorage.setItem('revenue-ripple-auth-token','fixture-sdk-storage');
await act(async()=>current.login('fixture@example.test','synthetic-password'));
check(current.user.role,'admin');check(localStorage.getItem('revenue-ripple-auth-token'),'fixture-sdk-storage');await unmount();
// Forged storage cannot satisfy a real signed-out route guard.
initial=null;localStorage.setItem('revenue-ripple-auth-token','forged');await mount(React.createElement(Guard,null,React.createElement('p',null,'Secret')));check(root.root.findByType('redirect').props.to,'/login');await unmount();initial=session('a');
let requests=0;globalThis.fetch=async()=>{requests++;return {ok:false,status:503,json:async()=>({error:'billing_disabled'})}};
await mount(React.createElement(Checkout));check(requests,0);
await act(async()=>root.root.findAllByType('button').find(b=>b.props.children==='Continue to payment').props.onClick());
check(requests,1);check(JSON.stringify(root.toJSON()).includes('Purchases are currently unavailable'),true);check(current.user.role,'admin');await unmount();
// Refresh/back to the purchase page never auto-posts or retries.
await mount(React.createElement(Checkout));check(requests,1);await unmount();
// Late checkout response after logout must not navigate to Stripe.
let finishPayment;globalThis.fetch=()=>new Promise(resolve=>{finishPayment=resolve});
await mount(React.createElement(Checkout));let payment;
await act(async()=>{payment=root.root.findAllByType('button').find(b=>b.props.children==='Continue to payment').props.onClick()});
await act(async()=>listener('SIGNED_OUT',null));
await act(async()=>{finishPayment({ok:true,json:async()=>({url:'https://checkout.stripe.com/fixture-only'})});await payment});
check(current.user,null);check(root.root.findByType('redirect').props.to,'/login');await unmount();
fixture.params='session_id=unverified&success=true';await mount(React.createElement(Success));check(requests,1);check(JSON.stringify(root.toJSON()).includes('does not verify a payment'),true);await unmount();
console.log(`${count} synthetic auth/routing/checkout assertions passed; no external requests.`);
