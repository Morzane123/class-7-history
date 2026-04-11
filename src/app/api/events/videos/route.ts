import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { compressVideo, getVideoMetadata } from "@/lib/videoCompress";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (user.role < 1) {
      return NextResponse.json({ error: "访客用户无权上传视频" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;
    const eventId = formData.get("eventId") as string;

    if (!file || !eventId) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "视频大小不能超过500MB" }, { status: 400 });
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "不支持的视频格式" }, { status: 400 });
    }

    const db = getDb();
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as { author_id: string } | undefined;
    
    if (!event) {
      return NextResponse.json({ error: "事件不存在" }, { status: 404 });
    }

    if (event.author_id !== user.id && user.role < 2) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const tempDir = join(process.cwd(), "uploads", "temp");
    await mkdir(tempDir, { recursive: true });

    const tempFilename = `${uuidv4()}_temp`;
    const tempPath = join(tempDir, tempFilename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempPath, buffer);

    const uploadDir = join(process.cwd(), "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });

    const filename = uuidv4();

    const result = await compressVideo(tempPath, {
      maxSizeMB: 50,
      outputDir: uploadDir,
      filename,
    });

    try {
      await unlink(tempPath);
    } catch {}

    const publicPath = `/api/files/videos/${filename}.mp4`;
    const videoId = uuidv4();

    const maxOrder = db.prepare("SELECT MAX(sort_order) as max_order FROM event_videos WHERE event_id = ?").get(eventId) as { max_order: number | null };
    const sortOrder = (maxOrder.max_order || 0) + 1;

    db.prepare("INSERT INTO event_videos (id, event_id, video_path, sort_order) VALUES (?, ?, ?, ?)").run(videoId, eventId, publicPath, sortOrder);

    return NextResponse.json({ 
      video: { 
        id: videoId, 
        video_path: publicPath, 
        event_id: eventId,
        sort_order: sortOrder,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        duration: result.duration,
      } 
    });
  } catch (error) {
    console.error("Upload video error:", error);
    return NextResponse.json({ error: "上传失败: " + (error instanceof Error ? error.message : "未知错误") }, { status: 500 });
  }
}
