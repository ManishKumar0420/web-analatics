"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  useSessions,
  useSessionEvents,
  useHeatmap,
  usePages,
  usePrefetchSessionEvents,
} from "@/hooks/dashboardHooks";

// ─── Fonts + shimmer keyframe ─────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap');
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, #1e293b 25%, #263347 50%, #1e293b 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .font-mono-data { font-family: 'IBM Plex Mono', monospace; }
  .font-display   { font-family: 'Syne', sans-serif; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(s: number) {
  if (!s || s < 0) return "0s";
  const m = Math.floor(s / 60),
    sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

const EVENT_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  pageview: { bg: "#1a3a2a", text: "#4ade80", border: "#166534" },
  click: { bg: "#1e2a4a", text: "#60a5fa", border: "#1d4ed8" },
  scroll: { bg: "#2a2a1a", text: "#fbbf24", border: "#92400e" },
  input: { bg: "#2a1a2a", text: "#c084fc", border: "#7e22ce" },
  default: { bg: "#1e293b", text: "#94a3b8", border: "#334155" },
};

const EVENT_ICONS: Record<string, string> = {
  pageview: "◈",
  click: "⬡",
  scroll: "⇕",
  input: "✎",
};

function eventColors(type: string) {
  return EVENT_COLORS[type] ?? EVENT_COLORS.default;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({
  w = "100%",
  h = 16,
  r = 6,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) {
  return (
    <div className="shimmer" style={{ width: w, height: h, borderRadius: r }} />
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="font-mono-data mb-4 rounded-lg border border-red-900 bg-[#2a1a1a] px-4 py-3 text-[13px] text-red-300">
      ⚠ {message}
    </div>
  );
}

// ─── Sessions view ────────────────────────────────────────────────────────────

function SessionsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prefetch = usePrefetchSessionEvents();

  const { data: sessions, isLoading, error } = useSessions();
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useSessionEvents(selectedId);

  const totalEvents = useMemo(
    () => sessions?.reduce((s, sess) => s + sess.total_events, 0) ?? 0,
    [sessions],
  );

  return (
    <div className="flex gap-5">
      {/* ── Session list ─────────────────────────────────────────────── */}
      <div className="flex w-[420px] shrink-0 flex-col">
        {/* List header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono-data text-[11px] uppercase tracking-widest text-slate-500">
            {isLoading ? "loading…" : `${sessions?.length ?? 0} sessions`}
          </span>
          <span className="font-mono-data text-[11px] text-slate-500">
            {totalEvents} total events
          </span>
        </div>

        {error && <ErrorBanner message={(error as Error).message} />}

        {/* Skeleton rows */}
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="mb-0.5 flex items-center gap-3.5 rounded-lg border border-[#1e293b] bg-[#0d1117] px-4 py-3"
              >
                <Skeleton w={36} h={36} r={8} />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton w="60%" h={12} />
                  <Skeleton w="40%" h={10} />
                </div>
                <Skeleton w={32} h={20} />
              </div>
            ))
          : sessions?.map((s) => {
              const isActive = selectedId === s.session_id;
              return (
                <div
                  key={s.session_id}
                  onClick={() => setSelectedId(isActive ? null : s.session_id)}
                  onMouseEnter={() => prefetch(s.session_id)}
                  className={[
                    "mb-0.5 flex cursor-pointer items-center gap-3.5 rounded-lg border px-4 py-3 transition-colors duration-150",
                    isActive
                      ? "border-blue-700 bg-[#0f1a2e]"
                      : "border-[#1e293b] bg-[#0d1117] hover:border-slate-600",
                  ].join(" ")}
                >
                  {/* Avatar */}
                  <div
                    className={[
                      "font-mono-data flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] text-slate-500",
                      isActive ? "bg-[#1e3a5f]" : "bg-[#161d2b]",
                    ].join(" ")}
                  >
                    {s.session_id.slice(-4).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={[
                          "font-mono-data text-[12px]",
                          isActive ? "text-blue-400" : "text-slate-400",
                        ].join(" ")}
                      >
                        {s.session_id}
                      </span>
                      <span className="font-mono-data ml-auto text-[10px] text-slate-500">
                        {fmtTime(s.started_at)}
                      </span>
                    </div>
                    <div className="flex gap-1.5 text-[11px]">
                      <span className="text-slate-500">
                        {fmtDate(s.started_at)}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500">
                        {s.page_count} pages
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500">
                        {fmtDuration(s.duration_seconds)}
                      </span>
                    </div>
                  </div>

                  {/* Event count */}
                  <div className="shrink-0 text-right">
                    <div
                      className={[
                        "font-mono-data text-[18px] font-medium leading-none",
                        isActive ? "text-slate-100" : "text-slate-400",
                      ].join(" ")}
                    >
                      {s.total_events}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      events
                    </div>
                  </div>

                  {/* Active indicator dot */}
                  <div
                    className={[
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      isActive ? "bg-blue-500" : "bg-[#1e293b]",
                    ].join(" ")}
                  />
                </div>
              );
            })}
      </div>

      {/* ── Journey panel ────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {!selectedId ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-20">
            <div className="text-[40px] opacity-[0.15]">◈</div>
            <div className="text-center text-[13px] text-slate-700">
              Select a session to view
              <br />
              the user journey
            </div>
          </div>
        ) : (
          <>
            {eventsError && (
              <ErrorBanner message={(eventsError as Error).message} />
            )}

            {/* Session header */}
            <div className="mb-3.5 flex items-center gap-3.5 rounded-xl border border-[#1e293b] bg-[#0d1117] px-[18px] py-3.5">
              <div className="font-mono-data text-[13px] text-blue-400">
                {selectedId}
              </div>
              <div className="ml-auto flex gap-5">
                {eventsLoading
                  ? [80, 60, 50].map((w, i) => (
                      <Skeleton key={i} w={w} h={20} />
                    ))
                  : (
                      [
                        ["events", String(events?.length ?? 0)],
                        [
                          "duration",
                          fmtDuration(
                            sessions?.find((s) => s.session_id === selectedId)
                              ?.duration_seconds ?? 0,
                          ),
                        ],
                        [
                          "pages",
                          String(new Set(events?.map((e) => e.page_url)).size),
                        ],
                      ] as [string, string][]
                    ).map(([label, val]) => (
                      <div key={label} className="text-center">
                        <div className="font-mono-data text-[16px] font-medium text-slate-100">
                          {val}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {label}
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-5">
              {/* Vertical connector line */}
              <div
                className="absolute bottom-4 left-[27px] top-4 w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, #1e3a5f 0%, #1e293b 60%, transparent 100%)",
                }}
              />

              {eventsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="mb-2.5 flex gap-3.5">
                      <Skeleton w={16} h={16} r={4} />
                      <div className="flex flex-1 gap-3 rounded-lg border border-[#1e293b] bg-[#0d1117] px-3.5 py-2.5">
                        <Skeleton w={60} h={20} r={4} />
                        <Skeleton w="50%" h={14} />
                      </div>
                    </div>
                  ))
                : events?.map((ev) => {
                    const colors = eventColors(ev.event_type);
                    return (
                      <div
                        key={String(ev._id)}
                        className="relative mb-2.5 flex gap-3.5"
                      >
                        {/* Icon dot */}
                        <div
                          className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px]"
                          style={{
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                          }}
                        >
                          {EVENT_ICONS[ev.event_type] ?? "•"}
                        </div>

                        {/* Event card */}
                        <div className="flex flex-1 items-center gap-3 rounded-lg border border-[#1e293b] bg-[#0d1117] px-3.5 py-2.5">
                          {/* Type badge */}
                          <span
                            className="font-mono-data shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                            }}
                          >
                            {ev.event_type}
                          </span>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="font-mono-data truncate text-[12px] text-slate-400">
                              {ev.page_url}
                            </div>
                            {ev.x != null && ev.y != null && (
                              <div className="mt-0.5 text-[10px] text-slate-600">
                                x: {Math.round(ev.x)} · y: {Math.round(ev.y)}
                              </div>
                            )}
                          </div>

                          {/* Timestamp */}
                          <span className="font-mono-data shrink-0 text-[11px] text-slate-700">
                            {fmtTime(ev.timestamp as unknown as string)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Heatmap view ─────────────────────────────────────────────────────────────
function HeatmapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      setContainerSize({
        width: rect.width,
        height: rect.height,
      });
    }

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const { data: pages, isLoading: pagesLoading } = usePages();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    count: number;
    px: number;
    py: number;
  } | null>(null);

  const activePage = selectedPage ?? pages?.[0]?.page_url ?? null;

  const {
    data: heatmap,
    isLoading: heatmapLoading,
    error: heatmapError,
  } = useHeatmap(activePage ? { page_url: activePage } : null);

  const maxCount = useMemo(
    () => Math.max(...(heatmap?.points.map((p) => p.count) ?? [1])),
    [heatmap],
  );

  function dotColor(count: number) {
    const t = count / maxCount;
    if (t < 0.33) return `rgba(59,130,246,${(0.4 + t * 0.8).toFixed(2)})`;
    if (t < 0.66) return `rgba(251,191,36,${(0.5 + t * 0.5).toFixed(2)})`;
    return `rgba(239,68,68,${(0.6 + t * 0.4).toFixed(2)})`;
  }
const reversedPoints = heatmap?.points 
  ? [...heatmap.points].reverse() 
  : [];
  return (
    <div>
      {/* Page selector row */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="font-mono-data text-[11px] uppercase tracking-widest text-slate-500">
          Page URL
        </span>

        {pagesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} w={80} h={28} r={6} />
            ))
          : pages?.map((p) => (
              <button
                key={p.page_url}
                onClick={() => setSelectedPage(p.page_url)}
                className={[
                  "font-mono-data flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] transition-all duration-150",
                  activePage === p.page_url
                    ? "border-blue-700 bg-[#0f1a2e] text-blue-400"
                    : "border-[#1e293b] bg-transparent text-slate-500 hover:border-slate-600",
                ].join(" ")}
              >
                {p.page_url}
                <span
                  className={
                    activePage === p.page_url
                      ? "text-[10px] text-slate-700"
                      : "text-[10px] text-[#1e293b]"
                  }
                >
                  {p.click_count}
                </span>
              </button>
            ))}

        {/* Legend + total */}
        <div className="ml-auto flex items-center gap-2.5">
          {(
            [
              ["rgba(59,130,246,0.7)", "low"],
              ["rgba(251,191,36,0.8)", "med"],
              ["rgba(239,68,68,0.9)", "high"],
            ] as [string, string][]
          ).map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: c }} />
              <span className="text-[10px] text-slate-500">{l}</span>
            </div>
          ))}
          {heatmap && (
            <span className="font-mono-data ml-2 text-[11px] text-slate-700">
              {heatmap.meta.total_clicks} clicks
            </span>
          )}
        </div>
      </div>

      {heatmapError && (
        <ErrorBanner message={(heatmapError as Error).message} />
      )}

      {/* Browser shell */}
      <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0a0f1a]">
        {/* Chrome bar */}
        <div className="flex items-center gap-2.5 border-b border-[#1e293b] bg-[#0d1117] px-4 py-2.5">
          <div className="flex gap-1.5">
            {(["#ef4444", "#f59e0b", "#22c55e"] as const).map((c) => (
              <div
                key={c}
                className="h-2.5 w-2.5 rounded-full opacity-70"
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex flex-1 items-center rounded-md border border-[#1e293b] bg-[#0a0f1a] px-3 py-1">
            <span className="font-mono-data text-[11px] text-slate-500">
              {activePage ?? ""}
            </span>
          </div>
        </div>

        {/* Dot canvas */}
        <div ref={containerRef} className="relative h-[480px]">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(to right, #111827 1px, transparent 1px), linear-gradient(to bottom, #111827 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {heatmapLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono-data text-[12px] text-slate-700">
                loading heatmap…
              </span>
            </div>
          ) : (
            reversedPoints.map((pt, i) => {
              const normalizedX =
                (pt.x / window.innerWidth) * containerSize.width;

              const normalizedY =
                (pt.y / window.innerHeight) * containerSize.height;

              const intensity = pt.count / maxCount;

              const size = 8 + intensity * 20;

              const color = dotColor(pt.count);

              return (
                <div
                  key={i}
                  className=" absolute rounded-full transition-all duration-200 "
                  style={{
                    left: normalizedX,
                    top: normalizedY,
                    width: size,
                    height: size,
                    background: `radial-gradient(circle,${color} 0%,transparent 75%)`,
                    transform: "translate(-50%, -50%)",
                    filter: "blur(1px)",
                    opacity: 0.9,
                  }}
                  onMouseEnter={(e) =>
                    setTooltip({
                      x: Math.round(normalizedX),
                      y: Math.round(normalizedY),
                      count: pt.count,
                      px: e.clientX,
                      py: e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
          {/* Hover tooltip */}
          {tooltip && (
            <div
              className="font-mono-data pointer-events-none fixed z-[999] whitespace-nowrap rounded-md border border-slate-600 bg-[#0d1117] px-2.5 py-1.5 text-[11px] text-slate-400"
              style={{ left: tooltip.px + 12, top: tooltip.py - 30 }}
            >
              {tooltip.count} click{tooltip.count !== 1 ? "s" : ""} · (
              {tooltip.x}%, {tooltip.y}%)
            </div>
          )}
          {!heatmapLoading && !heatmap?.points.length && activePage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono-data text-[12px] text-slate-700">
                no click data for this page
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [tab, setTab] = useState<"sessions" | "heatmap">("sessions");
  const { data: sessions } = useSessions();

  const totalEvents = useMemo(
    () => sessions?.reduce((s, x) => s + x.total_events, 0) ?? 0,
    [sessions],
  );

  const avgDuration = useMemo(() => {
    if (!sessions?.length) return "—";
    return fmtDuration(
      Math.round(
        sessions.reduce((s, x) => s + x.duration_seconds, 0) / sessions.length,
      ),
    );
  }, [sessions]);

  const headerStats = [
    { label: "Sessions", val: sessions?.length ?? "—", color: "text-blue-400" },
    { label: "Total Events", val: totalEvents || "—", color: "text-green-400" },
    { label: "Avg Duration", val: avgDuration, color: "text-amber-400" },
  ];

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="font-display min-h-screen bg-[#060b14] px-8 py-7 text-slate-100">
        <div className="mx-auto max-w-[1200px]">
          {/* ── Header ── */}
          <div className="mb-7 flex items-end">
            <div>
              <div className="mb-1 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 text-sm">
                  ◈
                </div>
                <span className="text-[18px] font-semibold tracking-tight">
                  SessionLens
                </span>
              </div>
              <p className="font-mono-data text-[11px] text-slate-500">
                analytics · session replay · heatmaps
              </p>
            </div>

            <div className="ml-auto flex gap-6">
              {headerStats.map(({ label, val, color }) => (
                <div key={label} className="text-right">
                  <div
                    className={`font-mono-data text-[20px] font-medium ${color}`}
                  >
                    {val}
                  </div>
                  <div className="font-mono-data mt-0.5 text-[10px] text-slate-500">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main card ── */}
          <div className="rounded-[14px] border border-[#1e293b] bg-[#0d1117] p-6">
            {/* Tabs */}
            <div className="mb-6 flex gap-0.5 border-b border-[#1e293b]">
              {(["sessions", "heatmap"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{ background: "transparent" }}
                  className={[
                    "font-display -mb-px flex cursor-pointer items-center gap-1.5 border-b-2 px-5 py-2.5 text-[13px] font-medium capitalize transition-all duration-150",
                    tab === t
                      ? "border-blue-500 text-slate-100"
                      : "border-transparent text-slate-500 hover:text-slate-300",
                  ].join(" ")}
                >
                  <span
                    className={
                      tab === t
                        ? "text-[11px] text-blue-500"
                        : "text-[11px] text-slate-700"
                    }
                  >
                    {t === "sessions" ? "◉" : "⬡"}
                  </span>
                  {t}
                </button>
              ))}
            </div>

            {tab === "sessions" ? <SessionsView /> : <HeatmapView />}
          </div>
        </div>
      </div>
    </>
  );
}
