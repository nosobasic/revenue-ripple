import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const testRoot = process.env.RR_AUTH_TEST_ROOT || '/tmp/rr-auth-tests';
const require = createRequire(`${testRoot}/package.json`);
const React = require('react');
const { create, act } = require('react-test-renderer');
let requests = [];
globalThis.adminFixture = { from: () => {
  const query = { select: () => query, or: value => { query.search = value; return query; },
    eq: (column, value) => { query.filter = [column,value]; return query; },
    order: () => new Promise(resolve => requests.push({ resolve, query })) };
  return query;
} };
const source = fs.readFileSync('src/pages/Admin.jsx','utf8');
const component = source.slice(source.indexOf('const UserManagement ='), source.indexOf('// Placeholder components'));
await build({ stdin: { contents: `import React from 'react';const RiSearchLine=()=>null,RiFilterLine=()=>null,RiUserAddLine=()=>null;${component}\nexport {UserManagement};export {useAdminUsers} from './src/hooks/useAdminUsers.js';`, resolveDir: process.cwd(), loader:'jsx' },
  bundle:true, platform:'node', format:'cjs', jsx:'automatic', outfile:`${testRoot}/admin-users.cjs`, external:['react','react/jsx-runtime'],
  plugins:[{name:'synthetic-client',setup(b){b.onResolve({filter:/supabase\/client$/},()=>({path:'client',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const supabase=globalThis.adminFixture'}));}}] });
const {useAdminUsers,UserManagement} = require(`${testRoot}/admin-users.cjs`);
const row = id => ({ id, name:`Synthetic ${id}`,email:`${id}@example.invalid`,created_at:'2026-10-22T00:00:00Z',status:'active',role:'member' });
let current,root;
let props;
function Screen() {
  current = useAdminUsers(props);
  return React.createElement(UserManagement,{...current,searchTerm:props.searchTerm,filterStatus:props.filterStatus,
    onRefresh:current.refresh,setSearchTerm:()=>{},setFilterStatus:()=>{},handleRoleChange:()=>{},handleStatusChange:()=>{},handleDeleteUser:()=>{},onEditUser:()=>{},onAddUser:()=>{}});
}
async function mount(overrides={}) {requests=[];props={enabled:true,adminId:'synthetic-admin',pathname:'/admin/users',searchTerm:'',filterStatus:'all',...overrides};await act(async()=>{root=create(React.createElement(Screen));});}
async function update(changes) {props={...props,...changes};await act(async()=>root.update(React.createElement(Screen)));}
async function reply(index,data,error=null) {await act(async()=>requests[index].resolve({data,error}));}
async function unmount(){await act(async()=>root.unmount());}

test('entering Users fetches and re-entering refreshes newly created profiles',async()=>{
  await mount({pathname:'/admin'});assert.equal(requests.length,0);
  await update({pathname:'/admin/users'});await reply(0,[row('one')]);assert.equal(current.users.length,1);
  await update({pathname:'/admin'});await update({pathname:'/admin/users'});await reply(1,[row('one'),row('two')]);
  assert.equal(current.users.length,2);await unmount();
});
test('actual Refresh control requests fresh rows and shows loading state',async()=>{
  await mount();assert.equal(root.root.findAllByType('button').find(b=>b.props.children==='Refreshing…').props.disabled,true);
  await reply(0,[row('one')]);
  await act(async()=>root.root.findAllByType('button').find(b=>b.props.children==='Refresh').props.onClick());
  assert.equal(requests.length,2);await reply(1,[row('new')]);
  assert.ok(JSON.stringify(root.toJSON()).includes('Synthetic new'));await unmount();
});
test('older overlapping response cannot overwrite latest search results',async()=>{
  await mount();await update({searchTerm:'new'});await reply(1,[row('new')]);await reply(0,[row('old')]);
  assert.equal(current.users[0].id,'new');assert.ok(requests[1].query.search.includes('new'));await unmount();
});
test('navigation or loss of admin access invalidates in-flight rows',async()=>{
  await mount();await update({enabled:false,adminId:undefined});await reply(0,[row('private')]);
  assert.deepEqual(current.users,[]);assert.equal(requests.length,1);await unmount();
});
test('query errors show sanitized retry UI and Refresh recovers',async()=>{
  await mount();await reply(0,null,{message:'private-sql-and-email'});
  assert.ok(root.root.findByProps({role:'alert'}).children.join('').includes('Please refresh'));
  assert.ok(!JSON.stringify(root.toJSON()).includes('private-sql'));
  await act(async()=>current.refresh());await reply(1,[row('recovered')]);
  assert.equal(current.error,null);assert.equal(current.users[0].id,'recovered');await unmount();
});
test('status filter is preserved and stale errors cannot replace successful rows',async()=>{
  await mount();await update({filterStatus:'inactive'});assert.deepEqual(requests[1].query.filter,['status','inactive']);
  await reply(1,[{...row('inactive'),status:'inactive'}]);await reply(0,null,{message:'old-error'});
  assert.equal(current.error,null);assert.equal(current.users[0].id,'inactive');await unmount();
});
