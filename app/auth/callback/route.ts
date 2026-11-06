import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const safeNext = request.nextUrl.searchParams.get("next") || "/?tab=profile";
  const next = safeNext.startsWith("/") && !safeNext.startsWith("//") && !safeNext.includes("\\") ? safeNext : "/?tab=profile";
  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL("/login?error=callback", request.url));
}
