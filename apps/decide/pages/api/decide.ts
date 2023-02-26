import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

type Decision = {
  id: string;
  // Decision status matches the HTTP status code to allow the client to just
  // read the status code if it prefers
  status: 200 | 400 | 403 | 429;
  reason: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Decision>
) {
  let uuid = crypto.randomUUID();
  res.setHeader("X-Decision", uuid);
  res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate");
  console.debug(`decide: ${uuid}: received request: raw ${req.body}`);

  let body = req.body;

  if (req.body) {
    body = JSON.parse(req.body);
  }

  if (!body) {
    console.error(`decide: ${uuid}: No body`);

    const decision: Decision = {
      id: uuid,
      status: 400,
      reason: "No body",
    };
    res.status(decision.status).json(decision);
    return;
  } else {
    console.debug(`decide: ${uuid}: body: ${JSON.stringify(body)}`);
  }

  const decision: Decision = {
    id: uuid,
    status: 200,
    reason: "OK",
  };
  console.info(`decide: ${uuid}: decision: ${JSON.stringify(decision)}`);
  res.status(decision.status).json(decision);
}
