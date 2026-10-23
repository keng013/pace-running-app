import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const saved = request.cookies.get("pace_strava_oauth_state")?.value || "";
  const valid = !!state && state.length === saved.length && timingSafeEqual(Buffer.from(state), Buffer.from(saved));
  const destination = new URL("/", request.url);
  if (!valid) destination.searchParams.set("strava", "invalid_state");
  else if (url.searchParams.get("error")) destination.searchParams.set("strava", "denied");
  else if (!url.searchParams.get("code")) destination.searchParams.set("strava", "missing_code");
  else {
    // Deliberately do not exchange or persist tokens before a secure user/session
    // association and encrypted token storage are implemented.
    destination.searchParams.set("strava", "setup_pending");
  }
  const response = NextResponse.redirect(destination);
  response.cookies.set("pace_strava_oauth_state", "", { httpOnly: true, path: "/api/strava", maxAge: 0 });
  return response;
}
