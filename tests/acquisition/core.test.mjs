import { ingestAuth } from "../../server/lib/acquisitionOutreach.js";
import test from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../../server/lib/acquisitionAnalytics.js";
import { captureAcquisitionTouch } from "../../src/utils/acquisitionAttribution.js";
import { admin, destination, validatePost } from "../../server/lib/acquisition.js";
const id = "00000000-0000-4000-8000-000000000001";
const id2 = "00000000-0000-4000-8000-000000000002";
function storage() {
  let value;
  return { getItem: () => value, setItem: (_, v) => (value = v) };
}
test("first touch persists while last touch changes; direct visit does not reset either", () => {
  const s = storage();
  captureAcquisitionTouch(`?rr_touch=${id}`, s, 100);
  const result = captureAcquisitionTouch(`?rr_touch=${id2}`, s, 200);
  assert.equal(result.first.id, id);
  assert.equal(result.last.id, id2);
  assert.deepEqual(captureAcquisitionTouch("", s, 300), result);
  assert.equal(captureAcquisitionTouch("", s, 91 * 86400000).first, undefined);
});
test("invalid and blocked browser storage do not prevent navigation", () => {
  assert.deepEqual(captureAcquisitionTouch("?rr_touch=bad", storage(), 0), {});
  assert.equal(
    captureAcquisitionTouch(
      `?rr_touch=${id}`,
      {
        getItem() {
          throw Error();
        },
        setItem() {
          throw Error();
        },
      },
      0,
    ).first.id,
    id,
  );
});
test("analytics deduplicates customers and separates models and currencies", () => {
  const common = {
    campaigns: [
      {
        id: "c",
        name: "Campaign",
        topic: "topic",
        pillar: "pillar",
        cta_label: "Get guide",
      },
    ],
    posts: [{ id: "p", campaign_id: "c", platform: "linkedin", body: "hello" }],
    metrics: [],
    facts: [
      { kind: "click", model: "both", post_id: "p", identity: "click" },
      { kind: "lead", model: "last", post_id: "p", identity: "lead" },
      {
        kind: "conversion",
        model: "last",
        post_id: "p",
        identity: "lead",
        amount_minor: 500,
        currency: "usd",
      },
      {
        kind: "conversion",
        model: "last",
        post_id: "p",
        identity: "lead",
        amount_minor: 200,
        currency: "eur",
      },
      { kind: "lead", model: "first", post_id: "p", identity: "other" },
    ],
  };
  const [row] = summarize(common);
  assert.equal(row.leads, 1);
  assert.equal(row.customers, 1);
  assert.equal(row.conversions, 2);
  assert.deepEqual(row.revenue_minor, { usd: 500, eur: 200 });
  assert.equal(summarize({ ...common, model: "first" })[0].customers, 0);
});
test("admin API requires a verified token and database admin role", async () => {
  await assert.rejects(admin({ headers: {} }, {}), (e) => e.status === 401);
  const db = {
    auth: { getUser: async () => ({ data: { user: { id } }, error: null }) },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: { role: "member" } }) }),
      }),
    }),
  };
  await assert.rejects(
    admin({ headers: { authorization: "Bearer token" } }, db),
    (e) => e.status === 403,
  );
  db.auth.getUser = async () => ({ error: Error() });
  await assert.rejects(
    admin({ headers: { authorization: "Bearer token" } }, db),
    (e) => e.status === 401,
  );
});
test("discovery authentication fails closed; redirect destinations are allowlisted", () => {
  process.env.ACQUISITION_INGEST_SECRET = "a".repeat(32);
  assert.throws(
    () => ingestAuth({ headers: { authorization: "Bearer wrong" } }),
    (e) => e.status === 401,
  );
  ingestAuth({ headers: { authorization: `Bearer ${"a".repeat(32)}` } });
  assert.throws(() => destination("https://evil.example/path"));
  assert.throws(() => destination("javascript:alert(1)"));
  assert.equal(
    destination("https://revenueripple.org/survival-playbook").hostname,
    "revenueripple.org",
  );
  delete process.env.ACQUISITION_INGEST_SECRET;
});
test("social character limits reserve space for the tracked link", () => {
  assert.equal(validatePost("Useful idea", "x"), "Useful idea");
  assert.throws(() => validatePost("x".repeat(280), "x"));
  assert.throws(() => validatePost("", "linkedin"));
});
