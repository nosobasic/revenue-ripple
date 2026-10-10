// Local synthetic UI only. No auth/backend/Stripe requests are possible.
import { build } from 'esbuild';
import { mkdir, writeFile, copyFile, readdir } from 'node:fs/promises';
const out = '/tmp/rr-profile-preview';
await mkdir(`${out}/assets/icons`,{recursive:true});
await mkdir(`${out}/assets/images/images`,{recursive:true});
await copyFile('public/assets/images/images/skyline.png',`${out}/assets/images/images/skyline.png`);
await copyFile('public/assets/icons/revenue_ripple_no_bg.png',`${out}/assets/icons/revenue_ripple_no_bg.png`);
const css = (await readdir('dist/assets')).find(name=>/^index-.*\.css$/.test(name));
await copyFile(`dist/assets/${css}`,`${out}/base.css`);
await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter} from 'react-router-dom';import Profile from './src/pages/Profile.jsx';createRoot(document.getElementById('root')).render(<BrowserRouter><Profile /></BrowserRouter>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,external:['/assets/*','/images/*'],outfile:`${out}/preview.js`,define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'safe-preview',setup(b){
 b.onResolve({filter:/AuthContext|useUserRole|authenticatedFetch|routePrefetch|config\/constants/},a=>({path:a.path,namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path.includes('AuthContext')?`const user={id:'synthetic',name:'Alexandria Example Long Profile Name',email:'synthetic-member-with-a-long-email@example.test',role:'admin',plan:'lifetime'};export const useAuth=()=>({user,updateUserProfile:async()=>{},logout:async()=>{}});`:a.path.includes('useUserRole')?`export const useUserRole=()=>({role:'admin',isAdmin:true,isAffiliate:false});`:a.path.includes('authenticatedFetch')?`export async function authenticatedFetch(path){return {ok: !location.search.includes('unavailable') && !path.endsWith('portal'),json:async()=>({state:path.endsWith('portal')?'unavailable':location.search.includes('linked')?'linked':location.search.includes('unavailable')?'unavailable':'not_linked'})}}`:a.path.includes('routePrefetch')?'export const prefetchRoute=()=>{};':'export const logger={error:()=>{}};',loader:'js'}));
}}]});
await writeFile(`${out}/index.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:"><title>Profile — synthetic local preview</title><link rel="stylesheet" href="/base.css"><link rel="stylesheet" href="/preview.css"></head><body><div id="root"></div><script src="/preview.js"></script></body></html>`);
console.log(`Synthetic preview built at ${out}`);
