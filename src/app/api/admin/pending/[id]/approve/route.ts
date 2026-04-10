import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { approveUser } from "@/lib/db";

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
    const success = await approveUser(id);

    if (!success) {
      return NextResponse.json({ error: "审核失败" }, { status: 400 });
    }

    return NextResponse.json({ message: "审核通过" });
  } catch (error) {
    console.error("Approve user error:", error);
    return NextResponse.json({ error: "审核失败" }, { status: 500 });
  }
}
