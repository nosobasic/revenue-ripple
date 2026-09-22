import { z } from "zod";
import {
  endpoint,
  dbResult,
  destination,
  uuid,
  all,
} from "../lib/acquisition.js";
const schema = z
  .object({
    name: z.string().trim().min(1).max(160),
    objective: z.string().trim().min(1).max(1000),
    topic: z.string().trim().max(160).default(""),
    pillar: z.string().trim().max(160).default(""),
    idea: z.string().trim().max(12000).default(""),
    source_video_id: uuid.nullable().default(null),
    source_transcript_video_id: z
      .string()
      .min(1)
      .max(200)
      .nullable()
      .default(null),
    cta_label: z.string().trim().min(1).max(120),
    destination_url: z.string().max(2000),
  })
  .refine(
    (v) =>
      !(v.source_video_id && v.source_transcript_video_id) &&
      (v.source_video_id || v.source_transcript_video_id || v.idea),
    "Select one Content Engine asset or supply an idea",
  );
export default endpoint(
  ["GET", "POST", "PATCH"],
  async (req, res, db, actor) => {
    if (req.method === "GET") {
      const [campaigns, videos, transcripts] = await Promise.all([
        all(db, "acquisition_campaigns"),
        all(db, "generated_videos", "id,title,topic,status,vimeo_embed_url"),
        all(db, "video_transcripts", "id,video_id,title,topic_tags"),
      ]);
      return res.status(200).json({ campaigns, videos, transcripts });
    }
    if (req.method === "PATCH") {
      const { id, status } = z
        .object({ id: uuid, status: z.enum(["active", "paused", "archived"]) })
        .parse(req.body);
      return res
        .status(200)
        .json(
          dbResult(
            await db
              .from("acquisition_campaigns")
              .update({ status })
              .eq("id", id)
              .select()
              .single(),
          ),
        );
    }
    const data = schema.parse(req.body);
    data.destination_url = destination(data.destination_url).toString();
    return res.status(201).json(
      dbResult(
        await db
          .from("acquisition_campaigns")
          .insert({ ...data, created_by: actor })
          .select()
          .single(),
      ),
    );
  },
);
