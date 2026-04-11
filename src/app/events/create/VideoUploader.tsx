"use client";

import { useRef } from "react";

interface UploadedVideo {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

interface VideoUploaderProps {
  videos: UploadedVideo[];
  setVideos: (videos: UploadedVideo[]) => void;
}

export default function VideoUploader({ videos, setVideos }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newVideos: UploadedVideo[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("video/")) {
        newVideos.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      }
    });

    setVideos([...videos, ...newVideos]);
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    const video = videos.find((v) => v.id === id);
    if (video) {
      URL.revokeObjectURL(video.preview);
    }
    setVideos(videos.filter((v) => v.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      <div
        onClick={handleSelect}
        className="border-2 border-dashed border-[#d2d2d7] rounded-xl p-8 text-center cursor-pointer hover:border-[#0071e3] hover:bg-[#f5f5f7]/50 transition-colors"
      >
        <svg className="w-12 h-12 text-[#86868b] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-[#6e6e73] mb-2">点击或拖拽上传视频</p>
        <p className="text-xs text-[#86868b]">支持 MP4、WebM、MOV 格式，单个文件最大 500MB</p>
      </div>

      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative bg-[#f5f5f7] rounded-xl overflow-hidden group"
            >
              <video
                src={video.preview}
                className="w-full h-32 object-cover"
                muted
              />
              <div className="p-3">
                <p className="text-sm text-[#1d1d1f] truncate">{video.name}</p>
                <p className="text-xs text-[#6e6e73]">{formatSize(video.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(video.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-[#ff3b30] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
