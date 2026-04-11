import ffmpeg from "fluent-ffmpeg";
import { join } from "path";
import { mkdir, unlink, stat } from "fs/promises";

const ffmpegPath = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
const ffprobePath = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export interface VideoCompressResult {
  path: string;
  originalSize: number;
  compressedSize: number;
  duration: number;
}

export interface ProgressCallback {
  (progress: number, status: string): void;
}

export async function compressVideo(
  inputPath: string,
  options: {
    maxSizeMB?: number;
    outputDir: string;
    filename: string;
    onProgress?: ProgressCallback;
  }
): Promise<VideoCompressResult> {
  const { maxSizeMB = 50, outputDir, filename, onProgress } = options;

  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${filename}.mp4`);

  console.log(`[VideoCompress] Starting compression: ${inputPath} -> ${outputPath}`);
  onProgress?.(0, "开始压缩...");

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setFfmpegPath(ffmpegPath)
      .setFfprobePath(ffprobePath)
      .output(outputPath)
      .videoCodec("libx264")
      .videoFilters("scale=1280:-2")
      .outputOptions([
        "-crf 32",
        "-preset veryfast",
        "-movflags +faststart",
        "-maxrate 3M",
        "-bufsize 6M",
      ])
      .on("start", (commandLine) => {
        console.log(`[VideoCompress] FFmpeg command: ${commandLine}`);
        onProgress?.(5, "开始编码...");
      })
      .on("progress", (progress) => {
        if (progress.percent) {
          const percent = Math.min(Math.round(progress.percent), 95);
          console.log(`[VideoCompress] Progress: ${percent}%`);
          onProgress?.(percent, `压缩中... ${percent}%`);
        }
      })
      .on("end", async () => {
        try {
          console.log(`[VideoCompress] Compression finished, checking file size...`);
          onProgress?.(96, "检查文件大小...");
          
          const inputStats = await stat(inputPath);
          const outputStats = await stat(outputPath);

          let finalPath = outputPath;
          let finalSize = outputStats.size;

          if (finalSize > maxSizeMB * 1024 * 1024) {
            console.log(`[VideoCompress] File too large (${(finalSize / 1024 / 1024).toFixed(2)}MB), re-encoding...`);
            onProgress?.(97, "文件过大，重新编码...");
            
            const duration = await getVideoDuration(inputPath);
            const bitrate = Math.floor((maxSizeMB * 8 * 1024) / duration);
            
            await unlink(outputPath);
            
            await new Promise<void>((res, rej) => {
              ffmpeg(inputPath)
                .setFfmpegPath(ffmpegPath)
                .setFfprobePath(ffprobePath)
                .output(outputPath)
                .videoCodec("libx264")
                .videoFilters("scale=854:-2")
                .outputOptions([
                  `-b:v ${bitrate}k`,
                  "-preset veryfast",
                  "-movflags +faststart",
                ])
                .on("end", () => {
                  console.log(`[VideoCompress] Re-encoding finished`);
                  res();
                })
                .on("error", (err) => {
                  console.error(`[VideoCompress] Re-encoding error:`, err);
                  rej(err);
                })
                .run();
            });

            const newStats = await stat(outputPath);
            finalSize = newStats.size;
          }

          const duration = await getVideoDuration(outputPath);

          console.log(`[VideoCompress] Success! Original: ${(inputStats.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(finalSize / 1024 / 1024).toFixed(2)}MB`);
          onProgress?.(100, "压缩完成");

          resolve({
            path: finalPath,
            originalSize: inputStats.size,
            compressedSize: finalSize,
            duration,
          });
        } catch (error) {
          console.error(`[VideoCompress] Post-processing error:`, error);
          reject(error);
        }
      })
      .on("error", (err) => {
        console.error(`[VideoCompress] FFmpeg error:`, err);
        reject(err);
      })
      .run();
  });
}

async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfprobePath(ffprobePath);
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error(`[VideoCompress] FFprobe error:`, err);
        reject(err);
      }
      else resolve(metadata.format.duration || 1);
    });
  });
}

export async function getVideoMetadata(videoPath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfprobePath(ffprobePath);
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error(`[VideoCompress] FFprobe metadata error:`, err);
        reject(err);
      }
      else {
        const videoStream = metadata.streams.find((s) => s.codec_type === "video");
        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          size: metadata.format.size || 0,
        });
      }
    });
  });
}
