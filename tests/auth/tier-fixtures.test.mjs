// Read an explicitly supplied reviewed SQL draft. Execute only in isolated PGlite.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
if (!process.env.RR_ACCESS_SQL || !process.env.RR_PGLITE_PACKAGE) throw Error('Set RR_ACCESS_SQL and RR_PGLITE_PACKAGE to local files. Never supply a database URL.');
const { PGlite } = await import(pathToFileURL(process.env.RR_PGLITE_PACKAGE));
const db = new PGlite();
let checks=0;const equal=(a,b)=>{assert.deepEqual(a,b);checks++};
const id='00000000-0000-0000-0000-000000000001';
try {
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
 GRANT USAGE ON SCHEMA public,auth TO service_role,authenticated,anon;
 GRANT SELECT ON auth.users TO service_role; INSERT INTO auth.users VALUES('${id}','synthetic@example.test');`);
 await db.exec(await fs.readFile(process.env.RR_ACCESS_SQL,'utf8'));
 await db.exec('SET ROLE service_role');
 const access=async()=> (await db.query('SELECT rr_access($1) value',[id])).rows[0].value;
 equal((await access()).plan,'free');equal((await access()).remaining,1);
 // Affiliate partnership is separate from paid subscription and never grants premium credits.
 await db.query("INSERT INTO rr_partners VALUES($1,'fixture','affiliate',true)",[id]);
 equal((await access()).plan,'free');
 // Reseller/pro rules below are test data, not activation of real offers or prices.
 await db.exec("INSERT INTO rr_plan_rules VALUES('reseller',20,'month','fixture_reseller',true),('pro_reseller',30,'month','fixture_pro',true)");
 for (const [plan,limit] of [['premium',10],['reseller',20],['pro_reseller',30]]) {
  await db.query("INSERT INTO rr_subscriptions VALUES('fixture_sub',$1,$2,'active',now()+interval '1 day',1,false) ON CONFLICT(subscription_id) DO UPDATE SET plan=excluded.plan,status='active',paid_until=excluded.paid_until",[id,plan]);
  equal((await access()).plan,plan);equal((await access()).limit,limit);
  await db.exec("UPDATE rr_subscriptions SET cancel_at_period_end=true");equal((await access()).plan,plan);
  await db.exec("UPDATE rr_subscriptions SET paid_until=now()-interval '1 day'");equal((await access()).plan,'free');
 }
 await db.exec("UPDATE rr_subscriptions SET paid_until=now()+interval '1 day'; UPDATE rr_plan_rules SET enabled=false WHERE plan='pro_reseller'");
 equal((await access()).plan,'free');
 console.log(`${checks} isolated tier mapping assertions passed (reviewed SQL draft; no live billing/scans).`);
} finally { await db.close(); }
