import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  parseOpportunity,
  ingestAuth,
  sourceUrl,
} from "../../server/lib/acquisitionOutreach.js";
import workerHandler from "../../server/acquisition/worker.js";
const { PGlite } = await import(
  process.env.PGLITE_MODULE
    ? pathToFileURL(process.env.PGLITE_MODULE).href
    : "@electric-sql/pglite"
);
const migration = (name) =>
  readFile(
    new URL(`../../supabase/migrations/${name}`, import.meta.url),
    "utf8",
  );
for (const type of ["text", "uuid"])
  test(`existing ${type} transcript IDs: migration compatibility and manual outreach lifecycle`, async () => {
    const db = new PGlite();
    try {
      await db.exec(
        "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
      );
      let content = await migration("001_content_engine.sql");
      if (type === "uuid")
        content = content.replace(
          /video_id\s+text UNIQUE NOT NULL/,
          "video_id uuid UNIQUE NOT NULL",
        );
      await db.exec(content);
      await db.exec(await migration("002_acquisition_engine.sql"));
      const scalar = async (sql, params = []) =>
        Object.values((await db.query(sql, params)).rows[0])[0];
      assert.equal(
        await scalar(
          "select data_type from information_schema.columns where table_name='acquisition_campaigns' and column_name='source_transcript_video_id'",
        ),
        type,
      );
      const actor = await scalar(
        "insert into auth.users values(gen_random_uuid()) returning id",
      );
      const source =
        type === "text"
          ? "youtube-123"
          : "00000000-0000-4000-8000-000000000001";
      await db.query(
        "insert into video_transcripts(video_id,title) values($1,'Existing lesson')",
        [source],
      );
      const campaign = await scalar(
        "insert into acquisition_campaigns(name,objective,source_transcript_video_id,cta_label,destination_url,created_by) values('Test','Leads',$1,'Guide','https://revenueripple.org/survival-playbook',$2) returning id",
        [source, actor],
      );
      assert.equal(
        await scalar("select video_id::text from video_transcripts"),
        source,
        "original source IDs are unchanged",
      );
      await db.exec(await migration("003_acquisition_manual_outreach.sql"));
      await assert.rejects(
        db.query("select * from acquisition_claim()"),
        /Automatic posting is disabled/,
      );
      const payload = {
        campaign_id: campaign,
        platform: "reddit",
        source_url: "https://www.reddit.com/r/marketing/comments/example",
        source_text: "How do I grow?",
        reply: "Helpful response",
        pain_level: 4,
        buyer: true,
        matched_resource_url: "https://revenueripple.org/dmd-variation-1",
      };
      const imported = async (p) =>
        (
          await db.query("select * from acquisition_import_opportunity($1)", [
            JSON.stringify(p),
          ])
        ).rows[0];
      const opportunity = await imported(payload);
      assert.ok(opportunity.post_id);
      const again = await imported({
        ...payload,
        reply: "Do not overwrite the draft",
      });
      assert.equal(again.id, opportunity.id);
      assert.equal(again.post_id, opportunity.post_id);
      assert.equal(
        await scalar("select body from acquisition_posts"),
        "Helpful response",
      );
      assert.equal(
        await scalar("select count(*)::int from acquisition_posts"),
        1,
      );
      assert.equal(
        await scalar("select destination_url from acquisition_posts"),
        payload.matched_resource_url,
      );
      await assert.rejects(
        db.query("select * from acquisition_mark_sent($1,1,$2,$3)", [
          opportunity.post_id,
          actor,
          payload.source_url,
        ]),
        /Approve the current draft/,
      );
      for (const action of ["submit", "approve"])
        await db.query("select * from acquisition_transition($1,1,$2,$3)", [
          opportunity.post_id,
          action,
          actor,
        ]);
      await db.query("select * from acquisition_mark_sent($1,1,$2,$3)", [
        opportunity.post_id,
        actor,
        payload.source_url,
      ]);
      await db.query("select * from acquisition_mark_sent($1,1,$2,$3)", [
        opportunity.post_id,
        actor,
        payload.source_url,
      ]);
      assert.equal(
        await scalar("select status from acquisition_posts"),
        "published",
      );
      assert.equal(
        await scalar(
          "select count(*)::int from acquisition_activity where event='published'",
        ),
        1,
      );
      await imported(payload);
      assert.equal(
        await scalar("select status from acquisition_posts"),
        "published",
      );
      await db.exec("set role anon");
      await assert.rejects(
        db.query("select * from acquisition_opportunities"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select * from acquisition_import_opportunity($1)", [
          JSON.stringify(payload),
        ]),
        /permission denied/,
      );
    } finally {
      await db.close();
    }
  });
test("import validates platform URLs, resources, qualification and message length", () => {
  const base = {
    campaign_id: "00000000-0000-4000-8000-000000000001",
    platform: "reddit",
    source_url: "https://reddit.com/r/test/comments/one/?utm_source=x",
    reply: "Useful advice",
  };
  assert.equal(
    parseOpportunity(base).source_url,
    "https://www.reddit.com/r/test/comments/one",
  );
  assert.throws(() => parseOpportunity({ ...base, pain_level: 6 }));
  assert.throws(() =>
    parseOpportunity({
      ...base,
      matched_resource_url: "https://evil.example/",
    }),
  );
  assert.throws(() =>
    parseOpportunity({
      ...base,
      source_url: "https://www.linkedin.com/in/test",
    }),
  );
  assert.throws(() =>
    parseOpportunity({
      ...base,
      platform: "linkedin",
      source_url: "https://linkedin.com/in/test",
      reply: "a".repeat(301),
    }),
  );
  assert.equal(
    sourceUrl("https://www.linkedin.com/in/test/?trk=x", "linkedin"),
    "https://www.linkedin.com/in/test",
  );
});
test("discovery credentials are separate from the retired worker", () => {
  process.env.ACQUISITION_INGEST_SECRET = "a".repeat(32);
  assert.throws(
    () => ingestAuth({ headers: { authorization: "Bearer wrong" } }),
    (e) => e.status === 401,
  );
  ingestAuth({ headers: { authorization: `Bearer ${"a".repeat(32)}` } });
  delete process.env.ACQUISITION_INGEST_SECRET;
  const res = {
    setHeader() {},
    status(n) {
      this.code = n;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };
  workerHandler({ method: "POST", body: { action: "claim" } }, res);
  assert.equal(res.code, 410);
});
