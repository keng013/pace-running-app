import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // No credentials are returned to the browser.
  const ready = Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
  return NextResponse.json({ ready }, { headers: { "Cache-Control": "no-store" } });
}
