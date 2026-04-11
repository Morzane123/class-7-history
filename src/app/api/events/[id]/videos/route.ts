import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const videos = db.prepare("SELECT * FROM event_videos WHERE event_id = ? ORDER BY sort_order ASC").all(id);
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
