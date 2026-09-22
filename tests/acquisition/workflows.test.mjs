import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const load = async (file) =>
  JSON.parse(
    await readFile(
      new URL(`../../integrations/n8n/${file}`, import.meta.url),
      "utf8",
    ),
  );
const linkedin = await load("LinkedIn_Acquisition_Manual_Outreach.json");
const reddit = await load("Reddit_Acquisition_Manual_Outreach.json");
for (const workflow of [linkedin, reddit])
  test(`${workflow.name}: valid graph, draft-only import, inactive`, () => {
    const names = new Set(workflow.nodes.map((n) => n.name));
    assert.equal(workflow.active, false);
    for (const [source, outputs] of Object.entries(workflow.connections)) {
      assert.ok(names.has(source), source);
      for (const branches of Object.values(outputs))
        for (const branch of branches)
          for (const edge of branch) assert.ok(names.has(edge.node), edge.node);
    }
    assert.ok(workflow.nodes.every((n) => !n.credentials));
    const imported = workflow.nodes.find(
      (n) => n.name === "Import Acquisition Draft",
    );
    assert.equal(imported.parameters.genericAuthType, "httpHeaderAuth");
    assert.equal(imported.parameters.method, "POST");
    assert.equal(imported.parameters.jsonBody, "={{ JSON.stringify($json) }}");
    for (const n of workflow.nodes)
      if (
        n.type === "n8n-nodes-base.httpRequest" &&
        n.parameters.method === "POST"
      ) {
        assert.ok(
          n.name === "Import Acquisition Draft" ||
            n.name === "Get Reddit Token",
          "No social publishing requests",
        );
      }
  });
function run(d, name, input, linked) {
  const n = d.nodes.find((n) => n.name === name);
  return new Function("$json", "$input", "$", n.parameters.jsCode)(
    input,
    { all: () => [{ json: input }] },
    (name) => ({
      item: { json: linked[name] },
      first: () => ({ json: linked[name] }),
    }),
  );
}
test("LinkedIn normalization and AI draft preserve profile identity", () => {
  const normalized = run(
    linkedin,
    "Normalize LinkedIn Input",
    {
      data: [
        { Name: "Same Name", "Profile URL": "https://linkedin.com/in/one" },
        { Name: "Same Name", "Profile URL": "https://linkedin.com/in/two" },
      ],
    },
    {},
  );
  assert.equal(normalized[0].json.data.length, 2);
  const draft = run(
    linkedin,
    "Prepare LinkedIn Draft",
    { output: { message: "A useful connection note" } },
    {
      "Split Items": normalized[0].json.data[1],
      "Acquisition Configuration": { acquisition_campaign_id: "campaign" },
    },
  );
  assert.equal(
    draft.json.acquisition.source_url,
    "https://linkedin.com/in/two",
  );
  assert.equal(draft.json.acquisition.reply, "A useful connection note");
});
test("Reddit combines correct source and analysis and rejects retired resources", () => {
  const linked = {
    "Filter Posts": {
      post_url: "https://reddit.com/r/test/comments/one",
      post_text: "Question",
      author: "tester",
    },
    "Analyze Reddit Post": {
      output: {
        pain_level: 4,
        intent: "learning",
        buyer: "yes",
        reply: "Useful reply",
      },
    },
    "Workflow Configuration": {
      dmd_variation_1: "https://www.revenueripple.org/dmd-variation-1",
    },
  };
  const combined = run(
    reddit,
    "Combine All Data",
    { output: linked["Workflow Configuration"].dmd_variation_1 },
    linked,
  );
  assert.equal(combined.json.reply, "Useful reply");
  assert.equal(combined.json.post_url, linked["Filter Posts"].post_url);
  assert.throws(() =>
    run(
      reddit,
      "Combine All Data",
      { output: "https://www.revenueripple.org/book-giveaway" },
      linked,
    ),
  );
  assert.ok(!JSON.stringify(reddit).toLowerCase().includes("money_models"));
  assert.ok(!JSON.stringify(reddit).includes("book-giveaway"));
  const imported = run(reddit, "Prepare Acquisition Import", combined.json, {
    "Acquisition Configuration": { acquisition_campaign_id: "campaign" },
  });
  assert.equal(imported.json.buyer, true);
  assert.equal(
    imported.json.matched_resource_url,
    linked["Workflow Configuration"].dmd_variation_1,
  );
});
