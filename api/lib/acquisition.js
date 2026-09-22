import { z } from "zod";
import { getSupabaseAdmin } from "./supabaseAdmin.js";
export const uuid = z.string().uuid();
export const platform = z.enum([
  "linkedin",
  "facebook",
  "instagram",
  "x",
  "reddit",
]);
export const LIMITS = {
  linkedin: 3000,
  facebook: 5000,
  instagram: 2200,
  x: 280,
  reddit: 5000,
};
export function fail(status, message) {
  return Object.assign(new Error(message), { status });
}
export function checked(result) {
  if (result.error)
    throw fail(
      409,
      "Database operation failed; reload and check the server logs",
    );
  return result.data;
}
export function dbResult(result) {
  if (result.error)
    console.error(
      JSON.stringify({
        component: "acquisition",
        databaseCode: result.error.code,
        message: result.error.message,
      }),
    );
  return checked(result);
}
export async function admin(req, db) {
  const token = req.headers?.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw fail(401, "Sign in to continue");
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) throw fail(401, "Session expired");
  const profile = dbResult(
    await db.from("users").select("role").eq("id", data.user.id).maybeSingle(),
  );
  if (profile?.role !== "admin") throw fail(403, "Admin access required");
  return data.user.id;
}
export function destination(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw fail(400, "A complete funnel URL is required");
  }
  const allowed = (
    process.env.ACQUISITION_ALLOWED_ORIGINS ||
    "https://revenueripple.org,https://www.revenueripple.org"
  )
    .split(",")
    .map((v) => v.trim());
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !allowed.includes(url.origin)
  )
    throw fail(
      400,
      "Use an HTTPS funnel URL on an allowed Revenue Ripple origin",
    );
  return url;
}
export function trackingUrl(id) {
  const origin = destination(
    process.env.ACQUISITION_PUBLIC_ORIGIN || "https://revenueripple.org",
  ).origin;
  return `${origin}/api/acquisition/track?p=${encodeURIComponent(id)}`;
}
export function validatePost(body, channel) {
  // Reserve room for the appended tracking URL and separation.
  const max =
    LIMITS[channel] -
    trackingUrl("00000000-0000-4000-8000-000000000000").length -
    2;
  if (!body?.trim() || [...body].length > max)
    throw fail(
      400,
      `${channel} promotional copy must contain 1–${max} characters before the tracked CTA`,
    );
  return body.trim();
}
export async function all(db, table, select = "*") {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const batch = dbResult(
      await db
        .from(table)
        .select(select)
        .order("id")
        .range(start, start + 999),
    );
    rows.push(...batch);
    if (batch.length < 1000) return rows;
    if (rows.length >= 100000)
      throw fail(
        503,
        "Reporting volume requires a warehouse rollup; results were not truncated",
      );
  }
}
export function endpoint(methods, fn, auth = "admin") {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!methods.includes(req.method)) {
      res.setHeader("Allow", methods.join(", "));
      return res.status(405).json({ error: "Method not allowed" });
    }
    try {
      const db = getSupabaseAdmin();
      const actor = auth === "admin" ? await admin(req, db) : null;
      await fn(req, res, db, actor);
    } catch (error) {
      const status = error instanceof z.ZodError ? 400 : error.status || 500;
      console.error(
        JSON.stringify({
          component: "acquisition",
          status,
          error: error.message,
        }),
      );
      res.status(status).json({
        error:
          error instanceof z.ZodError
            ? "Invalid input: " +
              error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("; ")
            : status < 500
              ? error.message
              : "Acquisition service unavailable. Check configuration and server logs.",
      });
    }
  };
}
