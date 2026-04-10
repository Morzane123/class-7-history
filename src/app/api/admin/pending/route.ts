import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { approveUser, rejectUser, getPendingUsers } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const pendingUsers = await getPendingUsers();
    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error("Get pending users error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
