import test from "node:test";
import assert from "node:assert/strict";
import { selectJourney, nextLesson } from "../../src/lib/journey.js";
const courses = [
  { slug: "ai-essentials", modules: [{ id: 1 }, { id: 2 }, { id: 3 }] },
  { slug: "email-marketing", modules: [{ id: 1 }, { id: 2 }] },
];
test("new learner follows their stated goal", () => {
  assert.equal(
    selectJourney(courses, {}, { goals: "Grow my email list" }).slug,
    "email-marketing",
  );
});
test("resume active course before recommending a new one", () => {
  assert.equal(
    selectJourney(courses, { "ai-essentials": 33 }, { goals: "email" }).slug,
    "ai-essentials",
  );
});
test("skip completed courses; no false next step when all complete", () => {
  assert.equal(
    selectJourney(courses, { "email-marketing": 100 }, { goals: "email" }).slug,
    "ai-essentials",
  );
  assert.equal(
    selectJourney(courses, { "email-marketing": 100, "ai-essentials": 100 }),
    null,
  );
});
test("next lesson uses actual completion records, including nonsequential completion", () => {
  assert.equal(
    nextLesson(courses[0], [
      { course_id: "ai-essentials", module_id: "module-1", completed: true },
      { course_id: "ai-essentials", module_id: "3", completed: true },
    ]).id,
    2,
  );
});
test("other courses and incomplete records do not skip lessons", () => {
  assert.equal(
    nextLesson(courses[0], [
      { course_id: "email-marketing", module_id: "module-1", completed: true },
      { course_id: "ai-essentials", module_id: "module-1", completed: false },
    ]).id,
    1,
  );
});
