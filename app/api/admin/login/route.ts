import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminSession, adminCookieName, adminSessionSeconds } from "@/lib/admin-auth";
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const configured = !!process.env.ADMIN_PASSWORD && !!process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32;
  if (!configured || !verifyPassword(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=" + (configured ? "invalid" : "setup"), request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(adminCookieName, createAdminSession(), { httpOnly: true, secure: true, sameSite: "lax", path: "/admin", maxAge: adminSessionSeconds });
  return response;
}