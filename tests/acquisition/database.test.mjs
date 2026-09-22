// Run with PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node --test tests/acquisition/database.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(
  process.env.PGLITE_MODULE
    ? pathToFileURL(process.env.PGLITE_MODULE).href
    : "@electric-sql/pglite"
);
test("migration, RLS, approval enforcement, delivery idempotency, attribution, and metrics", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../../supabase/migrations/001_content_engine.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(
      await readFile(
        new URL(
          "../../supabase/migrations/002_acquisition_engine.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const scalar = async (sql, params = []) =>
      Object.values((await db.query(sql, params)).rows[0])[0];
    const actor = await scalar(
      "insert into auth.users values(gen_random_uuid()) returning id",
    );
    const campaign = await scalar(
      `insert into acquisition_campaigns(name,objective,idea,cta_label,destination_url,created_by) values('Test','Leads','Idea','Guide','https://revenueripple.org/survival-playbook',$1) returning id`,
      [actor],
    );
    const post = await scalar(
      `insert into acquisition_posts(campaign_id,platform,body) values($1,'linkedin','Useful copy') returning id`,
      [campaign],
    );
    const transition = (action, revision = 1, body = null, at = null) =>
      db.query("select * from acquisition_transition($1,$2,$3,$4,$5,$6)", [
        post,
        revision,
        action,
        actor,
        body,
        at,
      ]);
    await assert.rejects(
      transition(
        "schedule",
        1,
        null,
        new Date(Date.now() + 60000).toISOString(),
      ),
      /Invalid post transition/,
    );
    assert.equal(
      (await db.query("select * from acquisition_claim()")).rows.length,
      0,
    );
    await transition("submit");
    await transition("approve");
    await assert.rejects(
      transition(
        "schedule",
        1,
        null,
        new Date(Date.now() - 60000).toISOString(),
      ),
      /future/,
    );
    await transition("edit", 1, "Changed copy");
    assert.equal(
      await scalar("select approved_at from acquisition_posts where id=$1", [
        post,
      ]),
      null,
    );
    await assert.rejects(transition("submit", 1), /Post changed/);
    await transition("submit", 2);
    await transition("approve", 2);
    await transition(
      "schedule",
      2,
      null,
      new Date(Date.now() + 60000).toISOString(),
    );
    await db.query(
      "update acquisition_posts set scheduled_at=now()-interval '1 minute' where id=$1",
      [post],
    );
    await db.query(
      "update acquisition_campaigns set status='paused' where id=$1",
      [campaign],
    );
    assert.equal(
      (await db.query("select * from acquisition_claim()")).rows.length,
      0,
    );
    await db.query(
      "update acquisition_campaigns set status='active' where id=$1",
      [campaign],
    );
    const claimed = (await db.query("select * from acquisition_claim()")).rows;
    assert.equal(claimed.length, 1);
    assert.equal(
      (await db.query("select * from acquisition_claim()")).rows.length,
      0,
    );
    await assert.rejects(
      db.query("select acquisition_delivery($1,gen_random_uuid(),$2,$3,null)", [
        post,
        "social-id",
        "https://example.com/post",
      ]),
      /Invalid delivery token/,
    );
    await db.query("select acquisition_delivery($1,$2,$3,$4,null)", [
      post,
      claimed[0].delivery_token,
      "social-id",
      "https://example.com/post",
    ]);
    await db.query("select acquisition_delivery($1,$2,$3,$4,null)", [
      post,
      claimed[0].delivery_token,
      "social-id",
      "https://example.com/post",
    ]);
    assert.equal(
      await scalar(
        "select count(*)::int from acquisition_activity where event='published'",
      ),
      1,
    );
    assert.equal(
      await scalar("select count(*)::int from acquisition_revisions"),
      2,
    );
    await assert.rejects(
      transition("edit", 2, "Cannot change published copy"),
      /Invalid post transition/,
    );
    await db.query("select acquisition_social_metrics($1,100,5,now())", [post]);
    await db.query(
      "select acquisition_social_metrics($1,50,2,now()-interval '1 hour')",
      [post],
    );
    assert.equal(
      await scalar("select impressions::int from acquisition_metrics"),
      100,
    );
    const first = await scalar(
      "insert into acquisition_touches(post_id,created_at) values($1,now()-interval '2 days') returning id",
      [post],
    );
    const last = await scalar(
      "insert into acquisition_touches(post_id) values($1) returning id",
      [post],
    );
    await db.query(
      "select acquisition_record_lead(' TEST@example.com ','guide',$1,$2)",
      [last, first],
    );
    let lead = (await db.query("select * from acquisition_leads")).rows[0];
    assert.equal(lead.first_touch_id, first);
    assert.equal(lead.last_touch_id, last);
    await db.query(
      "select acquisition_record_lead('test@example.com','guide',$1,$1)",
      [first],
    );
    lead = (await db.query("select * from acquisition_leads")).rows[0];
    assert.equal(lead.last_touch_id, last);
    await db.query(
      "select acquisition_record_conversion('cs_1','test@example.com',500,'USD')",
    );
    await db.query(
      "select acquisition_record_conversion('cs_1','test@example.com',500,'USD')",
    );
    assert.equal(
      await scalar("select count(*)::int from acquisition_conversions"),
      1,
    );
    assert.equal(
      await scalar("select amount_minor::int from acquisition_conversions"),
      500,
    );
    const newer = await scalar(
      "insert into acquisition_touches(post_id) values($1) returning id",
      [post],
    );
    await db.query(
      "select acquisition_record_lead('test@example.com','checkout',$1,$1)",
      [newer],
    );
    lead = (await db.query("select * from acquisition_leads")).rows[0];
    assert.equal(
      lead.last_touch_id,
      last,
      "lead attribution stays at capture time",
    );
    assert.equal(
      lead.latest_touch_id,
      newer,
      "conversion may use a later click",
    );
    assert.equal(
      await scalar("select last_touch_id from acquisition_conversions"),
      last,
      "recorded conversion snapshots stay immutable",
    );
    await db.query(
      "select acquisition_record_lead('fake@example.com','guide',gen_random_uuid(),gen_random_uuid())",
    );
    assert.equal(
      await scalar("select count(*)::int from acquisition_leads"),
      1,
    );
    const expired = await scalar(
      "insert into acquisition_touches(post_id,created_at) values($1,now()-interval '91 days') returning id",
      [post],
    );
    await db.query(
      "select acquisition_record_lead('expired@example.com','guide',$1,$1)",
      [expired],
    );
    assert.equal(
      await scalar("select count(*)::int from acquisition_leads"),
      1,
    );
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from acquisition_campaigns"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from acquisition_facts"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from acquisition_claim()"),
      /permission denied/,
    );
    await db.exec("reset role; set role authenticated");
    await assert.rejects(
      db.query("select * from acquisition_leads"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from acquisition_transition($1,2,'approve',$2)", [
        post,
        actor,
      ]),
      /permission denied/,
    );
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
