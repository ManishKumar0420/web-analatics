import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  fetchSessions,
  fetchSessionEvents,
  fetchHeatmap,
  fetchPages,
  type HeatmapParams,
} from "@/lib/api";
import type { SessionSummary } from "@/app/api/sessions/route";
import type { SessionEvent } from "@/app/api/sessions/[id]/route";
import type { HeatmapResponse } from "@/app/api/heatMap/route";
import type { PageEntry } from "@/lib/api";

// ─── Query key factory (centralised, type-safe) ───────────────────────────────

export const queryKeys = {
  sessions:       ["sessions"]                          as const,
  sessionEvents:  (id: string) => ["sessions", id]     as const,
  heatmap:        (p: HeatmapParams) => ["heatmap", p] as const,
  pages:          ["pages"]                             as const,
} as const;

// ─── Sessions list ────────────────────────────────────────────────────────────

export function useSessions(
  options?: Omit<UseQueryOptions<SessionSummary[]>, "queryKey" | "queryFn">
) {
  return useQuery<SessionSummary[]>({
    queryKey: queryKeys.sessions,
    queryFn:  fetchSessions,
    staleTime: 30_000,
    ...options,
  });
}

// ─── Single session events ────────────────────────────────────────────────────

export function useSessionEvents(
  sessionId: string | null,
  options?: Omit<UseQueryOptions<SessionEvent[]>, "queryKey" | "queryFn" | "enabled">
) {
  return useQuery<SessionEvent[]>({
    queryKey: queryKeys.sessionEvents(sessionId ?? ""),
    queryFn:  () => fetchSessionEvents(sessionId!),
    enabled:  !!sessionId,
    staleTime: 60_000,
    ...options,
  });
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export function useHeatmap(
  params: HeatmapParams | null,
  options?: Omit<UseQueryOptions<HeatmapResponse>, "queryKey" | "queryFn" | "enabled">
) {
  return useQuery<HeatmapResponse>({
    queryKey: queryKeys.heatmap(params ?? { page_url: "" }),
    queryFn:  () => fetchHeatmap(params!),
    enabled:  !!params?.page_url,
    staleTime: 60_000,
    ...options,
  });
}

// ─── Pages list ───────────────────────────────────────────────────────────────

export function usePages(
  options?: Omit<UseQueryOptions<PageEntry[]>, "queryKey" | "queryFn">
) {
  return useQuery<PageEntry[]>({
    queryKey: queryKeys.pages,
    queryFn:  fetchPages,
    staleTime: 60_000,
    ...options,
  });
}

// ─── Prefetch helpers (use in Server Components or route handlers) ─────────────

export function usePrefetchSessionEvents() {
  const qc = useQueryClient();
  return (sessionId: string) =>
    qc.prefetchQuery({
      queryKey: queryKeys.sessionEvents(sessionId),
      queryFn:  () => fetchSessionEvents(sessionId),
    });
}