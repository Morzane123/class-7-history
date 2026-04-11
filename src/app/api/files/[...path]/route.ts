import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = join(process.cwd(), "uploads", ...pathSegments);

    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    const ext = pathSegments[pathSegments.length - 1].split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
    };

    const contentType = contentTypes[ext || ""] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }
}
