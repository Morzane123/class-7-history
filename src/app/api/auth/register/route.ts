import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createUser, getUserByEmail } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "class-7-history-secret-key-2027";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nickname } = body;

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const verificationToken = uuidv4();

    const user = await createUser({
      id: uuidv4(),
      email,
      password: hashedPassword,
      nickname,
      verificationToken,
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "注册成功，请查收验证邮件" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
