"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少6位");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      setSuccess(true);
    } catch {
      setError("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl p-8 shadow-[rgba(0,0,0,0.08)_0px_2px_8px]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">注册成功</h2>
            <p className="text-[#6e6e73] mb-6">
              验证邮件已发送至 <span className="text-[#1d1d1f] font-medium">{email}</span>，请查收邮件完成验证
            </p>
            <Link
              href="/auth/login"
              className="btn-primary inline-flex"
            >
              前往登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/校徽.png" alt="校徽" className="h-16 w-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-semibold text-[#1d1d1f]">注册</h1>
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
                昵称
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-field"
                placeholder="请输入昵称"
                required
              />
            </div>

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
                placeholder="请输入密码（至少6位）"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="请再次输入密码"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? "注册中..." : "注册"}
          </button>

          <div className="mt-6 pt-6 border-t border-[#d2d2d7] text-center text-sm text-[#6e6e73]">
            已有账号？
            <Link href="/auth/login" className="text-[#0071e3] hover:underline ml-1">
              立即登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
