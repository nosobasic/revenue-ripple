import { endpoint, dbResult } from "../lib/acquisition.js";
import { ingestAuth, parseOpportunity } from "../lib/acquisitionOutreach.js";
// Discovery credentials can import drafts only; they cannot approve or send them.
export default endpoint(
  ["POST"],
  async (req, res, db) => {
    ingestAuth(req);
    const input = parseOpportunity(req.body);
    const opportunity = dbResult(
      await db.rpc("acquisition_import_opportunity", { p_data: input }),
    );
    res.status(200).json({ opportunity });
  },
  "public",
);
