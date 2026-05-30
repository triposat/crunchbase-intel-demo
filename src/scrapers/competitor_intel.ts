// src/scrapers/competitor_intel.ts
// One MCP call per company on a watch-list; returns the typed signal fields a
// corp-dev / strategy team tracks. Field names verified live against web_data_crunchbase_company.
import { callMcpTool } from "@/lib/mcp-client";

export interface CompanySnapshot {
  name: string;
  num_employees: string;   // band, e.g. "5001-10000"
  cb_rank: number;         // Crunchbase rank (lower = more prominent)
  growth_score: number;    // 0-100
  heat_score: number;      // 0-100 momentum signal
  funds_raised: unknown[]; // array of funding/investment events
  ipo_status: string;      // "private" | "public" | ...
  region: string;
  url: string;
}

export type Alert =
  | { kind: "headcount_band"; from: string; to: string }
  | { kind: "new_funding_event"; count: number }
  | { kind: "growth_surge"; from: number; to: number };

export async function snapshotCompany(url: string): Promise<CompanySnapshot> {
  const row = await callMcpTool<Record<string, unknown>>("web_data_crunchbase_company", { url });
  return {
    name: String(row.name ?? ""),
    num_employees: String(row.num_employees ?? ""),
    cb_rank: Number(row.cb_rank ?? 0),
    growth_score: Number(row.growth_score ?? 0),
    heat_score: Number(row.heat_score ?? 0),
    funds_raised: Array.isArray(row.funds_raised) ? row.funds_raised : [],
    ipo_status: String(row.ipo_status ?? ""),
    region: String(row.region ?? ""),
    url,
  };
}

export async function snapshotWatchlist(urls: string[]): Promise<CompanySnapshot[]> {
  // errors are isolated per-company so one bad URL doesn't sink the batch
  const results = await Promise.allSettled(urls.map((u) => snapshotCompany(u)));
  return results.filter((r): r is PromiseFulfilledResult<CompanySnapshot> => r.status === "fulfilled").map((r) => r.value);
}

// Diff last run vs. this run; emit an Alert for any signal that moved.
// Store one snapshot per (company x week) and run detectMoves on consecutive pairs.
export function detectMoves(prev: CompanySnapshot, now: CompanySnapshot): Alert[] {
  const alerts: Alert[] = [];
  if (now.num_employees !== prev.num_employees) {
    alerts.push({ kind: "headcount_band", from: prev.num_employees, to: now.num_employees });
  }
  if (now.funds_raised.length !== prev.funds_raised.length) {
    alerts.push({ kind: "new_funding_event", count: now.funds_raised.length - prev.funds_raised.length });
  }
  if (now.growth_score - prev.growth_score >= 5) {
    alerts.push({ kind: "growth_surge", from: prev.growth_score, to: now.growth_score });
  }
  return alerts;
}
