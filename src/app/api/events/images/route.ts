import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const eventId = formData.get("eventId") as string;

    if (!file || !eventId) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "图片大小不能超过5MB" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "不支持的图片格式" }, { status: 400 });
    }

    const db = getDb();
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as { author_id: string } | undefined;
    
    if (!event) {
      return NextResponse.json({ error: "事件不存在" }, { status: 404 });
    }

    if (event.author_id !== user.id && user.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "uploads", "events");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${uuidv4()}.${file.name.split(".").pop()}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const publicPath = `/api/files/events/${fileName}`;
    const imageId = uuidv4();

    const maxOrder = db.prepare("SELECT MAX(sort_order) as max_order FROM event_images WHERE event_id = ?").get(eventId) as { max_order: number | null };
    const sortOrder = (maxOrder.max_order || 0) + 1;

    db.prepare("INSERT INTO event_images (id, event_id, image_path, sort_order) VALUES (?, ?, ?, ?)").run(imageId, eventId, publicPath, sortOrder);

    return NextResponse.json({ 
      image: { 
        id: imageId, 
        image_path: publicPath, 
        event_id: eventId,
        sort_order: sortOrder 
      } 
    });
  } catch (error) {
    console.error("Upload event image error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
