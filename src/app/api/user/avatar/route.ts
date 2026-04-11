import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { compressImage } from "@/lib/imageCompress";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过10MB" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${user.id}-${Date.now()}`;

    const result = await compressImage(buffer, {
      maxWidth: 500,
      quality: 85,
      outputDir: uploadDir,
      filename,
    });

    const publicPath = `/api/files/avatars/${filename}.webp`;
    
    if (user.avatar && user.avatar.startsWith("/api/files/")) {
      const oldPath = join(process.cwd(), "uploads", user.avatar.replace("/api/files/", ""));
      try {
        await unlink(oldPath);
      } catch {}
    }
    
    await updateUser(user.id, { avatar: publicPath });

    return NextResponse.json({ 
      path: publicPath,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
