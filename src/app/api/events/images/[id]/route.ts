import { NextRequest, NextResponse } from "next/server";
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
    
    const image = db.prepare(`
      SELECT ei.*, e.author_id 
      FROM event_images ei 
      JOIN events e ON ei.event_id = e.id 
      WHERE ei.id = ?
    `).get(id) as { event_id: string; author_id: string; image_path: string } | undefined;

    if (!image) {
      return NextResponse.json({ error: "图片不存在" }, { status: 404 });
    }

    if (image.author_id !== user.id && user.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    db.prepare("DELETE FROM event_images WHERE id = ?").run(id);

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Delete event image error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
