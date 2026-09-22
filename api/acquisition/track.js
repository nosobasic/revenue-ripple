import {
  endpoint,
  dbResult,
  uuid,
  destination,
  fail,
} from "../lib/acquisition.js";
export default endpoint(
  ["GET"],
  async (req, res, db) => {
    const id = uuid.parse(req.query.p);
    const post = dbResult(
      await db
        .from("acquisition_posts")
        .select(
          "id,platform,status,campaign_id,destination_url,acquisition_campaigns(destination_url,topic)",
        )
        .eq("id", id)
        .maybeSingle(),
    );
    if (!post || post.status !== "published")
      throw fail(404, "Published promotion not found");
    const url = destination(
      post.destination_url || post.acquisition_campaigns.destination_url,
    );
    const touch = dbResult(
      await db
        .from("acquisition_touches")
        .insert({ post_id: id })
        .select("id")
        .single(),
    );
    for (const [key, value] of Object.entries({
      utm_source: post.platform,
      utm_medium: "organic_social",
      utm_campaign: post.campaign_id,
      utm_content: id,
      utm_term: post.acquisition_campaigns.topic,
      rr_touch: touch.id,
    }))
      url.searchParams.set(key, value);
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Location", url.toString());
    res.status(302).end();
  },
  "public",
);
