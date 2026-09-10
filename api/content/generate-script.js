import { getSupabaseAdmin, logActivity } from '../lib/supabaseAdmin.js';
import { getOpenAI } from '../lib/openaiClient.js';

const SYSTEM_MESSAGE =
  'You are a marketing educator for Revenue Ripple, a platform teaching digital marketing. Write a clear, engaging video script for a lesson on the given topic. Format: Hook (30s), Core concept (2min), Example (1min), Key takeaway (30s). Avoid filler words. Write for an AI avatar presenter. Return only the script text.';

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const { gap_id, topic, coverage_pct } = body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Missing required field: topic' });
    }

    const supabase = getSupabaseAdmin();
    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: `Write a script for a lesson on: ${topic}` },
      ],
    });

    const script = completion.choices[0]?.message?.content?.trim();
    if (!script) {
      return res.status(502).json({ error: 'Empty script from OpenAI' });
    }

    const title = `Revenue Ripple: ${topic}`;

    const { data: inserted, error: insertError } = await supabase
      .from('generated_videos')
      .insert({
        title,
        script,
        topic,
        gap_id: gap_id || null,
        status: 'pending',
      })
      .select('id, title, script')
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    await logActivity(supabase, 'script_generated', {
      generated_video_id: inserted.id,
      gap_id: gap_id ?? null,
      topic,
      coverage_pct: coverage_pct ?? null,
      title,
    });

    return res.status(200).json({
      id: inserted.id,
      script: inserted.script,
      title: inserted.title,
    });
  } catch (err) {
    console.error('generate-script error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
