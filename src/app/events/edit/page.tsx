"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "../create/RichTextEditor";
import ImageUploader from "../create/ImageUploader";
import VideoUploader from "../create/VideoUploader";

interface Section {
  id: string;
  name: string;
  description: string | null;
}

interface Event {
  id: string;
  section_id: string;
  title: string;
  content: string;
  event_date: string;
  images?: { id: string; image_path: string }[];
  videos?: { id: string; video_path: string }[];
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface UploadedVideo {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

function EditEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState<{ id: string; image_path: string }[]>([]);
  const [existingVideos, setExistingVideos] = useState<{ id: string; video_path: string }[]>([]);

  const [formData, setFormData] = useState({
    section_id: "",
    title: "",
    content: "",
    event_date: "",
  });

  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [newVideos, setNewVideos] = useState<UploadedVideo[]>([]);

  useEffect(() => {
    if (!eventId) {
      router.push("/events");
      return;
    }

    Promise.all([
      fetch("/api/sections").then((res) => res.json()),
      fetch("/api/auth/me").then((res) => res.json()),
      fetch(`/api/events/${eventId}`).then((res) => res.json()),
    ])
      .then(([sectionsData, authData, eventData]) => {
        if (!authData.user) {
          router.push("/auth/login");
          return;
        }
        
        setSections(sectionsData.sections || []);
        
        if (eventData && eventData.event) {
          const event = eventData.event;
          setFormData({
            section_id: event.section_id,
            title: event.title,
            content: event.content,
            event_date: event.event_date.split("T")[0],
          });
          setExistingImages(event.images || []);
          setExistingVideos(event.videos || []);
        }
      })
      .catch(() => router.push("/events"))
      .finally(() => setLoading(false));
  }, [router, eventId]);

  const handleDeleteExistingImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/events/images/${imageId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setExistingImages(existingImages.filter((img) => img.id !== imageId));
      }
    } catch {
      alert("删除图片失败");
    }
  };

  const handleDeleteExistingVideo = async (videoId: string) => {
    try {
      const res = await fetch(`/api/events/videos/${videoId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setExistingVideos(existingVideos.filter((vid) => vid.id !== videoId));
      }
    } catch {
      alert("删除视频失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "更新失败");
        setSaving(false);
        return;
      }

      for (const image of newImages) {
        const imgFormData = new FormData();
        imgFormData.append("image", image.file);
        imgFormData.append("eventId", eventId!);
        
        await fetch("/api/events/images", {
          method: "POST",
          body: imgFormData,
        });
      }

      for (const video of newVideos) {
        const videoFormData = new FormData();
        videoFormData.append("video", video.file);
        videoFormData.append("eventId", eventId!);
        
        await fetch("/api/events/videos", {
          method: "POST",
          body: videoFormData,
        });
      }

      router.push(`/events/${eventId}`);
    } catch {
      setError("更新失败，请稍后重试");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-[#ff3b30] rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              所属板块
            </label>
            <select
              value={formData.section_id}
              onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
              className="input-field"
              required
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              事件名称
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="请输入事件名称"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              事件发生时间
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              事件内容
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="请详细描述事件内容..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              已有图片
            </label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_path}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(image.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-[#ff3b30] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#86868b] text-sm mb-4">暂无图片</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              添加新图片
            </label>
            <ImageUploader images={newImages} setImages={setNewImages} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              已有视频
            </label>
            {existingVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {existingVideos.map((video) => (
                  <div key={video.id} className="relative group bg-[#f5f5f7] rounded-xl overflow-hidden">
                    <video
                      src={video.video_path}
                      className="w-full h-32 object-cover"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingVideo(video.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-[#ff3b30] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#86868b] text-sm mb-4">暂无视频</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
              添加新视频
            </label>
            <VideoUploader videos={newVideos} setVideos={setNewVideos} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "保存中..." : "保存修改"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          取消
        </button>
      </div>
    </form>
  );
}

export default function EditEventPage() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-0 md:ml-64 pt-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-8">
              编辑事件
            </h1>

            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <EditEventContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
