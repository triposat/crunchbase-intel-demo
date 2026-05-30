# Competitive-intelligence monitor (Bright Data Web MCP demo)

A minimal, runnable Next.js app that tracks a watch-list of companies via Bright Data's
`web_data_crunchbase_company` Pro tool over the [Web MCP server](https://brightdata.com/ai/mcp-server).
It's the runnable version of **Use case 4** from the brightdata-scrape Kiro Power article.

One MCP call per company returns ~93 typed fields; the dashboard renders the signal fields a
corp-dev / strategy team tracks (employee band, cb_rank, growth/heat scores, IPO status, funding events).

## What's inside

| File | Role |
|------|------|
| `src/lib/mcp-client.ts` | Thin MCP **Streamable HTTP** client (`callMcpTool`): `initialize` → session header → `notifications/initialized` → `tools/call`, with SSE parsing. The same client works for any `web_data_*` tool. |
| `src/scrapers/competitor_intel.ts` | `snapshotCompany` / `snapshotWatchlist` + `detectMoves` (week-over-week diff → alerts). |
| `src/app/api/competitors/route.ts` | API route; calls the watch-list live. |
| `src/app/page.tsx` | Dashboard that fetches the route on mount. |

## Prerequisites

- A **Bright Data** account with **Pro mode** ([pricing](https://brightdata.com/pricing/mcp-server)) — `web_data_*` tools are **not** in the free tier.
- Node 20+.

## Run it

```bash
npm install
cp .env.example .env.local      # then paste your token
npm run dev                     # http://localhost:3000
```

`.env.local`:

```bash
BRIGHTDATA_API_KEY=your-token-here   # from brightdata.com/cp/setting/users
```

The MCP URL hardcodes `&pro=1` (in `src/lib/mcp-client.ts`) — that's what exposes the Pro `web_data_*` tools.
A live Crunchbase scrape takes ~30–90s; the dashboard shows "Scraping live…" until it returns.

## Notes

- **Don't commit your token.** `.env*` is gitignored.
- Crunchbase is licensed data — confirm your use complies with its terms; prefer the official API where budget allows.
- `detectMoves` is a pure function: store one snapshot per (company × week) and diff consecutive runs to alert on funding events, headcount-band crossings, or growth-score surges.
