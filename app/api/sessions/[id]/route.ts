import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Events";

export interface SessionEvent {
  _id: string;
  event_type: string;
  page_url: string;
  timestamp: string;
  x?: number;
  y?: number;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "session id is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const events = await Event.find({ session_id: id })
      .sort({ timestamp: 1 })
      .select("-__v")
      .lean<SessionEvent[]>();

    if (!events.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ data: events }, { status: 200 });
  } catch (err) {
    console.error(`[GET /api/sessions/${id}]`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}