import { Result } from "true-myth";

export async function secure(
  req: Request,
  res?: Response
): Promise<Result<{ count: number }, { res: Response; reason: string }>> {
  console.debug("secure: Inside secure function");

  if (!res) {
    console.error("secure: Unknown IP Address");
    res = new Response(JSON.stringify({ error: "Unknown IP Address" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!req) {
    return Result.err({ res, reason: "No request" });
  }

  // Call req.ip() if it's defined
  const ip = req.headers.get("x-forwarded-for");

  if (!ip) {
    return Result.err({ res, reason: "No remote address" });
  }

  console.debug(`Received request from IP address: ${ip}`);

  return Result.ok({
    count: 1,
  });
}
