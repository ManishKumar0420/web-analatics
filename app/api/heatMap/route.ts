import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Events";

export interface ClickPoint {
  x: number;
  y: number;
  count: number;
}

export interface HeatmapMeta {
  page_url: string;
  total_clicks: number;
  viewport_width: number;
  viewport_height: number;
}

export interface HeatmapResponse {
  meta: HeatmapMeta;
  points: ClickPoint[];
}

// Grid resolution: bucket clicks into NxN cells for rendering
const GRID_COLS = 100; // percentage-based (0–100)
const GRID_ROWS = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page_url = searchParams.get("page_url");
  const from     = searchParams.get("from");   // optional ISO date filter
  const to       = searchParams.get("to");

  if (!page_url) {
    return NextResponse.json(
      { error: "page_url query param is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const match: Record<string, unknown> = {
      page_url,
      event_type: "click",
      x: { $exists: true, $ne: null },
      y: { $exists: true, $ne: null },
    };

    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to)   range.$lte = new Date(to);
      match.timestamp = range;
    }

    // Aggregate into grid buckets for the heatmap
    const buckets = await Event.aggregate([
      { $match: match },
      {
        $project: {
          // Round x/y to nearest grid cell
          cx: {
            $multiply: [
              { $round: [{ $divide: ["$x", GRID_COLS] }, 0] },
              GRID_COLS,
            ],
          },
          cy: {
            $multiply: [
              { $round: [{ $divide: ["$y", GRID_ROWS] }, 0] },
              GRID_ROWS,
            ],
          },
        },
      },
      {
        $group: {
          _id: { cx: "$cx", cy: "$cy" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          x: "$_id.cx",
          y: "$_id.cy",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total_clicks = buckets.reduce((s: number, b: ClickPoint) => s + b.count, 0);

    const response: HeatmapResponse = {
      meta: {
        page_url,
        total_clicks,
        viewport_width: GRID_COLS,
        viewport_height: GRID_ROWS,
      },
      points: buckets,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[GET /api/heatmap]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}