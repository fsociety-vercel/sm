import { Result } from "true-myth";

export interface SecureConfig {
  errorStatusCode?: number;
  errorBody?: string;
}

export async function secure(
  req: Request,
  res?: Response,
  config?: SecureConfig
): Promise<Result<{ count: number }, { res: Response; reason: string }>> {
  console.debug("secure: Inside secure function");

  if (!config) {
    config = {
      errorStatusCode: 403,
      errorBody: JSON.stringify({ error: "Unknown error" }),
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

  console.debug(`Received request from IP address: ${ip}`);

  return Result.ok({
    count: 1,
  });
}
