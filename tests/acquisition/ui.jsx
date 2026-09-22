// Isolated development fixture with synthetic data; never imported by the app.
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "../../src/supabase/client";
import AcquisitionEngine from "../../src/components/admin/AcquisitionEngine";
supabase.auth.getSession = async () => ({
  data: { session: { access_token: "fixture-token" } },
});
const campaign = {
  id: "campaign1",
  name: "Turn lessons into leads",
  objective: "Acquire qualified members",
  topic: "Email marketing",
  pillar: "Audience growth",
  cta_label: "Get the guide",
  destination_url: "https://revenueripple.org/survival-playbook",
  status: "active",
  source_video_id: "video1",
};
const post = {
  id: "post1",
  campaign_id: "campaign1",
  platform: "linkedin",
  body: "Your next customer may already be reading your lessons. Connect useful education to a clear next step. Get the free guide.",
  status: "pending_approval",
  revision: 1,
  created_at: new Date().toISOString(),
  tracking_url: "https://revenueripple.org/api/acquisition/track?p=example",
};
window.fetch = async (path, options = {}) => {
  const resource = String(path).split("/").pop().split("?")[0];
  let response = {};
  if (resource === "campaigns")
    response = {
      campaigns: [campaign],
      videos: [
        {
          id: "video1",
          title: "Build an audience that converts",
          status: "published",
        },
      ],
      transcripts: [],
    };
  if (resource === "posts") {
    if (options.method === "PATCH") {
      const input = JSON.parse(options.body);
      if (input.action === "approve") post.status = "approved";
      if (input.action === "edit") {
        post.body = input.body;
        post.status = "draft";
        post.revision++;
      }
    }
    response = { posts: [{ ...post }] };
  }
  if (resource === "analytics")
    response = {
      rows: [
        {
          key: "linkedin",
          label: "linkedin",
          clicks: 124,
          leads: 18,
          lead_rate: 18 / 124,
          customers: 4,
          conversions: 4,
          revenue_minor: { usd: 18800 },
          impressions: 4600,
          engagements: 213,
        },
      ],
      activity: [],
      stalled: [],
    };
  if (resource === "opportunities") response = { opportunities: [] };
  if (resource === "settings")
    response = {
      ai_configured: true,
      ingest_configured: false,
      allowed_origins: ["https://revenueripple.org"],
      public_origin: "https://revenueripple.org",
      attribution_window_days: 90,
    };
  return { ok: true, json: async () => response };
};
window.history.replaceState(null, "", "/admin/acquisition/overview");
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AcquisitionEngine />
  </BrowserRouter>,
);
