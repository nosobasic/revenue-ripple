import { useState, useMemo, useCallback } from 'react';

const DELAY_MS = 300;

const MARKETING_TOPICS = [
  {
    id: 'email',
    label: 'Email marketing',
    keywords: [
      'email', 'newsletter', 'mailing list', 'open rate', 'click-through',
      'drip', 'autoresponder', 'subject line', 'inbox', 'unsubscribe',
    ],
  },
  {
    id: 'paid',
    label: 'Paid advertising',
    keywords: [
      'ppc', 'google ads', 'adwords', 'facebook ads', 'meta ads', 'cpc', 'cpm',
      'roas', 'paid media', 'campaign budget', 'ad spend', 'retargeting',
    ],
  },
  {
    id: 'seo',
    label: 'SEO & organic',
    keywords: [
      'seo', 'organic', 'search ranking', 'keyword', 'backlink', 'serp',
      'google search', 'meta description', 'alt text', 'search engine',
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & data',
    keywords: [
      'analytics', 'metrics', 'kpi', 'conversion rate', 'funnel', 'dashboard',
      'google analytics', 'data-driven', 'roi', 'tracking', 'attribution',
    ],
  },
  {
    id: 'social',
    label: 'Social media',
    keywords: [
      'social media', 'instagram', 'linkedin', 'tiktok', 'twitter', 'engagement rate',
      'followers', 'viral', 'reel', 'hashtag', 'community manager',
    ],
  },
  {
    id: 'copy',
    label: 'Copywriting',
    keywords: [
      'copywriting', 'headline', 'hook', 'cta', 'call to action', 'persuasion',
      'storytelling', 'value proposition', 'sales copy', 'benefit-driven',
    ],
  },
  {
    id: 'automation',
    label: 'Marketing automation',
    keywords: [
      'automation', 'zapier', 'hubspot', 'workflow', 'trigger', 'nurture sequence',
      'crm', 'lead scoring', 'lifecycle', 'marketing automation',
    ],
  },
  {
    id: 'affiliate',
    label: 'Affiliate & partnerships',
    keywords: [
      'affiliate', 'commission', 'partner', 'referral', 'influencer', 'sponsorship',
      'revenue share', 'joint venture', 'partnership program',
    ],
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSynthesia(path) {
  const res = await fetch(`/api/synthesia?path=${encodeURIComponent(path)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Synthesia request failed (${res.status})`);
  }
  return data;
}

export function parseSrt(srtText) {
  if (!srtText || typeof srtText !== 'string') return '';

  const blocks = srtText.trim().split(/\n\s*\n/);
  const lines = [];

  for (const block of blocks) {
    const blockLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const textLines = blockLines.filter((line) => {
      if (/^\d+$/.test(line)) return false;
      if (/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}/.test(line)) return false;
      return true;
    });

    for (let line of textLines) {
      line = line.replace(/<[^>]+>/g, '').trim();
      if (line) lines.push(line);
    }
  }

  return lines.join(' ').replace(/\s+/g, ' ').trim();
}

function getSrtUrl(detail) {
  return detail?.captions?.srt || detail?.download?.captions?.srt || null;
}

function getVideoTitle(video, detail) {
  return (
    detail?.title ||
    detail?.name ||
    video?.title ||
    video?.name ||
    'Untitled video'
  );
}

function getVideoId(video) {
  return video?.id || video?.videoId;
}

export function analyzeContentGaps(transcripts) {
  const corpus = transcripts
    .map((t) => t.transcript || '')
    .join(' ')
    .toLowerCase();

  return MARKETING_TOPICS.map((topic) => {
    const matched = topic.keywords.filter((kw) => corpus.includes(kw.toLowerCase()));
    const coverage = Math.round((matched.length / topic.keywords.length) * 100);
    return {
      ...topic,
      coverage,
      matchedCount: matched.length,
      totalKeywords: topic.keywords.length,
      isGap: coverage < 30,
    };
  });
}

function escapeSql(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function buildExportPayload(items) {
  return items
    .filter((item) => item.transcript)
    .map((item) => ({
      videoId: item.videoId,
      title: item.title,
      transcript: item.transcript,
      fetchedAt: item.fetchedAt || new Date().toISOString(),
    }));
}

function buildSqlInserts(payload) {
  if (!payload.length) return '-- No transcripts to insert';

  const rows = payload.map((row) => {
    const ts = row.fetchedAt.replace('T', ' ').replace(/\.\d{3}Z$/, '');
    return `  ('${escapeSql(row.videoId)}', '${escapeSql(row.title)}', '${escapeSql(row.transcript)}', '${escapeSql(ts)}')`;
  });

  return `INSERT INTO video_transcripts (video_id, title, transcript, created_at) VALUES\n${rows.join(',\n')};`;
}

function StatusBadge({ status }) {
  const styles = {
    transcribed: 'bg-green-100 text-green-800',
    srt_available: 'bg-amber-100 text-amber-800',
    no_captions: 'bg-gray-100 text-gray-600',
    error: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800',
  };
  const labels = {
    transcribed: 'Transcribed',
    srt_available: 'SRT available',
    no_captions: 'No captions',
    error: 'Error',
    pending: 'Pending',
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export default function TranscriptPipeline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState('');

  const gapAnalysis = useMemo(
    () => analyzeContentGaps(items.filter((i) => i.transcript)),
    [items]
  );

  const exportPayload = useMemo(() => buildExportPayload(items), [items]);
  const sqlExport = useMemo(() => buildSqlInserts(exportPayload), [exportPayload]);

  const updateItem = useCallback((videoId, patch) => {
    setItems((prev) =>
      prev.map((item) => (item.videoId === videoId ? { ...item, ...patch } : item))
    );
  }, []);

  const loadVideoList = async () => {
    const allVideos = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const data = await fetchSynthesia(`videos?limit=${limit}&offset=${offset}`);
      const batch = data.videos || [];
      allVideos.push(...batch);
      if (batch.length < limit) break;
      offset += batch.length;
      await delay(DELAY_MS);
    }

    return allVideos;
  };

  const processVideo = async (video) => {
    const videoId = getVideoId(video);
    if (!videoId) {
      return {
        videoId: 'unknown',
        title: getVideoTitle(video),
        status: 'error',
        error: 'Missing video ID',
      };
    }

    try {
      const detail = await fetchSynthesia(`videos/${videoId}`);
      await delay(DELAY_MS);

      const srtUrl = getSrtUrl(detail);
      const title = getVideoTitle(video, detail);

      if (!srtUrl) {
        return { videoId, title, status: 'no_captions', srtUrl: null, transcript: '' };
      }

      const srtRes = await fetch(srtUrl);
      if (!srtRes.ok) {
        throw new Error(`Failed to download SRT (${srtRes.status})`);
      }

      const srtText = await srtRes.text();
      const transcript = parseSrt(srtText);

      return {
        videoId,
        title,
        status: transcript ? 'transcribed' : 'srt_available',
        srtUrl,
        transcript,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        videoId,
        title: getVideoTitle(video),
        status: 'error',
        error: err.message,
        transcript: '',
      };
    }
  };

  const handleLoadVideos = async () => {
    setError(null);
    setLoading(true);
    try {
      const videos = await loadVideoList();
      setItems(
        videos.map((video) => ({
          videoId: getVideoId(video),
          title: getVideoTitle(video),
          status: 'pending',
          transcript: '',
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAll = async () => {
    setError(null);
    setFetchingAll(true);

    let sourceVideos;
    try {
      if (items.length > 0) {
        sourceVideos = items.map((item) => ({ id: item.videoId, title: item.title }));
      } else {
        sourceVideos = await loadVideoList();
        setItems(
          sourceVideos.map((video) => ({
            videoId: getVideoId(video),
            title: getVideoTitle(video),
            status: 'pending',
            transcript: '',
          }))
        );
      }
    } catch (err) {
      setError(err.message);
      setFetchingAll(false);
      return;
    }

    setProgress({ current: 0, total: sourceVideos.length });

    const results = [];
    for (let i = 0; i < sourceVideos.length; i++) {
      const video = sourceVideos[i];
      const result = await processVideo(video);
      results.push(result);
      setProgress({ current: i + 1, total: sourceVideos.length });
      setItems((prev) => {
        const map = new Map(prev.map((p) => [p.videoId, p]));
        map.set(result.videoId, result);
        return Array.from(map.values());
      });
      if (i < sourceVideos.length - 1) await delay(DELAY_MS);
    }

    setFetchingAll(false);
  };

  const handleFetchOne = async (videoId) => {
    const video = items.find((i) => i.videoId === videoId);
    if (!video) return;
    updateItem(videoId, { status: 'pending' });
    const result = await processVideo({ id: videoId, title: video.title });
    updateItem(videoId, result);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthesia-transcripts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(sqlExport);
      setCopyFeedback('SQL copied to clipboard');
      setTimeout(() => setCopyFeedback(''), 2500);
    } catch {
      setCopyFeedback('Copy failed — select SQL manually');
    }
  };

  const progressPct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const transcribedCount = items.filter((i) => i.status === 'transcribed').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Synthesia Transcript Pipeline</h1>
        <p className="text-gray-600 mt-1">
          Fetch video captions from Synthesia, analyze marketing content gaps, and export for storage.
        </p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={handleLoadVideos}
          disabled={loading || fetchingAll}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Loading videos…' : 'Load video list'}
        </button>
        <button
          type="button"
          onClick={handleFetchAll}
          disabled={fetchingAll || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {fetchingAll ? `Fetching… ${progress.current}/${progress.total}` : 'Fetch all'}
        </button>
        <button
          type="button"
          onClick={handleDownloadJson}
          disabled={!exportPayload.length}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={handleCopySql}
          disabled={!exportPayload.length}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Copy SQL to clipboard
        </button>
      </div>

      {copyFeedback && (
        <p className="text-sm text-green-700 mb-4">{copyFeedback}</p>
      )}

      {fetchingAll && progress.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Processing videos</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {items.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {items.length} videos · {transcribedCount} transcribed
        </p>
      )}

      {transcribedCount > 0 && (
        <section className="mb-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Content gap analyzer</h2>
          <p className="text-sm text-gray-500 mb-4">
            Keyword coverage across all loaded transcripts. Topics under 30% are expansion opportunities.
          </p>
          <div className="space-y-4">
            {gapAnalysis.map((topic) => (
              <div key={topic.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {topic.label}
                    {topic.isGap && (
                      <span className="ml-2 text-xs text-amber-700 font-normal">
                        · expansion opportunity
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-600">{topic.coverage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      topic.isGap ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${topic.coverage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {topic.matchedCount} / {topic.totalKeywords} keywords matched
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
        {items.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">Load videos or click Fetch all to begin.</p>
        )}
        {items.map((item) => (
          <article
            key={item.videoId}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{item.videoId}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                {item.status !== 'transcribed' && item.status !== 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleFetchOne(item.videoId)}
                    disabled={fetchingAll}
                    className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
            {item.error && (
              <p className="text-xs text-red-600 mb-2">{item.error}</p>
            )}
            {item.transcript ? (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.transcript}
              </p>
            ) : item.status === 'srt_available' ? (
              <p className="text-sm text-gray-500 italic">SRT downloaded but no text extracted.</p>
            ) : item.status === 'no_captions' ? (
              <p className="text-sm text-gray-500 italic">No captions URL on this video.</p>
            ) : null}
          </article>
        ))}
      </section>

      {exportPayload.length > 0 && (
        <details className="mt-8">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Preview SQL export ({exportPayload.length} rows)
          </summary>
          <pre className="mt-2 p-4 bg-gray-900 text-gray-100 text-xs rounded-lg overflow-x-auto max-h-64">
            {sqlExport}
          </pre>
        </details>
      )}
    </div>
  );
}
