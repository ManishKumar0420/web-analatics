import { connectDB } from "@/lib/mongodb";
import Events from "@/models/Events";
import { NextRequest, NextResponse } from "next/server";
export async function OPTIONS() {

  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function GET() {
  return NextResponse.json({ message: "Analytics collector is running" });
}

export async function POST(request: NextRequest) {
   try {

    await connectDB();

    const body = await request.json();

    const event = await Events.create(body);

    return NextResponse.json({
      success: true,
      data: event,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );

  }
}
