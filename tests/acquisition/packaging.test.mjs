import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import handler from "../../api/acquisition/[action].js";

async function request(url, method = "DELETE") {
  const res = {
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await handler({ url, method, query: Object.fromEntries(new URL(url, "http://test").searchParams) }, res);
  return res;
}

test("Vercel discovers only five API entry points, with no shared modules", async () => {
  const files = (await readdir(new URL("../../api/", import.meta.url), { recursive: true }))
    .filter(name => /\.(js|ts|mjs|cjs|py|go|rb)$/.test(name)).sort();
  assert.deepEqual(files, [
    "acquisition/[action].js", "content/analyze-gaps.js",
    "content/generate-script.js", "content/status.js", "synthesia.js",
  ]);
});

test("all Acquisition URLs retain their method guards through the dispatcher", async () => {
  const routes = {
    campaigns: "GET, POST, PATCH", posts: "GET, POST, PATCH",
    analytics: "GET", settings: "GET", track: "GET",
    opportunities: "GET, PATCH", ingest: "POST",
  };
  for (const [action, allow] of Object.entries(routes)) {
    const res = await request(`/api/acquisition/${action}?p=tracking-id&action=worker`);
    assert.equal(res.statusCode, 405, action);
    assert.equal(res.headers.Allow, allow, action);
    assert.equal(res.headers["Cache-Control"], "no-store");
  }
  assert.equal((await request("/api/acquisition/worker", "POST")).statusCode, 410);
});

test("unknown and inherited property names cannot dispatch handlers", async () => {
  for (const path of ["missing", "constructor", "__proto__", "posts/extra"]) {
    assert.equal((await request(`/api/acquisition/${path}`)).statusCode, 404);
  }
});
