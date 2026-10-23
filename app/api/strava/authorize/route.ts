import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new NextResponse("Strava integration is not configured yet. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in Vercel.", { status: 503 });
  }
  const callback = new URL("/api/strava/callback", request.url);
  const state = randomBytes(24).toString("hex");
  const authorization = new URL("https://www.strava.com/oauth/authorize");
  authorization.searchParams.set("client_id", clientId);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("redirect_uri", callback.toString());
  authorization.searchParams.set("approval_prompt", "auto");
  authorization.searchParams.set("scope", "read,activity:read_all");
  authorization.searchParams.set("state", state);
  const response = NextResponse.redirect(authorization);
  response.cookies.set("pace_strava_oauth_state", state, { httpOnly: true, secure: callback.protocol === "https:", sameSite: "lax", path: "/api/strava", maxAge: 600 });
  return response;
}
