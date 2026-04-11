import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { compressVideo, getVideoMetadata } from "@/lib/videoCompress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("[VideoUpload] Starting video upload...");
  
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("[VideoUpload] Error: User not logged in");
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (user.role < 1) {
      console.log("[VideoUpload] Error: Guest user cannot upload");
      return NextResponse.json({ error: "访客用户无权上传视频" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;
    const eventId = formData.get("eventId") as string;

    console.log(`[VideoUpload] File: ${file?.name}, Size: ${file?.size}, EventId: ${eventId}`);

    if (!file || !eventId) {
      console.log("[VideoUpload] Error: Missing file or eventId");
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    if (file.size > 500 * 1024 * 1024) {
      console.log(`[VideoUpload] Error: File too large (${file.size} bytes)`);
      return NextResponse.json({ error: "视频大小不能超过500MB" }, { status: 400 });
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      console.log(`[VideoUpload] Error: Invalid type ${file.type}`);
      return NextResponse.json({ error: "不支持的视频格式" }, { status: 400 });
    }

    const db = getDb();
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as { author_id: string } | undefined;
    
    if (!event) {
      console.log(`[VideoUpload] Error: Event ${eventId} not found`);
      return NextResponse.json({ error: "事件不存在" }, { status: 404 });
    }

    if (event.author_id !== user.id && user.role < 2) {
      console.log(`[VideoUpload] Error: No permission`);
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const tempDir = join(process.cwd(), "uploads", "temp");
    await mkdir(tempDir, { recursive: true });
    console.log(`[VideoUpload] Temp directory: ${tempDir}`);

    const tempFilename = `${uuidv4()}_temp`;
    const tempPath = join(tempDir, tempFilename);

    console.log(`[VideoUpload] Writing temp file: ${tempPath}`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempPath, buffer);
    console.log(`[VideoUpload] Temp file written, size: ${buffer.length} bytes`);

    const uploadDir = join(process.cwd(), "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });
    console.log(`[VideoUpload] Upload directory: ${uploadDir}`);

    const filename = uuidv4();

    console.log(`[VideoUpload] Starting compression...`);
    const result = await compressVideo(tempPath, {
      maxSizeMB: 50,
      outputDir: uploadDir,
      filename,
    });
    console.log(`[VideoUpload] Compression complete: ${result.compressedSize} bytes`);

    try {
      await unlink(tempPath);
      console.log(`[VideoUpload] Temp file deleted`);
    } catch (e) {
      console.log(`[VideoUpload] Failed to delete temp file:`, e);
    }

    const publicPath = `/api/files/videos/${filename}.mp4`;
    const videoId = uuidv4();

    const maxOrder = db.prepare("SELECT MAX(sort_order) as max_order FROM event_videos WHERE event_id = ?").get(eventId) as { max_order: number | null };
    const sortOrder = (maxOrder.max_order || 0) + 1;

    db.prepare("INSERT INTO event_videos (id, event_id, video_path, sort_order) VALUES (?, ?, ?, ?)").run(videoId, eventId, publicPath, sortOrder);
    console.log(`[VideoUpload] Database record created: ${videoId}`);

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
    console.error("[VideoUpload] Error:", error);
    return NextResponse.json({ 
      error: "上传失败: " + (error instanceof Error ? error.message : "未知错误") 
    }, { status: 500 });
  }
}
