export default async function handler(req, res) {
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const apiKey = process.env.SYNTHESIA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SYNTHESIA_API_KEY is not configured' });
  }

  try {
    const rawPath = Array.isArray(path) ? path[0] : path;
    const decoded = decodeURIComponent(rawPath);
    const response = await fetch(`https://api.synthesia.io/v2/${decoded}`, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
