//@ts-ignore
//import wasm from "./wasm/pkg/wasm_bg.wasm?module";
//import * as wasm from "./wasm/pkg";
import { IncomingMessage, ServerResponse } from "http";
import { Result } from "true-myth";
import crypto from "crypto";

export interface SecureConfig {
  errorStatusCode?: number;
  errorBody?: string;
  cacheDecisionFor?: number;
}

/*async function decide(ip: string) {
  const { exports } = (await WebAssembly.instantiate(wasm)) as any;

  // Set up a place for a return value on the stack
  const retptr = exports.__wbindgen_add_to_stack_pointer(-16);

  exports.decide(ip, retptr);

  // Cast the shared memory buffer to 32 bit words to retrieve the
  // pointer to the returned string and the string's length
  const memoryWords = new Int32Array(exports.memory.buffer);

  const str = memoryWords[retptr / 4 + 0];
  const len = memoryWords[retptr / 4 + 1];

  // Cast the shared memory buffer to octets to convert to a
  // JavaScript string
  const memoryBytes = new Uint8Array(exports.memory.buffer);
  const strBytes = memoryBytes.subarray(str, str + len);

  const result = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true,
  }).decode(strBytes);

  // Clean up the stack and free the memory
  exports.__wbindgen_add_to_stack_pointer(16);
  exports.__wbindgen_free(str, len);

  return result;
}*/

export async function secure(
  req: Request | IncomingMessage,
  res?: Response | ServerResponse,
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

  if (req instanceof IncomingMessage) {
    // Get the IP address from the request
    ip = req.headers["x-forwarded-for"] as string | undefined;
  } else if (req instanceof Request) {
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
    process.env.DECISION_API || "http://localhost:3001/api/decide";

  const decisionRes = await fetch(decisionAPI, {
    method: "POST",
    body: JSON.stringify({ ip }),
    next: { revalidate: config.cacheDecisionFor }, // TODO: May be a NextJS specific extension - check
  });

  const decision = await decisionRes.json();

  console.debug(`secure: ${uuid}: decision: ${JSON.stringify(decision)}`);
  console.timeEnd(`secure: ${uuid}: fetch`);

  //console.time(`secure: ${uuid}: wasm`);
  //const decideRes = wasm.decide(ip);
  //console.log(decideRes);
  //console.timeEnd(`secure: ${uuid}: wasm`);

  return Result.ok({
    count: 1,
  });
}
