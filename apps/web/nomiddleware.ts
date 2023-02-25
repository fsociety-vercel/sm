import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { secure } from "secure-middleware";

export async function middleware(req: NextRequest) {
  /*const uuid = crypto.randomUUID(); // Temporary, only for timing
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
  }*/
}
