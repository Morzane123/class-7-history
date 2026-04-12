"use client";

import { useState, useEffect } from "react";
import { LazyImage } from "@/components/LazyLoad";
import ImageViewer from "@/components/ImageViewer";

interface Event {
  id: string;
  title: string;
  images?: { id: string; image_path: string }[];
}

interface EventImagesProps {
  event: Event;
}

export default function EventImages({ event }: EventImagesProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(event.images || []);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过10MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("eventId", event.id);

    try {
      const res = await fetch("/api/events/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImages([...images, data.image]);
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("确定要删除这张图片吗？")) return;

    try {
      const res = await fetch(`/api/events/images/${imageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setImages(images.filter((img) => img.id !== imageId));
      }
    } catch {
      alert("删除失败");
    }
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  if (images.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">相关图片</h3>
          <label className="cursor-pointer px-4 py-2 bg-[#0071e3] text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? "上传中..." : "上传图片"}
          </label>
        </div>
        <p className="text-[#86868b] text-center py-8 bg-white/80 backdrop-blur-xl rounded-2xl">
          暂无图片
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f]">相关图片</h3>
        <label className="cursor-pointer px-4 py-2 bg-[#0071e3] text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? "上传中..." : "上传图片"}
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            <LazyImage
              src={image.image_path}
              alt=""
              className="rounded-lg w-full h-40 object-cover cursor-pointer"
              onClick={() => openViewer(index)}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image.id);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-[#ff3b30] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {viewerOpen && (
        <ImageViewer
          images={images}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
