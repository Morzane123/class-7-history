import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { checkAnswer } from "@/lib/questions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nickname, isClass7, className, questionId, answer } = body;

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    if (typeof isClass7 !== "boolean") {
      return NextResponse.json(
        { error: "请选择身份类型" },
        { status: 400 }
      );
    }

    if (isClass7) {
      if (!questionId || !answer) {
        return NextResponse.json(
          { error: "请回答验证问题" },
          { status: 400 }
        );
      }

      if (!checkAnswer(questionId, answer)) {
        return NextResponse.json(
          { error: "验证问题回答错误" },
          { status: 400 }
        );
      }
    } else {
      if (!className || className.trim() === "") {
        return NextResponse.json(
          { error: "请填写班级信息" },
          { status: 400 }
        );
      }
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
      is_class7: isClass7 ? 1 : 0,
      class_name: isClass7 ? undefined : className.trim(),
    });

    if (!isClass7) {
      const db = (await import("@/lib/db")).getDb();
      db.prepare("UPDATE users SET role = 0 WHERE id = ?").run(user.id);
    }

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
