import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/db";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const targetUser = await getUserById(id);

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (targetUser.role >= currentUser.role) {
      return NextResponse.json({ error: "无法修改同级或更高级用户" }, { status: 403 });
    }

    await updateUser(id, { role: body.role });

    return NextResponse.json({ message: "更新成功" });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
