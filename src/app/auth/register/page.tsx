"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [identityType, setIdentityType] = useState<"class7" | "other" | null>(null);
  const [className, setClassName] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);

  useEffect(() => {
    if (identityType === "class7") {
      fetchQuestion();
    }
  }, [identityType]);

  const fetchQuestion = async () => {
    setAnswer("");
    setQuestionLoading(true);
    try {
      const res = await fetch("/api/questions/random");
      const data = await res.json();
      setQuestion(data.question);
    } catch {
      setError("获取验证问题失败");
    } finally {
      setQuestionLoading(false);
    }
  };

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

    if (!identityType) {
      setError("请选择身份类型");
      return;
    }

    if (identityType === "other" && !className.trim()) {
      setError("请填写班级信息");
      return;
    }

    if (identityType === "class7" && !answer.trim()) {
      setError("请回答验证问题");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          nickname,
          isClass7: identityType === "class7",
          className: identityType === "other" ? className : undefined,
          questionId: identityType === "class7" ? question?.id : undefined,
          answer: identityType === "class7" ? answer : undefined,
        }),
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex items-center justify-center px-4 py-8">
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
                身份选择
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIdentityType("class7")}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    identityType === "class7"
                      ? "bg-[#0071e3] text-white"
                      : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                  }`}
                >
                  我是七班的
                </button>
                <button
                  type="button"
                  onClick={() => setIdentityType("other")}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    identityType === "other"
                      ? "bg-[#0071e3] text-white"
                      : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                  }`}
                >
                  我是外班的
                </button>
              </div>
            </div>

            {identityType === "class7" && (
              <div className="p-4 bg-[#f5f5f7] rounded-xl">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  验证问题
                </label>
                {questionLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : question ? (
                  <>
                    <p className="text-sm text-[#1d1d1f] mb-3" dangerouslySetInnerHTML={{ __html: question.question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="input-field"
                      placeholder="请输入答案"
                      required
                    />
                    <button
                      type="button"
                      onClick={fetchQuestion}
                      className="text-xs text-[#0071e3] mt-2 hover:underline"
                    >
                      换一个问题
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-[#6e6e73]">加载问题失败</p>
                )}
              </div>
            )}

            {identityType === "other" && (
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  班级
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="input-field"
                  placeholder="请输入您的班级（如：高2027届1班）"
                  required
                />
                <p className="text-xs text-[#86868b] mt-1">外班用户只能发表评论</p>
              </div>
            )}

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
            disabled={loading || !identityType}
            className="btn-primary w-full mt-6 disabled:bg-[#d2d2d7] disabled:cursor-not-allowed"
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
