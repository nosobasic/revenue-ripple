// Local-only PostgreSQL WASM fixture over stdio. No sockets or .env.
import readline from 'node:readline';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { PGlite } = await import(pathToFileURL(process.env.RR_PGLITE_PACKAGE || '/tmp/rr-security-validation/pglite/dist/index.js'));
const db=new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
GRANT USAGE ON SCHEMA public,auth TO service_role,authenticated,anon;
GRANT SELECT ON auth.users TO service_role;
INSERT INTO auth.users VALUES('00000000-0000-0000-0000-000000000001','a@example.test'),('00000000-0000-0000-0000-000000000002','b@example.test');`);
await db.exec(await fs.readFile('tests/visibility/fixtures/access.sql','utf8'));
await db.exec(await fs.readFile('tests/visibility/unrelated_functions.sql','utf8'));
await db.exec(await fs.readFile('tests/visibility/fixtures/visibility-jobs.sql','utf8'));
await db.exec("UPDATE rr_v_config SET enabled=true,provider='fixture',budget_micros=10000000");
console.log('READY');
for await (const line of readline.createInterface({input:process.stdin})) {
  try {
    const message=JSON.parse(line);const args=message.args;let result;
    if(message.name==='sql')result=(await db.query(args.sql,args.args||[])).rows;
    else {
      const name=message.name;if(!/^rr_v_[a-z_]+$/.test(name))throw Error('unknown RPC');
      const keys=Object.keys(args);if(keys.some(k=>!/^p_[a-z_]+$/.test(k)))throw Error('invalid key');
      const expressions=keys.map((key,i)=>`${key} => $${i+1}`).join(',');
      result=(await db.query(`SELECT public.${name}(${expressions}) AS result`,keys.map(k=>args[k]))).rows[0].result;
    }
    console.log(JSON.stringify({result},(_,value)=>typeof value==='bigint'?Number(value):value));
  } catch(e) { console.log(JSON.stringify({error:e.message})); }
}
await db.close();
