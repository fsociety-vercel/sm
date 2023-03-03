import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as wasm from "./wasm/pkg";
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

  if (!req.headers) {
    console.error("secure: No headers");
    return Result.err({
      res: new Response(JSON.stringify({ error: "Unknown error" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      reason: "No headers",
    });
  }

  let ip: string | undefined;

  if (req instanceof Request) {
    // Get the IP address from the request
    ip = req.headers.get("x-forwarded-for") as string | undefined;
  }

  if (process.env.NODE_ENV === "development") {
    ip = "127.0.0.1";
  }

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

  const decisionAPI =
    process.env.DECISION_API || "https://sm-decide.vercel.app/api/decide";

  await fetch('https://example.vercel.sh');
  const beforeFetch = Date.now();
  console.log("before fetch", beforeFetch);
  performance.mark('beforeFetch');
  const decisionRes = await fetch(decisionAPI, {
    method: "POST",
    body: JSON.stringify({ ip }),
    next: { revalidate: config.cacheDecisionFor }, // TODO: May be a NextJS specific extension - check
  });
  performance.mark('afterFetch');
  performance.measure('justFetch', 'beforeFetch', 'afterFetch');

  const afterFetch = Date.now();
  console.log("after fetch", afterFetch);

  const decision = await decisionRes.json();
  const afterJson = Date.now();
  console.log("after json", afterJson, {
    fetch: afterFetch - beforeFetch,
    json: afterJson - afterFetch,
  });

  console.debug(`secure: ${uuid}: decision: ${JSON.stringify(decision)}`);
  console.timeEnd(`secure: ${uuid}: fetch`);

  console.time(`secure: ${uuid}: wasm`);
  const decideRes = await wasm.decide();
  console.debug(`secure: ${uuid}: wasm: ${decideRes}`);
  console.timeEnd(`secure: ${uuid}: wasm`);

  return Result.ok({
    count: 1,
  });
}

export async function middleware(req: NextRequest) {
  console.log("Initial ts", Date.now());
  const uuid = crypto.randomUUID(); // Temporary, only for timing
  console.debug(`middleware: ${uuid} start`);
  console.time(`middleware: ${uuid}`);

  const secureResponse = await secure(req);
  if (secureResponse.isErr) {
    console.error(`middleware: ${uuid}: error: ${secureResponse.error.reason}`);
    console.timeEnd(`middleware: ${uuid}`);
    console.debug(`middleware: ${uuid} finish`);
    return secureResponse.error.res;
  } else {
    console.timeEnd(`middleware: ${uuid}`);
    console.debug(`middleware: ${uuid} finish`);
    return NextResponse.next();
  }
}
