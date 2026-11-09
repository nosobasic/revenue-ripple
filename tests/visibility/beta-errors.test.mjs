import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {create,act} from 'react-test-renderer';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
const dir=await mkdtemp(path.join(process.cwd(),'node_modules/.beta-errors-'));
await build({entryPoints:['src/components/VisibilityTool.jsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',outfile:path.join(dir,'tool.cjs'),external:['react','react/jsx-runtime']});
const Tool=createRequire(import.meta.url)(path.join(dir,'tool.cjs')).default;

const access={enabled:true,remaining:1,reserved:0,used:0,limit:1,period:'lifetime',plan:'free'};
try { for(const [error,message] of [
 ['beta_unavailable','This beta is not available for this account. Your learning access continues.'],
 ['beta_complete','This account has reached the beta scan attempt limit. Your saved results and learning access remain available.']
]) await test(error+' is readable after a denied submission and retry',async()=>{
 let root; const submissions=[];
 const api=async(url,options)=>{
  if(url==='/api/visibility/jobs'){submissions.push(options);return {ok:false,status:error==='beta_unavailable'?403:409,json:async()=>({error})};}
  return {ok:true,json:async()=>url.endsWith('/access')?access:url.endsWith('/latest')?{job:null}:{prompts:['one','two','three'],preview_hash:'synthetic',input:{business_name:'Synthetic'}}};
 };
 await act(async()=>{root=create(React.createElement(Tool,{api}));});
 await act(async()=>{await root.root.findByType('form').props.onSubmit({preventDefault(){}});});
 const submit=()=>root.root.findAllByType('button').find(b=>b.children.join('')==='Use starter credit');
 for(let i=0;i<2;i++){
  await act(async()=>{await submit().props.onClick();});
  const alert=root.root.find(x=>x.props.role==='alert');
  assert.equal(alert.findByType('p').children.join(''),message);
  assert.doesNotMatch(JSON.stringify(root.toJSON()),new RegExp(error));
  assert.equal(submit().props.disabled,false);
 }
 assert.equal(submissions.length,2);
 assert.equal(submissions[0].headers['Idempotency-Key'],submissions[1].headers['Idempotency-Key']);
 assert.equal(submissions[0].body,submissions[1].body);
 await act(async()=>root.unmount());
 });} finally {await rm(dir,{recursive:true,force:true});}
