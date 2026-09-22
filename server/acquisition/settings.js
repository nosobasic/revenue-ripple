import { endpoint } from "../lib/acquisition.js";
export default endpoint(["GET"], async (req, res) =>
  res.status(200).json({
    automatic_posting: false,
    ingest_configured:
      (process.env.ACQUISITION_INGEST_SECRET || "").length >= 32,
    ai_configured: Boolean(process.env.OPENAI_API_KEY),
    allowed_origins: (
      process.env.ACQUISITION_ALLOWED_ORIGINS ||
      "https://revenueripple.org,https://www.revenueripple.org"
    ).split(","),
    public_origin:
      process.env.ACQUISITION_PUBLIC_ORIGIN || "https://revenueripple.org",
    attribution_window_days: 90,
  }),
);
