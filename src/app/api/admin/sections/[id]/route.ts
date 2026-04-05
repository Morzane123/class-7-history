import { NextRequest, NextResponse } from "next/server";
import { updateSection, deleteSection } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const section = await updateSection(id, body);

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    await deleteSection(id);

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
