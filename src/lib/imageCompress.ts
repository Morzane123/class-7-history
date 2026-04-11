import sharp from "sharp";
import { join } from "path";
import { mkdir, unlink } from "fs/promises";

export interface ImageCompressResult {
  path: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    quality?: number;
    outputDir: string;
    filename: string;
  }
): Promise<ImageCompressResult> {
  const { maxWidth = 1920, quality = 80, outputDir, filename } = options;

  await mkdir(outputDir, { recursive: true });

  const image = sharp(buffer);
  const metadata = await image.metadata();

  let resizeOptions: { width?: number } = {};
  if (metadata.width && metadata.width > maxWidth) {
    resizeOptions.width = maxWidth;
  }

  const outputPath = join(outputDir, `${filename}.webp`);

  const compressedBuffer = await image
    .resize(resizeOptions)
    .webp({ quality })
    .toBuffer();

  await sharp(compressedBuffer).toFile(outputPath);

  return {
    path: outputPath,
    originalSize: buffer.length,
    compressedSize: compressedBuffer.length,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

export async function compressAvatar(
  buffer: Buffer,
  options: {
    outputDir: string;
    filename: string;
  }
): Promise<ImageCompressResult> {
  const { outputDir, filename } = options;

  await mkdir(outputDir, { recursive: true });

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const size = Math.min(metadata.width || 200, metadata.height || 200, 200);

  const outputPath = join(outputDir, `${filename}.webp`);

  const compressedBuffer = await image
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  await sharp(compressedBuffer).toFile(outputPath);

  return {
    path: outputPath,
    originalSize: buffer.length,
    compressedSize: compressedBuffer.length,
    width: size,
    height: size,
  };
}
