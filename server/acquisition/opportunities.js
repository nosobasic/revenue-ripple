import { z } from "zod";
import { endpoint, dbResult, all, uuid } from "../lib/acquisition.js";
export default endpoint(["GET", "PATCH"], async (req, res, db) => {
  if (req.method === "GET")
    return res
      .status(200)
      .json({ opportunities: await all(db, "acquisition_opportunities") });
  const input = z
    .object({ id: uuid, status: z.enum(["new", "reviewing", "dismissed"]) })
    .parse(req.body);
  const opportunity = dbResult(
    await db
      .from("acquisition_opportunities")
      .update({ status: input.status })
      .eq("id", input.id)
      .select()
      .single(),
  );
  res.status(200).json(opportunity);
});
