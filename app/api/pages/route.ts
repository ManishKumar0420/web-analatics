import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Events";

export async function GET() {
  try {
    await connectDB();

    const pages: string[] = await Event.distinct("page_url");

    // Sort alphabetically and return with click counts
    const withCounts = await Event.aggregate([
      { $match: { event_type: "click" } },
      { $group: { _id: "$page_url", click_count: { $sum: 1 } } },
      { $project: { _id: 0, page_url: "$_id", click_count: 1 } },
      { $sort: { click_count: -1 } },
    ]);

    // Pages that exist but have no clicks still appear (click_count: 0)
    const clickMap = new Map(
      withCounts.map((p: any) => [p.page_url, p.click_count]),
    );
    const allPages = pages
      .map((url) => ({
        page_url: url,
        click_count: clickMap.get(url) ?? 0,
      }))
      .sort((a, b) => b.click_count - a.click_count);

    return NextResponse.json({ data: allPages }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/pages]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
