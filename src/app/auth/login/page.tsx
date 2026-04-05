"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/校徽.png" alt="校徽" className="h-16 w-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-semibold text-[#1d1d1f]">登录</h1>
          <p className="text-[#6e6e73] mt-2">璧山中学高2027届7班班史系统</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-[rgba(0,0,0,0.08)_0px_2px_8px]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-[#ff3b30] text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <div className="mt-4 text-center text-sm text-[#6e6e73]">
            <Link href="/auth/reset-password" className="text-[#0071e3] hover:underline">
              忘记密码？
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[#d2d2d7] text-center text-sm text-[#6e6e73]">
            还没有账号？
            <Link href="/auth/register" className="text-[#0071e3] hover:underline ml-1">
              立即注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
