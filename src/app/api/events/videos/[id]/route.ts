import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const video = db.prepare(`
      SELECT ev.*, e.author_id 
      FROM event_videos ev 
      JOIN events e ON ev.event_id = e.id 
      WHERE ev.id = ?
    `).get(id) as { video_path: string; author_id: string } | undefined;

    if (!video) {
      return NextResponse.json({ error: "视频不存在" }, { status: 404 });
    }

    if (video.author_id !== user.id && user.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const filePath = join(process.cwd(), video.video_path.replace("/api/files/", "uploads/"));
    try {
      await unlink(filePath);
    } catch {
      console.log("视频文件不存在或已删除");
    }

    db.prepare("DELETE FROM event_videos WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
