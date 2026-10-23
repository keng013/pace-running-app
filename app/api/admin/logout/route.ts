import { NextRequest, NextResponse } from "next/server";
import { adminCookieName } from "@/lib/admin-auth";
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.nextUrl.origin), 303);
  response.cookies.set(adminCookieName, "", { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/admin", maxAge: 0 });
  return response;
}
