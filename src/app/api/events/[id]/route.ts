import { NextRequest, NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json(
        { error: "事件不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "获取事件详情失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json(
        { error: "事件不存在" },
        { status: 404 }
      );
    }

    if (event.author_id !== user.id && !isAdmin(user)) {
      return NextResponse.json(
        { error: "无权编辑此事件" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedEvent = await updateEvent(id, body);

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "更新事件失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json(
        { error: "事件不存在" },
        { status: 404 }
      );
    }

    if (event.author_id !== user.id && !isAdmin(user)) {
      return NextResponse.json(
        { error: "无权删除此事件" },
        { status: 403 }
      );
    }

    await deleteEvent(id);

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "删除事件失败" },
      { status: 500 }
    );
  }
}
