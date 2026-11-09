import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {create,act} from 'react-test-renderer';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
const dir=await mkdtemp(path.join(process.cwd(),'node_modules/.allowance-'));
await build({entryPoints:['src/components/VisibilityTool.jsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',outfile:path.join(dir,'tool.cjs'),external:['react','react/jsx-runtime']});
const Tool=createRequire(import.meta.url)(path.join(dir,'tool.cjs')).default;
const base={enabled:true,remaining:1,reserved:0,used:0,limit:1,period:'lifetime',plan:'free',bonus:{limit:0,reserved:0,used:0,remaining:0}};
const cases=[
 ['available',{},null,false],
 ['disabled with unused credit',{enabled:false},/New scans are not available/,true],
 ['exhausted admitted',{remaining:0,used:1},/No scan credits are available/,true],
 ['exhausted admission closed',{enabled:false,remaining:0,used:1},/No scan credits are available/,true],
 ['base reserved',{enabled:false,remaining:0,reserved:1},/Scan credit is reserved/,true],
 ['bonus reserved',{enabled:false,remaining:0,used:1,bonus:{limit:1,reserved:1,used:0,remaining:0}},/Scan credit is reserved/,true],
 ['bonus available',{remaining:1,used:1,bonus:{limit:1,reserved:0,used:0,remaining:1}},null,false],
 ['refunded credit',{remaining:1},null,false],
 ['monthly exhausted',{remaining:0,used:10,limit:10,period:'month',plan:'member'},/No scan credits are available/,true],
];
try {for(const [name,overrides,notice,disabled] of cases) await test(name,async()=>{
 let root;const calls=[];const api=async(url)=>{calls.push(url);return {ok:true,json:async()=>url.endsWith('/access')?{...base,...overrides}:url.endsWith('/latest')?{job:null}:{prompts:['one','two','three'],preview_hash:'synthetic',input:{}}};};
 await act(async()=>{root=create(React.createElement(Tool,{api}));});
 const notices=root.root.findAll(x=>x.props['data-testid']==='allowance-notice');
 if(notice)assert.match(notices[0].children.join(''),notice);else assert.equal(notices.length,0);
 assert.doesNotMatch(JSON.stringify(root.toJSON()),/Scans are not enabled yet/);
 await act(async()=>{await root.root.findByType('form').props.onSubmit({preventDefault(){}});});
 const submit=root.root.findAllByType('button').find(b=>b.children.join('').startsWith('Use '));
 assert.equal(submit.props.disabled,disabled);assert.equal(calls.filter(x=>x==='/api/visibility/jobs').length,0);
 await act(async()=>root.unmount());
 });
 for(const status of ['queued','running','reconciliation','completed','failed']) await test('saved job state: '+status,async()=>{
 let root;
 const held=['queued','running','reconciliation'].includes(status);
 const access={...base,enabled:false,remaining:status==='failed'?1:0,reserved:held?1:0,used:status==='completed'?1:0};
 const api=async(url)=>({ok:true,json:async()=>url.endsWith('/access')?access:{job:{id:'synthetic',status,completed_questions:0,error:status==='failed'?'Credit restored.':null}}});
 await act(async()=>{root=create(React.createElement(Tool,{api}));});
 const notice=root.root.find(x=>x.props['data-testid']==='allowance-notice').children.join('');
 assert.match(notice,held?/Scan credit is reserved/:status==='completed'?/No scan credits are available/:/New scans are not available/);
 if(status==='queued')assert.match(JSON.stringify(root.toJSON()),/Your scan is queued/);
 if(status==='running')assert.match(JSON.stringify(root.toJSON()),/Checking your questions/);
 if(status==='failed')assert.match(JSON.stringify(root.toJSON()),/Credit restored/);
 await act(async()=>root.unmount());
 });
 for(const count of [0,3]) await test('API completed result with '+count+' supported actions',async()=>{
 let root;
 const result={business_name:'Synthetic',domain:'synthetic.example',checked_at:'2026-11-09T00:00:00Z',evidence:[],actions:Array.from({length:count},(_,i)=>({title:'Action '+i,action:'Synthetic action',evidence:'Synthetic evidence'})),limitations:'Synthetic limitations'};
 const api=async(url)=>({ok:true,json:async()=>url.endsWith('/access')?{...base,remaining:0,used:1}:{job:{id:'synthetic',status:'completed',result}}});
 await act(async()=>{root=create(React.createElement(Tool,{api}));});
 const text=JSON.stringify(root.toJSON());
 assert.equal(text.includes('No evidence-backed actions were identified'),count===0);
 assert.equal(root.root.findAllByType('li').length,count);
 assert.match(text,/up to 3 evidence-backed actions/);
 await act(async()=>root.unmount());
 });}finally{await rm(dir,{recursive:true,force:true});}
