import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await getUserById(id);

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (targetUser.role >= currentUser.role) {
      return NextResponse.json({ error: "无法删除同级或更高级用户" }, { status: 403 });
    }

    const db = getDb();
    
    db.prepare("DELETE FROM comments WHERE user_id = ?").run(id);
    
    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
