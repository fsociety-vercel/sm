import { Result } from "true-myth";

export interface SecureConfig {
  errorStatusCode?: number;
  errorBody?: string;
  cacheDecisionFor?: number;
}

export async function secure(
  req: Request,
  res?: Response,
  config?: SecureConfig
): Promise<Result<{ count: number }, { res: Response; reason: string }>> {
  const uuid = crypto.randomUUID(); // Temporary, only for timing
  console.debug(`secure: ${uuid}`);

  if (!config) {
    config = {
      errorStatusCode: 403,
      errorBody: JSON.stringify({ error: "Unknown error" }),
      cacheDecisionFor: 10,
    };
  }

  if (!req) {
    console.error("secure: No request");
    return Result.err({
      res: new Response(JSON.stringify({ error: "Unknown error" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      reason: "No request",
    });
  }

  // Call req.ip() if it's defined
  const ip =
    process.env.NODE_ENV === "development"
      ? "127.0.0.1"
      : req.headers.get("x-forwarded-for");

  if (!ip) {
    console.error("secure: No IP");

    return Result.err({
      res: new Response(JSON.stringify({ error: "Unknown error" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      reason: "No IP",
    });
  }

  console.debug(`secure: ${uuid}: received request from IP address: ${ip}`);

  console.time(`secure: ${uuid}: fetch`);

  const decisionRes = await fetch("http://localhost:3001/api/decide", {
    method: "POST",
    body: JSON.stringify({ ip }),
    next: { revalidate: config.cacheDecisionFor }, // TODO: May be a NextJS specific extension - check
  });

  const decision = await decisionRes.json();

  console.debug(`secure: ${uuid}: decision: ${JSON.stringify(decision)}`);
  console.timeEnd(`secure: ${uuid}: fetch`);

  return Result.ok({
    count: 1,
  });
}
