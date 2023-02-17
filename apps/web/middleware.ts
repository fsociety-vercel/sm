import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { secure } from "secure-middleware";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  //console.log("middleware.ts: ", req.ip);

  const secureResponse = await secure(req);
  return NextResponse.next();
}
