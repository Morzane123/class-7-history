import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";
import { getUserByEmail, updateUser } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "请输入邮箱地址" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "如果该邮箱已注册，您将收到重置密码邮件" }
      );
    }

    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires,
    });

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      message: "如果该邮箱已注册，您将收到重置密码邮件",
    });
  } catch (error) {
    console.error("Request reset error:", error);
    return NextResponse.json(
      { error: "请求失败，请稍后重试" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "无效的请求" },
        { status: 400 }
      );
    }

    const db = (await import("@/lib/db")).getDb();
    const user = db.prepare(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime('now')"
    ).get(token);

    if (!user) {
      return NextResponse.json(
        { error: "重置链接已过期或无效" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    await updateUser((user as any).id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    return NextResponse.json({ message: "密码重置成功" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "重置失败，请稍后重试" },
      { status: 500 }
    );
  }
}
