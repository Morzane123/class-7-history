"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";

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

export default function CreateEventPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    section_id: "",
    title: "",
    content: "",
    event_date: "",
  });

  const [images, setImages] = useState<UploadedImage[]>([]);

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
        
        setSections(sectionsData.sections || []);
        if (sectionsData.sections?.length > 0) {
          setFormData((prev) => ({ ...prev, section_id: sectionsData.sections[0].id }));
        }
      })
      .catch(() => router.push("/auth/login"));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

      if (images.length > 0) {
        for (const image of images) {
          const imgFormData = new FormData();
          imgFormData.append("image", image.file);
          imgFormData.append("eventId", data.event.id);
          
          await fetch("/api/events/images", {
            method: "POST",
            body: imgFormData,
          });
        }
      }

      router.push(`/events/${data.event.id}`);
    } catch {
      setError("创建失败，请稍后重试");
      setLoading(false);
    }
  };

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
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "提交中..." : "提交"}
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
          </div>
        </main>
      </div>
    </div>
  );
}
