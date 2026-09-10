import { getSupabaseAdmin } from '../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('generated_videos')
      .select(
        `
        id,
        title,
        script,
        topic,
        gap_id,
        synthesia_video_id,
        vimeo_video_id,
        vimeo_embed_url,
        status,
        published_at,
        created_at,
        content_gaps (
          id,
          topic,
          coverage_pct,
          priority,
          video_count,
          last_analyzed
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: gaps, error: gapsError } = await supabase
      .from('content_gaps')
      .select('*')
      .order('coverage_pct', { ascending: true });

    if (gapsError) {
      return res.status(500).json({ error: gapsError.message });
    }

    return res.status(200).json({ videos: data ?? [], gaps: gaps ?? [] });
  } catch (err) {
    console.error('status error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
