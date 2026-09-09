import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !verifySessionToken(token, secret)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/surveys/:path*"],
  runtime: "nodejs",
};
