import { z } from "zod";
import { endpoint, all, dbResult } from "../lib/acquisition.js";
import { summarize } from "../lib/acquisitionAnalytics.js";
export default endpoint(["GET"], async (req, res, db) => {
  const query = z
    .object({
      model: z.enum(["first", "last"]).default("last"),
      dimension: z
        .enum([
          "platform",
          "campaign",
          "post",
          "topic",
          "pillar",
          "cta",
          "asset",
        ])
        .default("platform"),
      since: z.string().datetime().optional(),
      until: z.string().datetime().optional(),
    })
    .parse(req.query);
  const [campaigns, posts, facts, metrics, activity] = await Promise.all([
    all(db, "acquisition_campaigns"),
    all(db, "acquisition_posts"),
    all(db, "acquisition_facts"),
    // Metrics has a post_id rather than an id column.
    (async () => {
      const rows = [];
      for (let n = 0; ; n += 1000) {
        const batch = dbResult(
          await db
            .from("acquisition_metrics")
            .select("*")
            .order("post_id")
            .range(n, n + 999),
        );
        rows.push(...batch);
        if (batch.length < 1000) return rows;
      }
    })(),
    db
      .from("acquisition_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(dbResult),
  ]);
  res.status(200).json({
    rows: summarize({ campaigns, posts, facts, metrics, ...query }),
    activity,
    model: query.model,
    metric_scope: "Lifetime platform snapshots",
    attribution_window_days: 90,
    stalled: posts
      .filter(
        (p) =>
          p.status === "publishing" &&
          Date.parse(p.claimed_at) < Date.now() - 15 * 60 * 1000,
      )
      .map((p) => p.id),
  });
});
