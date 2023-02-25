import type { NextApiRequest, NextApiResponse } from "next";
import { secure } from "secure-middleware";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uuid = crypto.randomUUID(); // Temporary, only for timing
  console.debug(`api/test: ${uuid} start`);
  console.time(`api/test: ${uuid}`);

  const secureResponse = await secure(req);
  if (secureResponse.isErr) {
    console.error(`api/test: ${uuid}: error: ${secureResponse.error.reason}`);
    console.timeEnd(`api/test: ${uuid}`);
    console.debug(`api/test: ${uuid} finish`);
    return secureResponse.error.res;
  } else {
    console.timeEnd(`api/test: ${uuid}`);
    console.debug(`api/test: ${uuid} finish`);
    res.status(200).json({ name: "John Doe" });
  }
}
