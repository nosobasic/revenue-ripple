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
 from:()=>({upsert:async()=>({}),update:()=>({eq:async()=>({})}),select:()=>({eq:(_column,id)=>({single:()=>deferred?new Promise(resolve=>deferred.push({id,resolve})):Promise.resolve(failed?{error:{code:'offline'}}:{data:{...profile,id}})})})})
}};
await build({stdin:{contents:`export {AuthProvider,useAuth} from './src/context/AuthContext.jsx';export {default as Callback} from './src/pages/AuthCallback.jsx';export {default as Guard} from './src/components/ProtectedRoute.jsx';export {default as Checkout} from './src/pages/Checkout.jsx';export {default as Success} from './src/pages/MembershipSuccess.jsx';export {default as Cancel} from './src/pages/MembershipCancel.jsx';export {default as SignedOut} from './src/components/SignedOutRoute.jsx';export {default as Reseller} from './src/pages/ResellerCheckout.jsx';export {default as Founders} from './src/pages/FoundersAnnualCheckout.jsx';export {default as ProReseller} from './src/pages/ProResellerUpsell.jsx';export {useUserRole} from './src/hooks/useUserRole.ts';`,resolveDir:process.cwd(),loader:'jsx'},define:{'import.meta.env.VITE_API_BASE_URL':JSON.stringify('https://fixture.invalid')},bundle:true,platform:'node',format:'cjs',jsx:'automatic',outfile:`${testRoot}/bundle.cjs`,external:['react','react/jsx-runtime'],plugins:[{name:'fixtures',setup(b){
 b.onResolve({filter:/components\/(Navbar|FoundersTimer|FoundersSpotCounter|PlanSwitcher|Button|Card)$/},a=>({path:'ui',namespace:'fixture'}));
 b.onResolve({filter:/supabase\/client$/},()=>({path:'supabase',namespace:'fixture'}));
 b.onResolve({filter:/services\/engagementTracking$/},()=>({path:'tracking',namespace:'fixture'}));
 b.onResolve({filter:/react-router-dom/},()=>({path:'router',namespace:'fixture'}));
 b.onResolve({filter:/config\/constants$/},()=>({path:'constants',namespace:'fixture'}));
 b.onResolve({filter:/utils\/acquisitionAttribution$/},()=>({path:'attribution',namespace:'fixture'}));
 b.onResolve({filter:/\.css$/},()=>({path:'css',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:({ui:`import React from 'react';export const Button=props=>React.createElement('button',props);export const Card=props=>React.createElement('div',props);export default function UI(props){return props.onPlanChange?React.createElement('button',{onClick:()=>props.onPlanChange('monthly')},'Fixture monthly selector'):null}`,supabase:'export const supabase=globalThis.fixture.supabase',tracking:'export const trackDailyLogin=()=>{}',router:`import React from 'react';export const useNavigate=()=>globalThis.fixture.navigate;export const useLocation=()=>globalThis.fixture.location;export const useSearchParams=()=>[new URLSearchParams(globalThis.fixture.params)];export const Navigate=({to})=>React.createElement('redirect',{to});export const Link=({to,children})=>React.createElement('a',{href:to},children);`,constants:`export const API_ENDPOINTS={BASE_URL:'https://fixture.invalid',MEMBERSHIP_SESSION:'/membership',QUARTERLY_GROWTH_SESSION:'/quarterly',TRIPWIRE_SESSION:'/dmd',FOUNDERS:{TIMER_START:'/timer'},FOUNDERS_ANNUAL_SESSION:'/annual',FOUNDERS_MONTHLY_SESSION:'/monthly'};export const getApiBase=()=>API_ENDPOINTS.BASE_URL;export const FOUNDERS_ANNUAL_CONFIG={MARKETING_COPY:{HEADLINE:'Fixture founders',SUBHEADLINE:'Synthetic'},BONUSES:[],ANNUAL_PRICE:1,MONTHLY_PRICE:1,GUARANTEE_DAYS:1};`,attribution:'export const acquisitionForSubmission=()=>({})',css:''})[a.path],loader:'js'}));
}}]});
fixture.navigate=path=>fixture.navigation.push(path);
const {AuthProvider,useAuth,Callback,Guard,Checkout,Success,Cancel,SignedOut,Reseller,Founders,ProReseller,useUserRole}=require(`${testRoot}/bundle.cjs`);
let current,roles,root;
function Probe(){current=useAuth();roles=useUserRole();return null}
async function mount(child){await act(async()=>{root=create(React.createElement(AuthProvider,null,React.createElement(Probe),child))})}
async function unmount(){await act(async()=>root.unmount())}
initial=session('a');
await mount(React.createElement(Guard,{requireAdmin:true},React.createElement('p',null,'Admin page')));
check(current.user.role,'admin');check(current.loading,false);check(root.root.findAllByType('redirect').length,0);check(roles.hasSubscription,null);await unmount();
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
 check(roles.role,role);check(roles.isAffiliate,['affiliate','reseller','pro_reseller'].includes(role));check(roles.requiresCheckout,false);check(roles.hasSubscription,null);await unmount();
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
// Late Auth API completions and their SIGNED_IN events cannot undo logout or a newer login.
const originalSignIn=fixture.supabase.auth.signInWithPassword;
let authReplies=[];
fixture.supabase.auth.signInWithPassword=({email})=>new Promise(resolve=>authReplies.push({email,resolve}));
initial=null;await mount();let oldLogin;
await act(async()=>{oldLogin=current.login('old@example.test','fixture')});
let signingOut;await act(async()=>{signingOut=current.logout()});
const oldSession={...session('old'),user:{...session('old').user,email:'old@example.test'}};
await act(async()=>{listener('SIGNED_IN',oldSession);authReplies.shift().resolve({data:{user:oldSession.user,session:oldSession}});await oldLogin;await signingOut});
check(current.user,null);check(current.session,null);await unmount();
await mount();let firstLogin,secondLogin;
await act(async()=>{firstLogin=current.login('old@example.test','fixture')});
await act(async()=>{secondLogin=current.login('new@example.test','fixture')});
const newSession={...session('new'),user:{...session('new').user,email:'new@example.test'}};
await act(async()=>{listener('SIGNED_IN',oldSession);authReplies.find(x=>x.email==='old@example.test').resolve({data:{user:oldSession.user,session:oldSession}});await firstLogin});
check(current.user,null);
await act(async()=>{listener('SIGNED_IN',newSession);authReplies.find(x=>x.email==='new@example.test').resolve({data:{user:newSession.user,session:newSession}});await secondLogin});
check(current.user.id,'new');await unmount();fixture.supabase.auth.signInWithPassword=originalSignIn;
// Model the SDK's persist-before-SIGNED_IN ordering, then remount after completed logout.
const originalGetSession=fixture.supabase.auth.getSession, originalSignOut=fixture.supabase.auth.signOut;
let persistedSdkSession=null,finishPersistedLogin;
fixture.supabase.auth.getSession=async()=>({data:{session:persistedSdkSession}});
fixture.supabase.auth.signOut=async()=>{persistedSdkSession=null;listener('SIGNED_OUT',null);return {}};
fixture.supabase.auth.signInWithPassword=()=>new Promise(resolve=>{finishPersistedLogin=()=>{persistedSdkSession=oldSession;listener('SIGNED_IN',oldSession);resolve({data:{user:oldSession.user,session:oldSession}})}});
await mount();let persistedLogin,persistedLogout;
await act(async()=>{persistedLogin=current.login('old@example.test','fixture')});
await act(async()=>{persistedLogout=current.logout()});check(current.loading,true);
await act(async()=>{finishPersistedLogin();await persistedLogin;await persistedLogout});
check(persistedSdkSession,null);check(current.user,null);await unmount();
await mount();check(current.user,null);check(current.session,null);await unmount();
// A queued logout must still clear persisted A if a newer B login subsequently fails.
let finishA,finishB;
fixture.supabase.auth.signInWithPassword=({email})=>new Promise(resolve=>{
 if(email==='old@example.test')finishA=()=>{persistedSdkSession=oldSession;listener('SIGNED_IN',oldSession);resolve({data:{user:oldSession.user,session:oldSession}})};
 else finishB=()=>resolve({error:new Error('Synthetic rejected credentials'),data:{}});
});
await mount();let loginA,logoutA,loginB;
await act(async()=>{loginA=current.login('old@example.test','fixture')});
await act(async()=>{logoutA=current.logout();loginB=current.login('new@example.test','fixture').catch(()=>null)});
await act(async()=>{finishA();await loginA;await logoutA});check(persistedSdkSession,null);
await act(async()=>{finishB();await loginB});check(current.user,null);await unmount();
await mount();check(current.user,null);check(current.session,null);await unmount();
fixture.supabase.auth.getSession=originalGetSession;fixture.supabase.auth.signOut=originalSignOut;fixture.supabase.auth.signInWithPassword=originalSignIn;
// Missing profile is an explicit retryable error, not a free or paid membership decision.
initial=session('a');deferred=[];await mount();
await act(async()=>deferred.shift().resolve({data:null,error:null}));check(current.user,null);check(Boolean(current.authError),true);await unmount();deferred=null;
// Signup provisioning uses the submitted name in the Auth event; duplicate provisioning preserves it.
const originalFrom=fixture.supabase.from;let profileRow=null,signupOptions;
fixture.supabase.from=()=>({upsert:async(value,options)=>{check(options.ignoreDuplicates,true);const row=Array.isArray(value)?value[0]:value;if(!profileRow)profileRow={...row};return {}},update:values=>({eq:async()=>{if(profileRow)Object.assign(profileRow,values);return {}}}),select:()=>({eq:()=>({single:async()=>({data:profileRow})})})});
fixture.supabase.auth.signUp=async args=>{signupOptions=args;const signed={...session('fresh'),user:{...session('fresh').user,email:args.email,user_metadata:args.options.data}};listener('SIGNED_IN',signed);return {data:{user:signed.user,session:signed}}};
initial=null;await mount();await act(async()=>current.signup('fresh@example.test','fixture','Fresh','Member','admin',''));
check(signupOptions.options.data.name,'Fresh Member');check(current.user.name,'Fresh Member');check(current.user.role,'member');check(current.user.plan,'');check(current.user.email,'fresh@example.test');await unmount();
// Confirmed Auth email changes synchronize the legacy lookup key under the existing profile guard.
profileRow={id:'a',role:'admin',plan:'lifetime',email:'old@example.test'};initial=session('a');
await mount();check(current.user.email,'fixture@example.test');check(current.user.plan,'lifetime');await unmount();fixture.supabase.from=originalFrom;
// Delayed signup after logout cannot restore an account.
let finishSignup;fixture.supabase.auth.signUp=()=>new Promise(resolve=>{finishSignup=resolve});initial=null;await mount();let signingUp;
await act(async()=>{signingUp=current.signup('old@example.test','fixture','Old','Name','member','')});await act(async()=>{signingOut=current.logout()});
await act(async()=>{listener('SIGNED_IN',oldSession);finishSignup({data:{user:oldSession.user,session:oldSession}});await signingUp;await signingOut});check(current.user,null);await unmount();
// App's signed-out guard uses resolved auth and retains safe deep links, not stored token presence.
await mount(React.createElement(SignedOut,null,React.createElement('p',null,'Sign in form')));check(JSON.stringify(root.toJSON()).includes('Sign in form'),true);await unmount();
initial=session('a');fixture.location={pathname:'/login',state:{from:{pathname:'/courses/a',search:'?chapter=2',hash:'#notes'}}};
await mount(React.createElement(SignedOut,null,React.createElement('p',null,'Sign in form')));check(root.root.findByType('redirect').props.to,'/courses/a?chapter=2#notes');await unmount();
// An explicit checkout remains single-flight across same-account token refresh.
let started=0,completeCheckout;const destinations=[];window.location.assign=url=>destinations.push(url);
fixture.params='product=quarterly';globalThis.fetch=()=>{started++;return new Promise(resolve=>{completeCheckout=resolve})};
await mount(React.createElement(Checkout));let activePayment;
await act(async()=>{const click=root.root.findAllByType('button').find(b=>b.props.children==='Continue to payment').props.onClick;activePayment=click();await click()});
check(started,1);await act(async()=>listener('TOKEN_REFRESHED',session('a')));
await act(async()=>{completeCheckout({ok:true,json:async()=>({url:'https://checkout.stripe.com/fixture'})});await activePayment});check(destinations,['https://checkout.stripe.com/fixture']);await unmount();
// Each supported explicit product retains its endpoint; no request precedes the click.
for(const [product,endpoint] of [['membership','/membership'],['quarterly','/quarterly'],['dmd','/dmd']]){
 fixture.params='product='+product;let sent=[];globalThis.fetch=async(url)=>{sent.push(url);return {ok:true,json:async()=>({url:'https://checkout.stripe.com/fixture'})}};
 initial=product==='dmd'?null:session('a');await mount(React.createElement(Checkout));check(sent,[]);
 await act(async()=>root.root.findAllByType('button').find(b=>b.props.children==='Continue to payment').props.onClick());check(sent,['https://fixture.invalid'+endpoint]);await unmount();
}
initial=session('a');for(const product of ['constructor','toString','ai-visibility-tracker','unknown']){
 fixture.params='product='+product;await mount(React.createElement(Checkout));check(root.root.findAllByType('button').length,0);check(JSON.stringify(root.toJSON()).includes('Purchase unavailable'),true);await unmount();
}
await mount(React.createElement(Cancel));check(JSON.stringify(root.toJSON()).includes('does not cancel a subscription'),true);check(current.user.role,'admin');await unmount();
await mount(React.createElement(Success));check(JSON.stringify(root.toJSON()).includes('Current account status'),true);check(JSON.stringify(root.toJSON()).includes('admin'),true);await unmount();
// Specialized purchase pages retain their existing explicit endpoint contracts.
for(const [Page,endpoint] of [[Reseller,'/create-reseller-session'],[ProReseller,'/create-pro-reseller-session']]){
 const sent=[];globalThis.fetch=async url=>{sent.push(url);return {ok:true,json:async()=>({url:'https://checkout.stripe.com/specialized-fixture'})}};
 await mount(React.createElement(Page));check(sent,[]);
 const control=root.root.findAll(n=>typeof n.type==='string' && typeof n.props.onClick==='function').find(n=>n.type==='button'||n.type==='a');
 await act(async()=>control.props.onClick({preventDefault(){}}));check(sent,['https://fixture.invalid'+endpoint]);check(window.location.href,'https://checkout.stripe.com/specialized-fixture');await unmount();
}
for(const plan of ['annual','monthly']){
 const sent=[];globalThis.fetch=async url=>{sent.push(url);return {ok:true,json:async()=>url.endsWith('/timer')?{}:{url:'https://checkout.stripe.com/founder-fixture'}}};
 await mount(React.createElement(Founders));check(sent,['https://fixture.invalid/timer']);
 if(plan==='monthly')await act(async()=>root.root.findAllByType('button').find(b=>b.props.children==='Fixture monthly selector').props.onClick());
 await act(async()=>root.root.findAllByType('button').find(b=>b.props.className==='checkout-btn').props.onClick());check(sent,['https://fixture.invalid/timer','https://fixture.invalid/'+plan]);await unmount();
}
console.log(`${count} synthetic auth/routing/checkout assertions passed; no external requests.`);
