"use client";

import { useRef, useState } from "react";

interface UploadedVideo {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  progress?: number;
  status?: "pending" | "uploading" | "compressing" | "completed" | "error";
  message?: string;
}

interface VideoUploaderProps {
  videos: UploadedVideo[];
  setVideos: React.Dispatch<React.SetStateAction<UploadedVideo[]>>;
}

export default function VideoUploader({ videos, setVideos }: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newVideos: UploadedVideo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("video/")) {
        newVideos.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          progress: 0,
          status: "pending",
        });
      }
    }

    setVideos((prev) => [...prev, ...newVideos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => {
      const video = prev.find((v) => v.id === id);
      if (video?.preview) {
        URL.revokeObjectURL(video.preview);
      }
      return prev.filter((v) => v.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver
            ? "border-[#0071e3] bg-[#0071e3]/5"
            : "border-[#d2d2d7] hover:border-[#0071e3]"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-[#86868b] mb-2">
          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          拖拽视频到此处或点击上传
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary text-sm"
        >
          选择视频
        </button>
        <p className="text-xs text-[#86868b] mt-2">
          支持 MP4、WebM、MOV、AVI 格式，单个视频最大 500MB
        </p>
      </div>

      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-3 bg-[#f5f5f7] rounded-xl"
            >
              <video
                src={video.preview}
                className="w-20 h-14 object-cover rounded-lg bg-black"
                muted
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1d1d1f] truncate">
                  {video.name}
                </div>
                <div className="text-xs text-[#86868b]">
                  {formatSize(video.size)}
                </div>
                {video.status === "compressing" && (
                  <div className="mt-1">
                    <div className="h-1.5 bg-[#d2d2d7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071e3] transition-all duration-300"
                        style={{ width: `${video.progress || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-[#86868b] mt-0.5">
                      {video.message || `压缩中... ${video.progress || 0}%`}
                    </div>
                  </div>
                )}
                {video.status === "completed" && (
                  <div className="text-xs text-green-600 mt-0.5">
                    ✓ 上传完成
                  </div>
                )}
                {video.status === "error" && (
                  <div className="text-xs text-red-500 mt-0.5">
                    {video.message || "上传失败"}
                  </div>
                )}
              </div>
              {video.status !== "uploading" && video.status !== "compressing" && (
                <button
                  type="button"
                  onClick={() => removeVideo(video.id)}
                  className="text-[#86868b] hover:text-[#ff3b30] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
