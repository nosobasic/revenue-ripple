// Isolated PostgreSQL WASM only. Never loads .env or accepts a database URL.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const packagePath = process.env.RR_PGLITE_PACKAGE;
if (!packagePath) throw new Error('Set RR_PGLITE_PACKAGE to a local @electric-sql/pglite dist/index.js');
const { PGlite } = await import(pathToFileURL(packagePath));
const db = new PGlite();
const A='00000000-0000-0000-0000-000000000001';
const B='00000000-0000-0000-0000-000000000002';
const ADMIN='00000000-0000-0000-0000-000000000003';
const C='00000000-0000-0000-0000-000000000004';
let passed=0;
const eq=(actual,expected)=>{assert.deepEqual(actual,expected);passed++;};
async function denied(sql) {
  await assert.rejects(db.exec(sql),e=>e.code==='42501'); passed++;
}
async function actor(role,id='',email='') {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:id,email,role})]);
  await db.exec(`SET ROLE ${role}`);
}
const count=async table=>(await db.query(`SELECT count(*)::int AS n FROM public.${table}`)).rows[0].n;
await db.exec(`
CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
$$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(auth.jwt()->>'sub','')::uuid $$;
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
CREATE TABLE public.users (
 id uuid PRIMARY KEY,email text,role text DEFAULT 'member',plan text,status text DEFAULT 'active',
 name text,phone text,company text,bio text,paypal_email text,username text,
 commission_rate numeric DEFAULT 0.5,is_founder boolean DEFAULT false,
 subscription_type text,founder_benefits jsonb,has_paid boolean DEFAULT false,
 payment_status text DEFAULT 'pending',value_engine_segment text,
 value_engine_last_seen timestamptz,created_at timestamptz DEFAULT now(),updated_at timestamptz
);
CREATE TABLE public.payments(id int PRIMARY KEY,user_id uuid,email text,amount numeric);
CREATE TABLE public.subscriptions(id int PRIMARY KEY,email text,status text);
INSERT INTO users(id,email,role) VALUES ('${A}','a@example.test','member'),('${B}','b@example.test','member'),('${ADMIN}','admin@example.test','admin');
INSERT INTO payments VALUES (1,'${A}','a@example.test',10),(2,'${B}','b@example.test',20);
INSERT INTO subscriptions VALUES (1,'a@example.test','active'),(2,'b@example.test','active');
GRANT ALL ON users,payments,subscriptions TO anon,authenticated,service_role;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$ SELECT EXISTS(SELECT 1 FROM users WHERE id=auth.uid() AND role='admin') $$;
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING(is_admin());
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING(is_admin());
CREATE POLICY "Allow_Insert" ON users FOR INSERT WITH CHECK(true);
CREATE POLICY "Allow_read" ON users FOR SELECT USING(true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING(auth.uid()=id);
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING(auth.uid()=id);
CREATE POLICY "update" ON users FOR UPDATE USING(true) WITH CHECK(true);
CREATE POLICY "Service role can manage payments" ON payments FOR ALL WITH CHECK(true);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING(
user_id=auth.uid() OR email=(SELECT users.email FROM users WHERE users.id=auth.uid()) OR
EXISTS(SELECT 1 FROM users WHERE users.id=auth.uid() AND users.role='admin'));
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL WITH CHECK(true);
CREATE POLICY "Users can view related subscriptions" ON subscriptions FOR SELECT USING(
email=(SELECT users.email FROM users WHERE users.id=auth.uid()) OR
EXISTS(SELECT 1 FROM users WHERE users.id=auth.uid() AND users.role='admin'));
`);
await db.exec(`
CREATE TABLE commissions(id int,referrer_username text,email text,amount numeric);
CREATE TABLE tripwire_purchases(id int,email text);
CREATE TABLE webhook_logs(id int,detail text);
CREATE TABLE user_engagement(id int,user_id uuid,session_id text);
GRANT ALL ON commissions,tripwire_purchases,webhook_logs,user_engagement TO anon,authenticated,service_role;
GRANT SELECT(email),INSERT(email) ON commissions TO anon;
GRANT SELECT(session_id),UPDATE(session_id) ON user_engagement TO authenticated;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tripwire_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert for all users" ON commissions FOR INSERT WITH CHECK(true);
CREATE POLICY "Allow update for all users" ON commissions FOR UPDATE USING(true) WITH CHECK(true);
CREATE POLICY "Service role can insert commissions" ON commissions FOR INSERT WITH CHECK(true);
CREATE POLICY "commissions select" ON commissions FOR SELECT USING(true);
CREATE POLICY "Users can view own commissions" ON commissions FOR SELECT USING(referrer_username=auth.uid()::text OR is_admin());
CREATE POLICY "Service role can insert purchases" ON tripwire_purchases FOR INSERT WITH CHECK(true);
CREATE POLICY "Users can view own purchases" ON tripwire_purchases FOR SELECT USING(email=(SELECT email FROM users WHERE id=auth.uid()) OR is_admin());
CREATE POLICY "Service role can insert webhook logs" ON webhook_logs FOR INSERT WITH CHECK(true);
CREATE POLICY "Admins can view webhook logs" ON webhook_logs FOR SELECT USING(is_admin());
INSERT INTO commissions VALUES(1,'${A}','a@example.test',10),(2,'${B}','b@example.test',20);
INSERT INTO tripwire_purchases VALUES(1,'a@example.test'),(2,'b@example.test');
INSERT INTO webhook_logs VALUES(1,'synthetic');
INSERT INTO user_engagement VALUES(1,'${A}','synthetic-session');
`);
// Reproduce exact pre-change policy behavior; grants alone do not prove row access.
await actor('anon'); eq(await count('payments'),0); eq(await count('subscriptions'),0); eq(await count('users'),3);
eq(await count('commissions'),2);
await db.exec(`UPDATE users SET role='admin' WHERE id='${A}'; UPDATE commissions SET amount=999 WHERE id=1; INSERT INTO subscriptions VALUES(99,'fake@example.test','active')`);
await actor('postgres');
eq((await db.query(`SELECT role FROM users WHERE id='${A}'`)).rows[0].role,'admin');
eq((await db.query('SELECT amount FROM commissions WHERE id=1')).rows[0].amount,'999');
eq(await count('subscriptions'),3);
await db.exec(`UPDATE users SET role='member' WHERE id='${A}'; UPDATE commissions SET amount=10 WHERE id=1; DELETE FROM subscriptions WHERE id=99`);
await actor('anon');
await db.exec(`INSERT INTO payments VALUES(99,'${A}','a@example.test',999)`);
await actor('postgres'); eq(await count('payments'),3);
await db.exec('DELETE FROM payments WHERE id=99');
await actor('postgres');
const migration = process.env.RR_SECURITY_MIGRATION || new URL('../../supabase/migrations/2026-10-05-security-containment.sql',import.meta.url);
await db.exec(await fs.readFile(migration,'utf8'));
await actor('anon');
for(const table of ['users','payments','subscriptions','commissions','tripwire_purchases','webhook_logs','user_engagement']) {
  await denied(`SELECT * FROM ${table}`);
  await denied(`DELETE FROM ${table}`);
}
await denied(`INSERT INTO users(id,email,role) VALUES('${C}','c@example.test','admin')`);
await denied(`UPDATE users SET role='admin'`);
await actor('authenticated',A,'a@example.test');
await denied('SELECT session_id FROM user_engagement');
await denied("UPDATE user_engagement SET session_id='bad'");
eq(await count('commissions'),1);eq(await count('tripwire_purchases'),1);eq(await count('webhook_logs'),0);
await denied('TRUNCATE users');
eq(await count('users'),1);eq(await count('payments'),1);eq(await count('subscriptions'),1);
await db.exec(`UPDATE users SET name='A',phone='123',company='Test',bio='Hello',paypal_email='p@example.test',value_engine_last_seen=now() WHERE id='${A}'`);
eq((await db.query('SELECT name FROM users')).rows[0].name,'A');
for(const change of ["role='admin'","role='reseller'","plan='partner'","has_paid=true","payment_status='completed'","is_founder=true","commission_rate=1","status='disabled'","username='victim'","founder_benefits='{}'::jsonb","subscription_type='annual'","value_engine_segment='partner'",`id='${C}'`,"created_at='2000-01-01'","email='b@example.test'"]) {
  await denied(`UPDATE users SET ${change} WHERE id='${A}'`);
}
await db.exec(`UPDATE users SET name='attacker' WHERE id='${B}'`);
eq((await db.query(`SELECT name FROM users WHERE id='${B}'`)).rows.length,0);
for(const table of ['payments','subscriptions','commissions','tripwire_purchases','webhook_logs']) {
  await denied(`UPDATE ${table} SET id=99`); await denied(`DELETE FROM ${table}`);
  await denied(`INSERT INTO ${table}(id) VALUES(99)`);
}
await actor('authenticated',B,'b@example.test');
eq((await db.query('SELECT id FROM payments')).rows.map(x=>x.id),[2]);
eq((await db.query('SELECT name FROM users')).rows[0].name,null);
await actor('authenticated',C,'c@example.test');
await denied(`INSERT INTO users(id,email,role) VALUES('${C}','c@example.test','admin')`);
await denied(`INSERT INTO users(id,email,role,has_paid) VALUES('${C}','c@example.test','member',true)`);
await denied(`INSERT INTO users(id,email,role) VALUES('${C}','b@example.test','member')`);
await denied(`INSERT INTO users(id,email,role,plan,status,name) VALUES('${C}','c@example.test','member','','active','C')`);
await db.exec(`INSERT INTO users(id,email,role,plan,status,name,commission_rate) VALUES('${C}','c@example.test','member','','active','C',0)`);
eq(await count('users'),1);
await actor('authenticated',ADMIN,'admin@example.test');
eq(await count('users'),4);eq(await count('payments'),2);eq(await count('commissions'),2);eq(await count('webhook_logs'),1);
await db.exec(`UPDATE users SET role='affiliate' WHERE id='${B}'`);
eq((await db.query(`SELECT role FROM users WHERE id='${B}'`)).rows[0].role,'affiliate');
await actor('service_role');eq(await count('user_engagement'),1);
await db.exec(`UPDATE users SET plan='partner',has_paid=true WHERE id='${B}'; INSERT INTO payments VALUES(3,'${B}','b@example.test',30); UPDATE payments SET amount=31 WHERE id=3; DELETE FROM payments WHERE id=3; INSERT INTO subscriptions VALUES(3,'c@example.test','active'); DELETE FROM subscriptions WHERE id=3;`);
eq(await count('payments'),2);
await actor('postgres');
// Subsequent new sensitive columns must also be protected by the whole-row guard.
await db.exec('ALTER TABLE users ADD COLUMN future_privilege boolean DEFAULT false');
await actor('authenticated',A,'a@example.test');
await denied(`UPDATE users SET future_privilege=true WHERE id='${A}'`);
await db.close();
console.log(`PASS: ${passed} PostgreSQL security assertions (synthetic in-memory fixtures only)`);
