// Retired: n8n now imports discovery results through /api/acquisition/ingest.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res
    .status(410)
    .json({
      error:
        "Automatic posting is disabled. Use /api/acquisition/ingest for opportunities and review drafts in Acquisition.",
    });
}
