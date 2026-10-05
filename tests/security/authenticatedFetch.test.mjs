import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../../src/lib/authenticatedFetch.js',import.meta.url),'utf8');
const factory=new Function('supabase','getApiBase','window','fetch',source.replace(/^import .*;\n/gm,'').replace('export async function','async function')+';return authenticatedFetch;');
test('API bearer identity overrides supplied headers and stays on the backend origin',async()=>{
 let sent;
 const api=factory({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-token'}}})}},()=> 'https://api.example.test',{location:{origin:'https://app.example.test'}},async(u,o)=>{sent={u,o};return {ok:true};});
 await api('https://api.example.test/private',{headers:{Authorization:'Bearer spoof','x-user-role':'admin'}});
 assert.equal(sent.o.headers.get('Authorization'),'Bearer synthetic-token');
 assert.equal(sent.o.headers.has('x-user-role'),false);
 sent=null;await assert.rejects(api('https://untrusted.example.test'),/Unexpected API/);assert.equal(sent,null);
});
test('no session never calls the backend',async()=>{
 let called=false;
 const api=factory({auth:{getSession:async()=>({data:{session:null}})}},()=> 'https://api.example.test',{location:{origin:'https://app.example.test'}},async()=>{called=true;});
 await assert.rejects(api('https://api.example.test/private'),/sign in/);assert.equal(called,false);
});
