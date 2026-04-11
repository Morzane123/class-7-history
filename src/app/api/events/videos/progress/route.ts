import { NextRequest, NextResponse } from "next/server";
import { getProgress } from "@/lib/progressStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少进度ID" }, { status: 400 });
  }

  const progress = getProgress(id);

  if (!progress) {
    return NextResponse.json({ error: "进度不存在" }, { status: 404 });
  }

  return NextResponse.json({ progress });
}
