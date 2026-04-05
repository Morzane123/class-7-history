"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("无效的验证链接");
      return;
    }

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage("邮箱验证成功");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("验证失败，请稍后重试");
      });
  }, [searchParams]);

  return (
    <div className="w-full max-w-md text-center">
      <div className="bg-white rounded-xl p-8 shadow-card">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-app-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">正在验证...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-app-text mb-2">验证成功</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block bg-app-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              前往登录
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-app-text mb-2">验证失败</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/auth/register"
              className="inline-block bg-app-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              重新注册
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-app-gray flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl p-8 shadow-card">
            <div className="w-16 h-16 border-4 border-app-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">正在验证...</p>
          </div>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
