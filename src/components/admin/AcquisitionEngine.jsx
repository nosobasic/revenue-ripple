import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./acquisition.css";

const SECTIONS = [
  "Overview",
  "Campaigns",
  "Opportunities",
  "Create",
  "Calendar",
  "Posts",
  "Approvals",
  "Analytics",
  "Settings",
];
async function api(resource, method = "GET", body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in to continue");
  const response = await fetch(`/api/acquisition/${resource}`, {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
function Revenue({ values }) {
  return Object.entries(values).map(([currency, amount]) => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits;
    return (
      <span key={currency}>{formatter.format(amount / 10 ** digits)} </span>
    );
  });
}
function Post({ post, campaign, onAction, busy, sourceUrl = "" }) {
  const [body, setBody] = useState(post.body);
  const [at, setAt] = useState("");
  const [sentUrl, setSentUrl] = useState(post.external_url || sourceUrl);
  const [copyMessage, setCopyMessage] = useState("");
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage("Copied");
    } catch {
      setCopyMessage("Clipboard unavailable. Select and copy the text above.");
    }
  }
  useEffect(() => setBody(post.body), [post.body]);
  const editable = [
    "draft",
    "pending_approval",
    "approved",
    "scheduled",
    "failed",
  ].includes(post.status);
  return (
    <article className="acq-card">
      <div className="acq-row">
        <strong>
          {campaign?.name || "Campaign"} · {post.platform}
        </strong>
        <span className={`acq-badge acq-${post.status}`}>
          {post.status === "published"
            ? "Manually sent"
            : post.status.replaceAll("_", " ")}
        </span>
      </div>
      {editable ? (
        <label>
          Promotional copy
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
        </label>
      ) : (
        <p className="acq-copy">{post.body}</p>
      )}
      {post.platform === "instagram" && (
        <p className="acq-note">
          Caption links are not clickable. Distribution needs media and the
          tracked link in the profile or another supported CTA placement.
        </p>
      )}
      <p className="acq-note">
        Tracked CTA:{" "}
        <a href={post.tracking_url} target="_blank" rel="noreferrer">
          {post.tracking_url}
        </a>{" "}
        · Active after you record the manual send.
      </p>
      {post.scheduled_at && (
        <p>Scheduled: {new Date(post.scheduled_at).toLocaleString()}</p>
      )}
      {post.published_at && (
        <p>Sent: {new Date(post.published_at).toLocaleString()}</p>
      )}
      {post.external_url && (
        <a href={post.external_url} target="_blank" rel="noreferrer">
          Open recorded conversation ↗
        </a>
      )}
      {post.error && (
        <p role="alert" className="acq-error">
          {post.error}
        </p>
      )}
      {post.status === "publishing" && (
        <p className="acq-note">
          Legacy delivery pending. Automatic posting is disabled; reconcile the
          old job before recording an outcome.
        </p>
      )}
      {["approved", "scheduled", "published"].includes(post.status) && (
        <>
          <div className="acq-actions">
            <button
              disabled={busy || body !== post.body}
              onClick={() => copy(post.body)}
            >
              Copy approved response
            </button>
            <button disabled={busy} onClick={() => copy(post.tracking_url)}>
              Copy tracked CTA
            </button>
          </div>
          <p className="acq-note">
            Send it yourself on the platform. Add the CTA only where
            appropriate; the app does not send messages or posts.
          </p>
          {copyMessage && <p role="status">{copyMessage}</p>}
        </>
      )}
      {["approved", "scheduled"].includes(post.status) && (
        <>
          <label>
            Thread, profile, or published reply URL
            <input
              type="url"
              value={sentUrl}
              onChange={(e) => setSentUrl(e.target.value)}
            />
          </label>
          <button
            disabled={busy || !sentUrl || body !== post.body}
            onClick={() =>
              onAction(post, "mark_sent", { external_url: sentUrl })
            }
          >
            I sent this manually — record send
          </button>
        </>
      )}
      <div className="acq-actions">
        {editable && body !== post.body && (
          <button
            disabled={busy}
            onClick={() => onAction(post, "edit", { body })}
          >
            Save edits & reset approval
          </button>
        )}
        {post.status === "draft" && (
          <button
            disabled={busy || body !== post.body}
            onClick={() => onAction(post, "submit")}
          >
            Submit for approval
          </button>
        )}
        {post.status === "pending_approval" && (
          <>
            <button
              disabled={busy || body !== post.body}
              onClick={() => onAction(post, "approve")}
            >
              Approve
            </button>
            <button disabled={busy} onClick={() => onAction(post, "reject")}>
              Request changes
            </button>
          </>
        )}
        {post.status === "approved" && (
          <>
            <label>
              Plan manual follow-up (your local time)
              <input
                type="datetime-local"
                value={at}
                onChange={(e) => setAt(e.target.value)}
              />
            </label>
            <button
              disabled={busy || !at || body !== post.body}
              onClick={() =>
                onAction(post, "schedule", {
                  scheduled_at: new Date(at).toISOString(),
                })
              }
            >
              Set reminder
            </button>
          </>
        )}
        {post.status === "scheduled" && (
          <button disabled={busy} onClick={() => onAction(post, "unschedule")}>
            Unschedule
          </button>
        )}
      </div>
    </article>
  );
}
export default function AcquisitionEngine() {
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.split("/")[3] || "overview";
  const [data, setData] = useState({
    campaigns: [],
    videos: [],
    transcripts: [],
  });
  const [posts, setPosts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [showDismissed, setShowDismissed] = useState(false);
  const [report, setReport] = useState({ rows: [], activity: [], stalled: [] });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("last");
  const [dimension, setDimension] = useState("platform");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [form, setForm] = useState({
    name: "",
    objective: "Generate qualified leads",
    topic: "",
    pillar: "",
    idea: "",
    source: "",
    cta_label: "Get the free guide",
    destination_url: "https://revenueripple.org/survival-playbook",
  });
  const [campaignId, setCampaignId] = useState("");
  const [channels, setChannels] = useState(["linkedin"]);
  const [manual, setManual] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ model, dimension });
      if (since)
        params.set("since", new Date(`${since}T00:00:00Z`).toISOString());
      if (until)
        params.set(
          "until",
          new Date(Date.parse(`${until}T00:00:00Z`) + 86400000).toISOString(),
        );
      const [d, p, r, s, o] = await Promise.all([
        api("campaigns"),
        api("posts"),
        api(`analytics?${params}`),
        api("settings"),
        api("opportunities"),
      ]);
      setData(d);
      setPosts(p.posts);
      setReport(r);
      setSettings(s);
      setOpportunities(o.opportunities);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [model, dimension, since, until]);
  useEffect(() => {
    load();
  }, [load]);
  async function mutate(fn, success) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      setMessage(success);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const action = (post, action, extra = {}) =>
    mutate(
      () =>
        api("posts", "PATCH", {
          id: post.id,
          revision: post.revision,
          action,
          ...extra,
        }),
      "Post updated",
    );
  const field = (key, label, type = "text") => (
    <label key={key}>
      {label}
      <input
        required={[
          "name",
          "objective",
          "cta_label",
          "destination_url",
        ].includes(key)}
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );
  async function createCampaign(e) {
    e.preventDefault();
    await mutate(async () => {
      const { source, ...body } = form;
      const c = await api("campaigns", "POST", {
        ...body,
        source_video_id: source.startsWith("video:") ? source.slice(6) : null,
        source_transcript_video_id: source.startsWith("transcript:")
          ? source.slice(11)
          : null,
      });
      setCampaignId(c.id);
      navigate("/admin/acquisition/create");
    }, "Campaign created. Adapt its source into platform promotions below.");
  }
  const filteredPosts = posts
    .filter((p) =>
      section === "approvals"
        ? p.status === "pending_approval"
        : section === "calendar"
          ? ["scheduled", "publishing", "published"].includes(p.status)
          : true,
    )
    .sort(
      (a, b) =>
        Date.parse(b.scheduled_at || b.created_at) -
        Date.parse(a.scheduled_at || a.created_at),
    );
  return (
    <div className="acq">
      <header className="acq-header">
        <div>
          <p className="acq-eyebrow">REVENUE RIPPLE · GROWTH</p>
          <h1>Acquisition Engine</h1>
          <p>
            Turn existing content into qualified traffic, leads, and customers.
          </p>
        </div>
        <Link className="acq-button" to="/admin/acquisition/create">
          Create campaign
        </Link>
      </header>
      <div className="acq-flow">
        <Link to="/admin/content-engine">Content Engine</Link>
        <span>→ Acquisition → Funnel → Nurture → Conversion</span>
      </div>
      <nav className="acq-tabs" aria-label="Acquisition sections">
        {SECTIONS.map((s) => (
          <NavLink key={s} to={`/admin/acquisition/${s.toLowerCase()}`}>
            {s}
          </NavLink>
        ))}
      </nav>
      {error && (
        <div role="alert" className="acq-error">
          {error} <button onClick={load}>Retry</button>
        </div>
      )}
      {message && (
        <p role="status" className="acq-success">
          {message}
        </p>
      )}
      <div className="acq-row">
        <p className="acq-note">
          {loading
            ? "Loading acquisition data…"
            : `${data.campaigns.length} campaigns · ${posts.length} promotional posts`}
        </p>
        <button disabled={loading || busy} onClick={load}>
          Refresh
        </button>
      </div>
      {section === "overview" && (
        <>
          <div className="acq-kpis">
            {[
              [
                "Active campaigns",
                data.campaigns.filter((c) => c.status === "active").length,
              ],
              [
                "Awaiting approval",
                posts.filter((p) => p.status === "pending_approval").length,
              ],
              [
                "Manual follow-ups",
                posts.filter((p) => p.status === "scheduled").length,
              ],
              [
                "Manually sent",
                posts.filter((p) => p.status === "published").length,
              ],
            ].map(([label, value]) => (
              <article className="acq-card" key={label}>
                <p>{label}</p>
                <strong className="acq-number">{value}</strong>
              </article>
            ))}
          </div>
          <article className="acq-card">
            <h2>Distribution decisions backed by funnel results</h2>
            <p>
              Compare channels, campaigns, posts, topics, pillars, CTAs, and
              existing assets by attributed leads and customers.
            </p>
            <Link to="/admin/acquisition/analytics">
              Explore acquisition performance →
            </Link>
            <p className="acq-note">
              Clicks are recorded redirect requests, not unique people. Revenue
              is recorded paid checkout revenue, not lifetime value.
            </p>
          </article>
          {report.stalled.length > 0 && (
            <p role="alert" className="acq-error">
              {report.stalled.length} deliveries have waited over 15 minutes.
              These are legacy jobs; automatic posting is disabled.
            </p>
          )}
          <article className="acq-card">
            <h2>Recent workflow activity</h2>
            {report.activity.length ? (
              report.activity.map((a) => (
                <p key={a.id}>
                  {a.event.replaceAll("_", " ")} ·{" "}
                  {new Date(a.created_at).toLocaleString()}
                </p>
              ))
            ) : (
              <p>
                No acquisition activity yet. Start with an existing Content
                Engine asset or an idea.
              </p>
            )}
          </article>
        </>
      )}
      {section === "opportunities" && (
        <>
          <h2>Discovered opportunities</h2>
          <p>
            Review n8n research and prepared responses here. Potential prospects
            count as acquired leads only after they enter a funnel.
          </p>
          <label className="acq-check">
            <input
              type="checkbox"
              checked={showDismissed}
              onChange={(e) => setShowDismissed(e.target.checked)}
            />{" "}
            Show hidden opportunities
          </label>
          <div className="acq-grid">
            {opportunities
              .filter((o) => showDismissed || o.status !== "dismissed")
              .map((o) => {
                const post = posts.find((p) => p.id === o.post_id);
                return (
                  <section className="acq-card" key={o.id}>
                    <div className="acq-row">
                      <h2>{o.source_title || o.author || o.platform}</h2>
                      <span className="acq-badge">
                        {o.platform} · {o.status}
                      </span>
                    </div>
                    <a href={o.source_url} target="_blank" rel="noreferrer">
                      Open source conversation / profile ↗
                    </a>
                    <p>
                      {[o.author, o.role, o.company, o.community]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {o.source_text && (
                      <details>
                        <summary>Original context</summary>
                        <p className="acq-copy">{o.source_text}</p>
                      </details>
                    )}
                    <p className="acq-note">
                      Pain score: {o.pain_level ?? "—"} / 5 · Intent:{" "}
                      {o.intent || "—"} · Buyer signal:{" "}
                      {o.buyer === null ? "Unknown" : o.buyer ? "Yes" : "No"}.
                      AI signals require review.
                    </p>
                    {o.matched_resource_url && (
                      <p>
                        Matched resource:{" "}
                        <a
                          href={o.matched_resource_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {o.matched_resource_url}
                        </a>
                      </p>
                    )}
                    <p className="acq-note">
                      {o.workflow_name} · Last found{" "}
                      {new Date(o.last_seen_at).toLocaleString()}
                    </p>
                    <div className="acq-actions">
                      <button
                        disabled={busy}
                        onClick={() =>
                          mutate(
                            () =>
                              api("opportunities", "PATCH", {
                                id: o.id,
                                status: "reviewing",
                              }),
                            "Opportunity marked for review",
                          )
                        }
                      >
                        Review
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          mutate(
                            () =>
                              api("opportunities", "PATCH", {
                                id: o.id,
                                status:
                                  o.status === "dismissed"
                                    ? "new"
                                    : "dismissed",
                              }),
                            "Inbox updated",
                          )
                        }
                      >
                        {o.status === "dismissed"
                          ? "Restore to inbox"
                          : "Hide from inbox"}
                      </button>
                    </div>
                    <p className="acq-note">
                      Hiding an opportunity keeps its draft and history in
                      Posts.
                    </p>
                    {post && (
                      <Post
                        post={post}
                        campaign={data.campaigns.find(
                          (c) => c.id === o.campaign_id,
                        )}
                        onAction={action}
                        busy={busy}
                        sourceUrl={o.source_url}
                      />
                    )}
                  </section>
                );
              })}
          </div>
          {!opportunities.length && !loading && (
            <p>
              No discoveries yet. Connect your n8n workflow to the import
              endpoint shown in Settings.
            </p>
          )}
        </>
      )}
      {section === "campaigns" && (
        <div className="acq-grid">
          {data.campaigns.map((c) => (
            <article className="acq-card" key={c.id}>
              <div className="acq-row">
                <h2>{c.name}</h2>
                <span className="acq-badge">{c.status}</span>
              </div>
              <p>{c.objective}</p>
              <p>
                {c.topic || "No topic"} · {c.pillar || "No pillar"}
              </p>
              <p>
                Source:{" "}
                {c.source_video_id
                  ? data.videos.find((v) => v.id === c.source_video_id)?.title
                  : c.source_transcript_video_id
                    ? data.transcripts.find(
                        (v) => v.video_id === c.source_transcript_video_id,
                      )?.title
                    : "Original idea"}
              </p>
              <p>CTA: {c.cta_label}</p>
              <a href={c.destination_url} target="_blank" rel="noreferrer">
                Funnel destination ↗
              </a>
              <div className="acq-actions">
                <button
                  disabled={busy || c.status !== "active"}
                  onClick={() => {
                    setCampaignId(c.id);
                    navigate("/admin/acquisition/create");
                  }}
                >
                  Create promotions
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    mutate(
                      () =>
                        api("campaigns", "PATCH", {
                          id: c.id,
                          status: c.status === "active" ? "paused" : "active",
                        }),
                      "Campaign updated",
                    )
                  }
                >
                  {c.status === "active" ? "Pause" : "Activate"}
                </button>
                <button
                  disabled={busy || c.status === "archived"}
                  onClick={() =>
                    mutate(
                      () =>
                        api("campaigns", "PATCH", {
                          id: c.id,
                          status: "archived",
                        }),
                      "Campaign archived",
                    )
                  }
                >
                  Archive
                </button>
              </div>
            </article>
          ))}
          {!data.campaigns.length && !loading && (
            <p>
              No campaigns yet. Create a campaign to connect content to a
              funnel.
            </p>
          )}
        </div>
      )}
      {section === "create" && (
        <div className="acq-grid">
          <form className="acq-card" onSubmit={createCampaign}>
            <h2>1. Acquisition campaign</h2>
            <p>
              Choose content to distribute and the customer action it should
              drive.
            </p>
            {field("name", "Campaign name")}
            {field("objective", "Acquisition objective")}
            <label>
              Content Engine source
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="">Start from an idea</option>
                <optgroup label="Generated videos">
                  {data.videos.map((v) => (
                    <option key={v.id} value={`video:${v.id}`}>
                      {v.title} ({v.status})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Transcripts">
                  {data.transcripts.map((v) => (
                    <option key={v.video_id} value={`transcript:${v.video_id}`}>
                      {v.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            {!form.source && (
              <label>
                Idea
                <textarea
                  required
                  rows={4}
                  value={form.idea}
                  onChange={(e) => setForm({ ...form, idea: e.target.value })}
                />
              </label>
            )}
            {field("topic", "Content topic")}
            {field("pillar", "Content pillar")}
            {field("cta_label", "Call to action")}
            {field("destination_url", "Existing funnel URL", "url")}
            <button className="acq-primary" disabled={busy}>
              Create campaign
            </button>
          </form>
          <form
            className="acq-card"
            onSubmit={(e) => {
              e.preventDefault();
              mutate(async () => {
                await api("posts", "POST", {
                  campaign_id: campaignId,
                  platforms: channels,
                  ...(manual.trim() ? { body: manual } : {}),
                });
                navigate("/admin/acquisition/posts");
              }, "Promotional drafts created. Review and submit them for approval.");
            }}
          >
            <h2>2. Platform promotions</h2>
            <p>
              Adapt the campaign source with the existing AI infrastructure, or
              supply your promotional copy.
            </p>
            <label>
              Campaign
              <select
                required
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">Select campaign</option>
                {data.campaigns
                  .filter((c) => c.status === "active")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <fieldset>
              <legend>Platforms</legend>
              {["linkedin", "reddit", "facebook", "instagram", "x"].map((p) => (
                <label className="acq-check" key={p}>
                  <input
                    type="checkbox"
                    checked={channels.includes(p)}
                    onChange={(e) =>
                      setChannels(
                        e.target.checked
                          ? [...channels, p]
                          : channels.filter((c) => c !== p),
                      )
                    }
                  />
                  {p}
                </label>
              ))}
            </fieldset>
            <label>
              Optional manual promotional copy
              <textarea
                rows={7}
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Leave blank to adapt the selected source using AI"
              />
            </label>
            <p className="acq-note">
              Copy the tracked CTA separately when sending manually. Short
              platform limits include this link. Instagram needs media and a
              supported link placement when you publish manually.
            </p>
            <button
              className="acq-primary"
              disabled={busy || !campaignId || !channels.length}
            >
              {busy
                ? "Working…"
                : manual.trim()
                  ? "Save promotional drafts"
                  : "Generate promotional variants"}
            </button>
          </form>
        </div>
      )}
      {["posts", "approvals", "calendar"].includes(section) && (
        <>
          <h2>
            {section === "calendar"
              ? "Manual outreach calendar"
              : section === "approvals"
                ? "Review queue"
                : "Promotional posts"}
          </h2>
          {section === "calendar" && (
            <p className="acq-note">
              Times are shown in your browser’s local timezone. Calendar entries
              are reminders for manual outreach; they never trigger posting.
            </p>
          )}
          <div className="acq-grid">
            {filteredPosts.map((p) => (
              <Post
                key={p.id}
                post={p}
                campaign={data.campaigns.find((c) => c.id === p.campaign_id)}
                onAction={action}
                busy={busy}
              />
            ))}
            {!filteredPosts.length && !loading && (
              <p>No posts in this view yet.</p>
            )}
          </div>
        </>
      )}
      {section === "analytics" && (
        <>
          <div className="acq-card acq-filters">
            <label>
              Attribution
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="last">Last touch</option>
                <option value="first">First touch</option>
              </select>
            </label>
            <label>
              Group by
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
              >
                {[
                  "platform",
                  "campaign",
                  "post",
                  "topic",
                  "pillar",
                  "cta",
                  "asset",
                ].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              From (UTC)
              <input
                type="date"
                value={since}
                onChange={(e) => setSince(e.target.value)}
              />
            </label>
            <label>
              Through (UTC)
              <input
                type="date"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </label>
          </div>
          <p className="acq-note">
            90-day click eligibility. Leads are deduplicated by normalized
            email; customers by attributed lead. Revenue is grouped by currency.
            Social impressions and engagements are lifetime snapshots,
            independent of the event date filter. First and last touch are
            alternate models; do not add them together.
          </p>
          <div className="acq-table">
            <table>
              <thead>
                <tr>
                  {[
                    "Source",
                    "Clicks",
                    "Leads",
                    "Lead rate",
                    "Customers",
                    "Paid checkouts",
                    "Revenue",
                    "Impressions",
                    "Engagements",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r) => (
                  <tr key={r.key}>
                    <td>
                      {dimension === "asset" && r.key.startsWith("video:")
                        ? data.videos.find((v) => v.id === r.key.slice(6))
                            ?.title || r.label
                        : dimension === "asset" &&
                            r.key.startsWith("transcript:")
                          ? data.transcripts.find(
                              (v) => v.video_id === r.key.slice(11),
                            )?.title || r.label
                          : r.label}
                    </td>
                    <td>{r.clicks}</td>
                    <td>{r.leads}</td>
                    <td>
                      {r.lead_rate === null
                        ? "—"
                        : `${(r.lead_rate * 100).toFixed(1)}%`}
                    </td>
                    <td>{r.customers}</td>
                    <td>{r.conversions}</td>
                    <td>
                      {Object.keys(r.revenue_minor).length ? (
                        <Revenue values={r.revenue_minor} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{r.impressions}</td>
                    <td>{r.engagements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <article className="acq-card">
            <h2>What to distribute next</h2>
            {report.rows.some((r) => r.customers > 0) ? (
              <p>
                The leading {dimension} by attributed customers is{" "}
                <strong>{report.rows[0].label}</strong> (
                {report.rows[0].customers} customers). Use this as a candidate
                for another distribution test; attribution alone does not
                establish causation.
              </p>
            ) : (
              <p>
                No attributed customers in this selection yet. Collect funnel
                outcomes before treating engagement as acquisition success.
              </p>
            )}
          </article>
        </>
      )}
      {section === "settings" && settings && (
        <article className="acq-card">
          <h2>Integration settings</h2>
          <p>Automatic posting: disabled</p>
          <p>
            Discovery import:{" "}
            <code>POST {settings.public_origin}/api/acquisition/ingest</code>
          </p>
          <p>
            Connect the import Header Auth credential in n8n, and select one of
            these campaign IDs in the workflow configuration:
          </p>
          {data.campaigns.map((c) => (
            <p key={c.id}>
              {c.name}: <code>{c.id}</code>
            </p>
          ))}

          <p>
            Shared Content Engine AI:{" "}
            {settings.ai_configured ? "Configured" : "Missing OPENAI_API_KEY"}
          </p>
          <p>
            n8n discovery import:{" "}
            {settings.ingest_configured
              ? "Configured"
              : "Needs ACQUISITION_INGEST_SECRET (32+ characters)"}
          </p>
          <p>Tracked link origin: {settings.public_origin}</p>
          <p>Allowed funnel origins: {settings.allowed_origins.join(", ")}</p>
          <p>Attribution window: {settings.attribution_window_days} days</p>
          <p>
            Server-managed configuration keeps provider credentials outside the
            browser. Use your existing n8n discovery and response-drafting
            workflows. Review and approve responses before sending them
            yourself. Automatic posting is disabled.
          </p>
          <p className="acq-note">
            See docs/ACQUISITION_ENGINE.md in the repository for migration,
            import contracts, attribution coverage, and rollout verification.
          </p>
        </article>
      )}
    </div>
  );
}
