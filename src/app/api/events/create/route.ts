import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createEvent, getSectionById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    if (user.role < 1) {
      return NextResponse.json(
        { error: "访客用户无权创建事件" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { section_id, title, content, event_date } = body;

    if (!section_id || !title || !content || !event_date) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    const section = await getSectionById(section_id);
    if (!section) {
      return NextResponse.json(
        { error: "板块不存在" },
        { status: 400 }
      );
    }

    const event = await createEvent({
      id: uuidv4(),
      section_id,
      title,
      content,
      event_date,
      author_id: user.id,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "创建事件失败" },
      { status: 500 }
    );
  }
}
