import { NextRequest, NextResponse } from "next/server";
import { getCommentsByEventId, createComment } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await getCommentsByEventId(id);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }

    const comment = await createComment({
      id: uuidv4(),
      event_id: eventId,
      user_id: user.id,
      parent_id: parentId || null,
      content: content.trim(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}
