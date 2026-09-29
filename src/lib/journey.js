// Recommendations only use courses that exist in the catalog.
export function selectJourney(courses, progress, profile = {}) {
  const text =
    `${profile.goals || ""} ${(profile.interests || []).join(" ")}`.toLowerCase();
  const choices = [
    [/email|subscriber|newsletter/, "email-marketing"],
    [/seo|content/, "seo"],
    [/advertis|ppc|ad campaign/, "paid-traffic"],
    [/social/, "social-media-marketing"],
    [/affiliate/, "affiliate-marketing"],
    [/funnel/, "funnel-building"],
    [/web|design/, "website-design"],
    [/ai|automat/, "ai-essentials"],
  ];
  const preferred =
    choices.find(([pattern]) => pattern.test(text))?.[1] || "ai-essentials";
  const active = courses.find(
    (c) => progress[c.slug] > 0 && progress[c.slug] < 100,
  );
  const recommended = courses.find(
    (c) => c.slug === preferred && !(progress[c.slug] >= 100),
  );
  return (
    active ||
    recommended ||
    courses.find((c) => !(progress[c.slug] >= 100)) ||
    null
  );
}
export function nextLesson(course, completions = []) {
  if (!course) return null;
  return (
    course.modules.find(
      (m) =>
        !completions.some(
          (c) =>
            c.course_id === course.slug &&
            c.completed &&
            String(c.module_id).replace("module-", "") === String(m.id),
        ),
    ) || null
  );
}
