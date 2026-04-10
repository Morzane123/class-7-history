import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rejectUser, getUserById } from "@/lib/db";
import { sendRejectionEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const success = await rejectUser(id);

    if (!success) {
      return NextResponse.json({ error: "拒绝失败" }, { status: 400 });
    }

    sendRejectionEmail(user.email, user.nickname).catch(console.error);

    return NextResponse.json({ message: "已拒绝" });
  } catch (error) {
    console.error("Reject user error:", error);
    return NextResponse.json({ error: "拒绝失败" }, { status: 500 });
  }
}
