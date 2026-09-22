// Currency values remain in their provider's minor units. Never sum currencies together.
export function summarize({
  campaigns,
  posts,
  facts,
  metrics,
  model = "last",
  dimension = "platform",
  since = null,
  until = null,
}) {
  const campaignMap = new Map(campaigns.map((c) => [c.id, c]));
  const postMap = new Map(posts.map((p) => [p.id, p]));
  const groups = new Map();
  const groupFor = (p) => {
    const c = campaignMap.get(p.campaign_id);
    if (!c) return null;
    const keys = {
      platform: p.platform,
      campaign: c.id,
      post: p.id,
      topic: c.topic || "Unspecified",
      pillar: c.pillar || "Unspecified",
      cta: `${c.cta_label} → ${p.destination_url || c.destination_url}`,
      asset: c.source_video_id
        ? `video:${c.source_video_id}`
        : c.source_transcript_video_id
          ? `transcript:${c.source_transcript_video_id}`
          : "Idea",
    };
    const key = keys[dimension];
    if (!groups.has(key))
      groups.set(key, {
        key,
        label:
          dimension === "campaign"
            ? c.name
            : dimension === "post"
              ? `${p.platform}: ${p.body.slice(0, 70)}`
              : key,
        clicks: 0,
        leads: new Set(),
        customers: new Set(),
        conversions: 0,
        revenue_minor: {},
        impressions: 0,
        engagements: 0,
      });
    return groups.get(key);
  };
  posts.forEach(groupFor);
  for (const f of facts) {
    if (f.model !== "both" && f.model !== model) continue;
    if ((since && f.created_at < since) || (until && f.created_at >= until))
      continue;
    const p = postMap.get(f.post_id);
    if (!p) continue;
    const g = groupFor(p);
    if (!g) continue;
    if (f.kind === "click") g.clicks++;
    if (f.kind === "lead") g.leads.add(f.identity);
    if (f.kind === "conversion") {
      g.customers.add(f.identity);
      g.conversions++;
      g.revenue_minor[f.currency] =
        (g.revenue_minor[f.currency] || 0) + Number(f.amount_minor);
    }
  }
  // Platform metrics are lifetime cumulative snapshots, explicitly labeled in the UI.
  for (const m of metrics) {
    const p = postMap.get(m.post_id);
    if (p) {
      const g = groupFor(p);
      if (g) {
        g.impressions += Number(m.impressions);
        g.engagements += Number(m.engagements);
      }
    }
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      leads: g.leads.size,
      customers: g.customers.size,
      lead_rate: g.clicks ? g.leads.size / g.clicks : null,
    }))
    .sort(
      (a, b) =>
        b.customers - a.customers || b.leads - a.leads || b.clicks - a.clicks,
    );
}
