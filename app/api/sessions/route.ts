import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Events";

export interface SessionSummary {
  session_id: string;
  total_events: number;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  page_count: number;
  pages: string[];
  event_types: Record<string, number>;
}

export async function GET() {
  try {
    await connectDB();

    const sessions: SessionSummary[] = await Event.aggregate([
      {
        $sort: { timestamp: 1 },
      },
      {
        $group: {
          _id: "$session_id",
          total_events:  { $sum: 1 },
          started_at:    { $min: "$timestamp" },
          ended_at:      { $max: "$timestamp" },
          pages:         { $addToSet: "$page_url" },
          event_types_arr: { $push: "$event_type" },
        },
      },
      {
        $addFields: {
          duration_seconds: {
            $divide: [
              { $subtract: ["$ended_at", "$started_at"] },
              1000,
            ],
          },
          page_count: { $size: "$pages" },
        },
      },
      {
        $sort: { started_at: -1 },
      },
      {
        $project: {
          _id: 0,
          session_id:       "$_id",
          total_events:     1,
          started_at:       1,
          ended_at:         1,
          duration_seconds: { $round: ["$duration_seconds", 0] },
          page_count:       1,
          pages:            1,
          event_types_arr:  1,
        },
      },
    ]);

    // Convert event_types array → frequency map in JS (avoids complex $reduce)
    const withFrequency = sessions.map((s: any) => {
      const freq: Record<string, number> = {};
      for (const et of s.event_types_arr as string[]) {
        freq[et] = (freq[et] ?? 0) + 1;
      }
      const { event_types_arr, ...rest } = s;
      return { ...rest, event_types: freq } as SessionSummary;
    });

    return NextResponse.json({ data: withFrequency }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}