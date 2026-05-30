// src/app/api/competitors/route.ts
import { NextResponse } from "next/server";
import { snapshotWatchlist } from "@/scrapers/competitor_intel";

export const dynamic = "force-dynamic"; // always hit the live MCP, never cache

const WATCHLIST = [
  "https://www.crunchbase.com/organization/stripe",
];

export async function GET() {
  try {
    const companies = await snapshotWatchlist(WATCHLIST);
    return NextResponse.json({ companies, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
