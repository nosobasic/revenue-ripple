const SYNTHESIA_BASE = 'https://api.synthesia.io/v2';

function isValidPath(path) {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('..') || path.startsWith('/')) return false;
  return /^[\w./-]+$/.test(path);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SYNTHESIA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SYNTHESIA_API_KEY is not configured' });
  }

  const { path, ...queryRest } = req.query;
  if (!isValidPath(path)) {
    return res.status(400).json({ error: 'Invalid or missing path parameter' });
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryRest)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  }

  const qs = params.toString();
  const url = `${SYNTHESIA_BASE}/${path}${qs ? `?${qs}` : ''}`;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    });

    const contentType = upstream.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await upstream.json()
      : await upstream.text();

    if (!upstream.ok) {
      return res.status(upstream.status).json(
        typeof body === 'object' && body !== null
          ? body
          : { error: typeof body === 'string' ? body : 'Synthesia API error' }
      );
    }

    return res.status(200).json(body);
  } catch (err) {
    console.error('[synthesia proxy]', err);
    return res.status(502).json({
      error: 'Failed to reach Synthesia API',
      message: err.message,
    });
  }
}
