"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";

interface Section {
  id: string;
  name: string;
  description: string | null;
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
  progress?: number;
  status?: "pending" | "uploading" | "compressing" | "completed" | "error";
  message?: string;
}

const SMALL_VIDEO_THRESHOLD = 50 * 1024 * 1024;

export default function CreateEventPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<number | null>(null);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const [formData, setFormData] = useState({
    section_id: "",
    title: "",
    content: "",
    event_date: "",
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/sections").then((res) => res.json()),
      fetch("/api/auth/me").then((res) => res.json()),
    ])
      .then(([sectionsData, authData]) => {
        if (!authData.user) {
          router.push("/auth/login");
          return;
        }

        setUserRole(authData.user.role);

        if (authData.user.role < 1) {
          return;
        }

        setSections(sectionsData.sections || []);
        if (sectionsData.sections?.length > 0) {
          setFormData((prev) => ({ ...prev, section_id: sectionsData.sections[0].id }));
        }
      })
      .catch(() => router.push("/auth/login"));
  }, [router]);

  const uploadVideoWithProgress = async (
    video: UploadedVideo,
    eventId: string,
    videoId: string
  ): Promise<boolean> => {
    const videoFormData = new FormData();
    videoFormData.append("video", video.file);
    videoFormData.append("eventId", eventId);

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, status: "uploading" as const, message: "上传中..." } : v
      )
    );

    try {
      const videoRes = await fetch("/api/events/videos", {
        method: "POST",
        body: videoFormData,
      });

      const videoData = await videoRes.json();

      if (!videoRes.ok) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, status: "error" as const, message: videoData.error || "上传失败" }
              : v
          )
        );
        return false;
      }

      if (videoData.progressId) {
        const pollProgress = async () => {
          const progressRes = await fetch(
            `/api/events/videos/progress?id=${videoData.progressId}`
          );
          const progressData = await progressRes.json();

          if (progressData.progress) {
            setVideos((prev) =>
              prev.map((v) =>
                v.id === videoId
                  ? {
                      ...v,
                      status: progressData.progress.status,
                      progress: progressData.progress.progress,
                      message: progressData.progress.message,
                    }
                  : v
              )
            );

            if (
              progressData.progress.status === "compressing" ||
              progressData.progress.status === "uploading"
            ) {
              setTimeout(pollProgress, 500);
            } else if (progressData.progress.status === "completed") {
              setVideos((prev) =>
                prev.map((v) =>
                  v.id === videoId
                    ? { ...v, status: "completed" as const, message: "上传完成" }
                    : v
                )
              );
            } else if (progressData.progress.status === "error") {
              setVideos((prev) =>
                prev.map((v) =>
                  v.id === videoId
                    ? { ...v, status: "error" as const, message: progressData.progress.error || "上传失败" }
                    : v
                )
              );
            }
          }
        };

        pollProgress();
      } else {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, status: "completed" as const } : v
          )
        );
      }

      return true;
    } catch {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId ? { ...v, status: "error" as const, message: "上传失败" } : v
        )
      );
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploadingVideos(false);

    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "创建失败");
        setLoading(false);
        return;
      }

      const eventId = data.event.id;

      if (images.length > 0) {
        for (const image of images) {
          const imgFormData = new FormData();
          imgFormData.append("image", image.file);
          imgFormData.append("eventId", eventId);

          await fetch("/api/events/images", {
            method: "POST",
            body: imgFormData,
          });
        }
      }

      if (videos.length > 0) {
        setUploadingVideos(true);
        setLoading(false);

        const smallVideos = videos.filter((v) => v.size < SMALL_VIDEO_THRESHOLD);
        const largeVideos = videos.filter((v) => v.size >= SMALL_VIDEO_THRESHOLD);

        if (smallVideos.length > 0) {
          await Promise.all(
            smallVideos.map((video) => uploadVideoWithProgress(video, eventId, video.id))
          );
        }

        for (const video of largeVideos) {
          await uploadVideoWithProgress(video, eventId, video.id);
        }

        const checkAllCompleted = () => {
          const allCompleted = videos.every(
            (v) => v.status === "completed" || v.status === "error"
          );
          if (allCompleted) {
            setUploadingVideos(false);
            const hasError = videos.some((v) => v.status === "error");
            if (!hasError) {
              router.push(`/events/${eventId}`);
            }
          } else {
            setTimeout(checkAllCompleted, 500);
          }
        };

        setTimeout(checkAllCompleted, 500);
      } else {
        router.push(`/events/${eventId}`);
      }
    } catch {
      setError("创建失败，请稍后重试");
      setLoading(false);
      setUploadingVideos(false);
    }
  };

  if (userRole !== null && userRole < 1) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#ff3b30]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#ff3b30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">无权限</h2>
            <p className="text-[#6e6e73] mb-6">访客用户无权创建事件，只能发表评论</p>
            <button
              onClick={() => router.push("/timeline")}
              className="btn-primary"
            >
              返回时间线
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-0 md:ml-64 pt-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-8">
              记录新事件
            </h1>

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
                      上传图片
                    </label>
                    <ImageUploader images={images} setImages={setImages} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                      上传视频
                    </label>
                    <VideoUploader videos={videos} setVideos={setVideos} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || uploadingVideos}
                  className="btn-primary"
                >
                  {loading
                    ? "提交中..."
                    : uploadingVideos
                    ? "视频上传中..."
                    : "提交"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                  disabled={uploadingVideos}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
