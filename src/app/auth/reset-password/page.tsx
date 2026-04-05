"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setMode("reset");
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "请求失败");
      }
    } catch {
      setError("请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/auth/login");
      } else {
        setError(data.error || "重置失败");
      }
    } catch {
      setError("重置失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl p-8 shadow-card">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-app-text mb-2">邮件已发送</h2>
          <p className="text-gray-500 mb-6">
            如果该邮箱已注册，您将收到重置密码邮件
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-app-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-app-text mb-6 text-center">
          {mode === "request" ? "重置密码" : "设置新密码"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {mode === "request" ? (
          <form onSubmit={handleRequestReset}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-app-text mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
                placeholder="请输入注册邮箱"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-blue text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "发送中..." : "发送重置邮件"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app-text mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
                  placeholder="请输入新密码"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app-text mb-2">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-app-blue text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "重置中..." : "重置密码"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-app-blue hover:underline">
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-app-gray flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl p-8 shadow-card">
            <div className="w-16 h-16 border-4 border-app-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
