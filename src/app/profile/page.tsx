"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Avatar from "@/components/Avatar";

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  role: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setNickname(data.user.nickname);
          setAvatarPreview(data.user.avatar);
        } else {
          router.push("/auth/login");
        }
      })
      .catch(() => {
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("图片大小不能超过5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let avatarPath = user?.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const uploadRes = await fetch("/api/user/avatar", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          avatarPath = uploadData.path;
        } else {
          setMessage(uploadData.error || "上传失败");
          setSaving(false);
          return;
        }
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, avatar: avatarPath }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("保存成功");
        setUser(data.user);
      } else {
        setMessage(data.error || "保存失败");
      }
    } catch {
      setMessage("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-8">
            个人中心
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-[rgba(0,0,0,0.08)_0px_2px_8px]">
            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.includes("成功") ? "bg-green-50 text-green-600" : "bg-red-50 text-[#ff3b30]"
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar src={avatarPreview} alt={nickname} size="xl" />
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#0071e3] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0062cc] transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-[#6e6e73]">点击更换头像</p>
                  <p className="text-xs text-[#86868b] mt-1">支持 JPG、PNG，最大 5MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input-field bg-[#f5f5f7] text-[#6e6e73] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  权限等级
                </label>
                <input
                  type="text"
                  value={
                    user?.role === 3 ? "超级管理员" :
                    user?.role === 2 ? "管理员" : "普通用户"
                  }
                  disabled
                  className="input-field bg-[#f5f5f7] text-[#6e6e73] cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-8 bg-[#0071e3] text-white py-3 rounded-xl font-medium hover:bg-[#0062cc] transition-colors disabled:bg-[#d2d2d7] disabled:cursor-not-allowed"
            >
              {saving ? "保存中..." : "保存修改"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
