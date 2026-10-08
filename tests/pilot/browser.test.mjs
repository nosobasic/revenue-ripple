// Offline Chromium UI verification. Fresh profile; requests allowed only to fixture server.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'rr-visibility-chrome-'));
const chromium='/Users/donte/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
const child=spawn(chromium,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`],{stdio:['ignore','ignore','pipe']});
let socket;let mode='guest';
const fixtureUser={id:'00000000-0000-0000-0000-000000000001',email:'owner@example.test',email_confirmed_at:'2026-01-01T00:00:00Z',aud:'authenticated',role:'authenticated',user_metadata:{}};
const fixtureSession={access_token:'fixture-only-not-a-real-token',refresh_token:'fixture-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user:fixtureUser};
try {
 const endpoint=await new Promise((resolve,reject)=>{
  let log='';const timer=setTimeout(()=>reject(Error('Chromium start timed out')),15000);
  child.stderr.on('data',chunk=>{log+=chunk;const m=log.match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
  child.on('exit',()=>{clearTimeout(timer);reject(Error('Chromium exited before startup'));});
 });
 socket=new WebSocket(endpoint);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
 let id=0;const pending=new Map();const errors=[];const blocked=[];
 function call(method,params={},sessionId){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params,...(sessionId?{sessionId}:{})}));});}
 socket.addEventListener('message',event=>{
  const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.reject(Error(JSON.stringify(m.error))):p?.resolve(m.result);}
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);
  if(m.method==='Fetch.requestPaused'){
   const p=m.params;if(p.request.url.startsWith('http://127.0.0.1:5187/'))call('Fetch.continueRequest',{requestId:p.requestId},m.sessionId);
   else {
    const url=p.request.url; let body={}; let status=200;
    if(url.includes('/api/visibility-pilot/status')) { status=mode==='owner'?200:403;body=mode==='owner'?{status:'preparing',scans_enabled:false,message:'Your owner pilot is in preparation. Live scans are unavailable. No scan credit has been used.'}:{}; }
    else if(url.includes('/auth/v1/user')) body=fixtureUser;
    else if(url.includes('/auth/v1/token')) body=fixtureSession;
    else if(url.includes('/rest/v1/users')) body={...fixtureUser,role:'member'};
    else if(url.includes('/rest/')) body=[];
    if(p.request.method==='OPTIONS'){status=200;body={};}
    blocked.push(url);call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'http://127.0.0.1:5187'},{name:'Access-Control-Allow-Credentials',value:'true'},{name:'Access-Control-Allow-Headers',value:'authorization, apikey, x-client-info, content-type, prefer, accept-profile, content-profile, x-supabase-api-version'},{name:'Access-Control-Allow-Methods',value:'GET, POST, PATCH, OPTIONS'}],body:Buffer.from(JSON.stringify(body)).toString('base64')},m.sessionId);
   }
  }
 });
 const {targetId}=await call('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
 await call('Runtime.enable',{},sessionId);await call('Page.enable',{},sessionId);await call('Fetch.enable',{patterns:[{urlPattern:'*'}]},sessionId);
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false},sessionId);
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=async expression=>{for(let n=0;n<100;n++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,200));}throw Error('UI condition timed out: '+expression+'; text: '+await evaluate('document.body.innerText')+'; requests: '+JSON.stringify(blocked));};

 await call('Page.navigate',{url:'http://127.0.0.1:5187/'},sessionId);
 await wait("document.body.innerText.includes('Build Your Marketing Skills.')");
 for(const width of [1280,390]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700},sessionId);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),true);
  const content=await evaluate('document.body.innerText');
  assert.ok(content.includes('Live scans and new premium purchases are not available yet.'));
  assert.ok(content.includes('One lifetime allowance'));assert.ok(content.includes('$47'));
  assert.ok(!/30.day.*guarantee|50% commission|premium features.*free/i.test(content));
  await fs.writeFile(`/tmp/rr-pilot-home-${width}.png`,Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true},sessionId)).data,'base64'));
 }
 await call('Page.navigate',{url:'http://127.0.0.1:5187/membership'},sessionId);
 await wait("document.body.innerText.includes('Planned premium')");
 assert.ok(await evaluate("document.body.innerText.includes('No rollover') && document.body.innerText.includes('No automatic enrollment')"));
 await call('Page.navigate',{url:'http://127.0.0.1:5187/visibility-pilot'},sessionId);
 await wait("location.pathname==='/login'");
 assert.ok(await evaluate("!!document.querySelector('input[type=email]')"));
 mode='owner';
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('revenue-ripple-auth-token',${JSON.stringify(JSON.stringify(JSON.stringify(fixtureSession)))});`},sessionId);
 await call('Page.navigate',{url:'http://127.0.0.1:5187/visibility-pilot'},sessionId);
 await wait("document.body.innerText.includes('Your owner pilot is in preparation')");
 assert.ok(await evaluate("[...document.querySelectorAll('button')].some(x=>x.disabled && x.textContent.includes('Live scans not available'))"));
 assert.ok(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"));
 mode='member';
 await call('Page.reload',{},sessionId);
 await wait("document.body.innerText.includes('limited to the owner account')");
 assert.ok(await evaluate("[...document.querySelectorAll('a')].some(x=>x.getAttribute('href')==='/dashboard' && x.textContent.includes('Continue learning'))"));
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log('PASS: homepage desktop/mobile, accurate offer, no overflow, login redirect, owner preparation, non-owner denial, disabled scan action, free-learning navigation; all external requests mocked.');
} finally {
 socket?.close();child.kill('SIGKILL');if(child.exitCode===null)await new Promise(resolve=>child.once('exit',resolve));
 await fs.rm(profile,{recursive:true,force:true});
}
