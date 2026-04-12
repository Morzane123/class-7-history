import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("section") || undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const { events, total } = await getEvents({
      sectionId,
      year,
      month,
      limit,
      offset,
    });

    return NextResponse.json({ events, total, limit, offset });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "获取事件列表失败" },
      { status: 500 }
    );
  }
}
