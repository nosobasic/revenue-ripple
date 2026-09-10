import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const POLL_MS = 60_000;

const STATUS_STYLES = {
  pending: 'bg-slate-100 text-slate-700',
  rendering: 'bg-amber-100 text-amber-800',
  uploading: 'bg-sky-100 text-sky-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const PRIORITY_BAR = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function courseLibraryPath(topic) {
  if (!topic) return '/courses';
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return slug ? `/courses/${slug}` : '/courses';
}

function pickTopGap(gaps) {
  if (!gaps?.length) return null;
  return [...gaps].sort((a, b) => {
    const pr =
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
    if (pr !== 0) return pr;
    return (a.coverage_pct ?? 0) - (b.coverage_pct ?? 0);
  })[0];
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
    >
      {status || 'pending'}
    </span>
  );
}

function VideoCard({ video }) {
  const [scriptOpen, setScriptOpen] = useState(false);
  const gap = video.content_gaps;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{video.title}</h3>
          {video.topic && (
            <span className="mt-2 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {video.topic}
            </span>
          )}
        </div>
        <StatusBadge status={video.status} />
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-500 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-slate-600">Created: </dt>
          <dd className="inline">{formatDate(video.created_at)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-600">Published: </dt>
          <dd className="inline">{formatDate(video.published_at)}</dd>
        </div>
      </dl>

      {gap && (
        <p className="mt-2 text-xs text-slate-500">
          Gap coverage: {gap.coverage_pct}% · priority {gap.priority}
        </p>
      )}

      {video.script && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setScriptOpen((o) => !o)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {scriptOpen ? 'Hide script' : 'Show script'}
          </button>
          {scriptOpen && (
            <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              {video.script}
            </pre>
          )}
        </div>
      )}

      {video.vimeo_embed_url && (
        <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-slate-200 bg-black">
          <iframe
            src={video.vimeo_embed_url}
            title={video.title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {video.status === 'published' && (
        <Link
          to={courseLibraryPath(video.topic)}
          className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          View in course library →
        </Link>
      )}
    </article>
  );
}

function GapBarChart({ gaps }) {
  if (!gaps.length) {
    return (
      <p className="text-sm text-slate-500">
        No gap data yet. Run analysis to populate this chart.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {gaps.map((gap) => (
        <div key={gap.id || gap.topic}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800 truncate">{gap.topic}</span>
            <span className="shrink-0 text-slate-500">{gap.coverage_pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                PRIORITY_BAR[gap.priority] || PRIORITY_BAR.medium
              }`}
              style={{ width: `${Math.min(100, Math.max(0, gap.coverage_pct ?? 0))}%` }}
            />
          </div>
          <p className="mt-0.5 text-xs capitalize text-slate-400">{gap.priority} priority</p>
        </div>
      ))}
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  if (!message) return null;

  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles}`}
      role="status"
    >
      <p className="flex-1 text-sm">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-sm opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default function ContentEngine() {
  const [videos, setVideos] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'success' }), 4500);
  }, []);

  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content/status');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load content status');
      setVideos(data.videos ?? []);
      setGaps(data.gaps ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = window.setInterval(() => fetchStatus(true), POLL_MS);
    return () => window.clearInterval(interval);
  }, [fetchStatus]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const publishedThisWeek = videos.filter(
      (v) => v.status === 'published' && v.published_at && new Date(v.published_at).getTime() >= weekAgo
    ).length;

    const sortedByCoverage = [...gaps].sort(
      (a, b) => (a.coverage_pct ?? 0) - (b.coverage_pct ?? 0)
    );
    const highestGap = sortedByCoverage[0];

    return {
      totalGenerated: videos.length,
      publishedThisWeek,
      topicsCovered: gaps.length,
      highestGapTopic: highestGap?.topic ?? '—',
    };
  }, [videos, gaps]);

  const topGap = useMemo(() => pickTopGap(gaps), [gaps]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/content/analyze-gaps', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setGaps(data.gaps ?? []);
      showToast('Gap analysis complete — chart updated.');
      await fetchStatus(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateTopGap = async () => {
    if (!topGap) {
      showToast('Run analysis first to identify content gaps.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/content/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gap_id: topGap.id,
          topic: topGap.topic,
          coverage_pct: topGap.coverage_pct,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Script generation failed');
      showToast(`Script queued for "${topGap.topic}".`);
      await fetchStatus(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-full">
      <header className="admin-header mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="admin-title text-2xl font-bold text-slate-900">Content Engine</h1>
          <p className="mt-1 text-sm text-slate-500">
            Automated gap analysis, script generation, and video pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchStatus()}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* LEFT — Activity feed */}
        <section className="xl:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Activity feed</h2>
          {loading && videos.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading generated videos…
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No generated videos yet. Run analysis and generate a script to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>

        {/* RIGHT — Metrics + controls */}
        <aside className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total generated', value: metrics.totalGenerated },
              { label: 'Published this week', value: metrics.publishedThisWeek },
              { label: 'Topics covered', value: metrics.topicsCovered },
              { label: 'Highest gap topic', value: metrics.highestGapTopic, small: true },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p
                  className={`mt-1 font-bold text-slate-900 ${
                    card.small ? 'text-sm leading-snug' : 'text-2xl'
                  }`}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Content gaps</h2>
            <GapBarChart gaps={gaps} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing…' : 'Run analysis now'}
            </button>
            <button
              type="button"
              onClick={handleGenerateTopGap}
              disabled={generating || !topGap}
              className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              {generating
                ? 'Generating script…'
                : topGap
                  ? `Generate video for top gap (${topGap.topic})`
                  : 'Generate video for top gap'}
            </button>
            {topGap && (
              <p className="text-xs text-slate-500">
                Top gap: {topGap.topic} at {topGap.coverage_pct}% coverage ({topGap.priority}{' '}
                priority)
              </p>
            )}
          </div>
        </aside>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
