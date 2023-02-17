import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { secure } from "secure-middleware";

export async function middleware(req: NextRequest) {
  console.log("middleware.ts:");

  const secureResponse = await secure(req);
  if (secureResponse.isErr) {
    console.error("middleware.ts:", secureResponse.error.reason);
    return secureResponse.error.res;
  } else {
    return NextResponse.next();
  }
}
