import { NextRequest, NextResponse } from "next/server";
import { createSection, updateSection, deleteSection } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const section = await createSection(body);

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
