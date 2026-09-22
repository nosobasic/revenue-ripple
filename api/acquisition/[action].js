import campaigns from "../../server/acquisition/campaigns.js";
import posts from "../../server/acquisition/posts.js";
import analytics from "../../server/acquisition/analytics.js";
import settings from "../../server/acquisition/settings.js";
import worker from "../../server/acquisition/worker.js";
import track from "../../server/acquisition/track.js";
import opportunities from "../../server/acquisition/opportunities.js";
import ingest from "../../server/acquisition/ingest.js";

const handlers = new Map(Object.entries({
  campaigns, posts, analytics, settings, worker, track, opportunities, ingest,
}));

// A single Vercel dynamic route preserves every existing Acquisition URL.
// Dispatch from the pathname so query parameters cannot select another handler.
export default function handler(req, res) {
  const pathname = new URL(req.url, "http://api.local").pathname;
  const action = pathname.match(/^\/api\/acquisition\/([^/]+)\/?$/)?.[1];
  const target = handlers.get(action);
  if (!target) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(404).json({ error: "Acquisition endpoint not found" });
  }
  return target(req, res);
}
