import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, updateUser } from "@/lib/db";
import { getCurrentUser, isSuperAdmin, canManageUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
