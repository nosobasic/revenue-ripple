import { getSupabaseAdmin, logActivity } from '../lib/supabaseAdmin.js';
import { getOpenAI, parseJsonFromModel } from '../lib/openaiClient.js';

const SYSTEM_MESSAGE =
  'You are a marketing education content analyst. Given these course transcripts, identify the top 8 marketing topics and score each 0-100 for how well covered they are. Return only a JSON array, no markdown: [{topic, coverage_pct, priority}]';

const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);

function normalizeGap(row) {
  const coverage = Math.min(100, Math.max(0, Number(row.coverage_pct) || 0));
  let priority = String(row.priority || 'medium').toLowerCase();
  if (!VALID_PRIORITIES.has(priority)) priority = 'medium';

  return {
    topic: String(row.topic || '').trim(),
    coverage_pct: Math.round(coverage),
    priority,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const openai = getOpenAI();

    const { data: transcripts, error: fetchError } = await supabase
      .from('video_transcripts')
      .select('video_id, title, transcript')
      .not('transcript', 'is', null);

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    if (!transcripts?.length) {
      return res.status(400).json({ error: 'No transcripts found in video_transcripts' });
    }

    const corpus = transcripts
      .map((row) => `[${row.title}]\n${row.transcript}`)
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: corpus },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return res.status(502).json({ error: 'Empty response from OpenAI' });
    }

    let parsed;
    try {
      parsed = parseJsonFromModel(raw);
    } catch {
      return res.status(502).json({ error: 'Failed to parse OpenAI response as JSON', raw });
    }

    if (!Array.isArray(parsed)) {
      return res.status(502).json({ error: 'OpenAI response is not a JSON array', raw: parsed });
    }

    const gaps = parsed.map(normalizeGap).filter((g) => g.topic);
    const now = new Date().toISOString();
    const transcriptCount = transcripts.length;

    const rows = gaps.map((gap) => ({
      topic: gap.topic,
      coverage_pct: gap.coverage_pct,
      priority: gap.priority,
      video_count: transcriptCount,
      last_analyzed: now,
    }));

    const { data: upserted, error: upsertError } = await supabase
      .from('content_gaps')
      .upsert(rows, { onConflict: 'topic' })
      .select();

    if (upsertError) {
      return res.status(500).json({ error: upsertError.message });
    }

    await logActivity(supabase, 'gap_analyzed', {
      gap_count: gaps.length,
      transcript_count: transcriptCount,
      gaps,
    });

    return res.status(200).json({ gaps: upserted ?? rows });
  } catch (err) {
    console.error('analyze-gaps error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
