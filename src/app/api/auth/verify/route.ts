import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "无效的验证链接" },
        { status: 400 }
      );
    }

    const success = await verifyEmail(token);
    if (!success) {
      return NextResponse.json(
        { error: "验证链接已过期或无效" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "邮箱验证成功" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "验证失败，请稍后重试" },
      { status: 500 }
    );
  }
}
