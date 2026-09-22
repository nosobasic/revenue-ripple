import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { uuid, destination, fail } from "./acquisition.js";

export function ingestAuth(req) {
  const expected = process.env.ACQUISITION_INGEST_SECRET;
  const supplied =
    req.headers?.authorization?.match(/^Bearer (.+)$/)?.[1] || "";
  if (!expected || expected.length < 32)
    throw fail(503, "Discovery import is not configured");
  if (
    Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
  )
    throw fail(401, "Invalid import credentials");
}
export function sourceUrl(value, platform) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw fail(400, "A complete source URL is required");
  }
  const hosts = {
    linkedin: ["linkedin.com", "www.linkedin.com"],
    reddit: ["reddit.com", "www.reddit.com", "old.reddit.com"],
    facebook: ["facebook.com", "www.facebook.com"],
    instagram: ["instagram.com", "www.instagram.com"],
    x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  };
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !hosts[platform]?.includes(url.hostname)
  )
    throw fail(400, "Source URL must match the selected social platform");
  url.hostname =
    platform === "reddit"
      ? "www.reddit.com"
      : platform === "linkedin"
        ? "www.linkedin.com"
        : url.hostname;
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (url.pathname === "/")
    throw fail(400, "Use a profile, thread, or post URL");
  return url.toString();
}
const text = (max) => z.string().trim().max(max).default("");
export const opportunitySchema = z.object({
  campaign_id: uuid,
  platform: z.enum(["linkedin", "reddit"]),
  source_url: z.string().max(2000),
  source_title: text(500),
  source_text: text(30000),
  author: text(200),
  company: text(200),
  role: text(200),
  community: text(200),
  pain_level: z.number().int().min(1).max(5).nullable().default(null),
  intent: z
    .enum(["learning", "tools", "hiring", "venting"])
    .nullable()
    .default(null),
  buyer: z.boolean().nullable().default(null),
  matched_resource_url: z.string().max(2000).nullable().default(null),
  reply: z.string().trim().min(1).max(5000),
  workflow_name: text(200),
});
export function parseOpportunity(body) {
  const input = opportunitySchema.parse(body);
  input.source_url = sourceUrl(input.source_url, input.platform);
  if (input.matched_resource_url)
    input.matched_resource_url = destination(
      input.matched_resource_url,
    ).toString();
  if (input.platform === "linkedin" && [...input.reply].length > 300)
    throw fail(400, "LinkedIn connection draft exceeds 300 characters");
  return input;
}
