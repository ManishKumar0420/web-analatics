import type { SessionSummary } from "@/app/api/sessions/route";
import type { SessionEvent } from "@/app/api/sessions/[id]/route";
import type { HeatmapResponse } from "@/app/api/heatMap/route";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${BASE}/api/sessions`, { next: { revalidate: 30 } });
  const json = await handleResponse<{ data: SessionSummary[] }>(res);
  return json.data;
}

export async function fetchSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  const res = await fetch(`${BASE}/api/sessions/${encodeURIComponent(sessionId)}`);
  const json = await handleResponse<{ data: SessionEvent[] }>(res);
  return json.data;
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export interface HeatmapParams {
  page_url: string;
  from?: string;
  to?: string;
}

export async function fetchHeatmap(params: HeatmapParams): Promise<HeatmapResponse> {
  const qs = new URLSearchParams({ page_url: params.page_url });
  if (params.from) qs.set("from", params.from);
  if (params.to)   qs.set("to",   params.to);

  const res = await fetch(`${BASE}/api/heatMap?${qs.toString()}`);
  return handleResponse<HeatmapResponse>(res);
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export interface PageEntry {
  page_url: string;
  click_count: number;
}

export async function fetchPages(): Promise<PageEntry[]> {
  const res = await fetch(`${BASE}/api/pages`);
  const json = await handleResponse<{ data: PageEntry[] }>(res);
  return json.data;
}