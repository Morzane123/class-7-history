import { NextRequest, NextResponse } from "next/server";
import { deleteComment } from "@/lib/db";
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
    const success = await deleteComment(id, user.id);

    if (!success) {
      return NextResponse.json({ error: "无法删除此评论" }, { status: 403 });
    }

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
