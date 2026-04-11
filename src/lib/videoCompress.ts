import ffmpeg from "fluent-ffmpeg";
import { join } from "path";
import { mkdir, unlink, stat } from "fs/promises";

export interface VideoCompressResult {
  path: string;
  originalSize: number;
  compressedSize: number;
  duration: number;
}

export async function compressVideo(
  inputPath: string,
  options: {
    maxSizeMB?: number;
    outputDir: string;
    filename: string;
  }
): Promise<VideoCompressResult> {
  const { maxSizeMB = 50, outputDir, filename } = options;

  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${filename}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libx264")
      .size("1920x?")
      .outputOptions([
        "-crf 28",
        "-preset medium",
        "-movflags +faststart",
        "-maxrate 5M",
        "-bufsize 10M",
      ])
      .on("end", async () => {
        try {
          const inputStats = await stat(inputPath);
          const outputStats = await stat(outputPath);

          let finalPath = outputPath;
          let finalSize = outputStats.size;

          if (finalSize > maxSizeMB * 1024 * 1024) {
            const bitrate = Math.floor((maxSizeMB * 8 * 1024) / await getVideoDuration(inputPath));
            
            await unlink(outputPath);
            
            await new Promise<void>((res, rej) => {
              ffmpeg(inputPath)
                .output(outputPath)
                .videoCodec("libx264")
                .size("1280x?")
                .outputOptions([
                  `-b:v ${bitrate}k`,
                  "-preset medium",
                  "-movflags +faststart",
                ])
                .on("end", () => res())
                .on("error", rej)
                .run();
            });

            const newStats = await stat(outputPath);
            finalSize = newStats.size;
          }

          const duration = await getVideoDuration(outputPath);

          resolve({
            path: finalPath,
            originalSize: inputStats.size,
            compressedSize: finalSize,
            duration,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject)
      .run();
  });
}

async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
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
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
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
