"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface User {
  id: string;
  nickname: string;
  avatar: string | null;
  role: number;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-black/80 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/校徽.png" alt="校徽" className="h-7 w-7 object-contain" />
          <span className="text-white text-sm font-medium">7班班史</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/timeline" className="text-white/80 text-xs hover:text-white transition-colors">
            时间线
          </Link>
          <Link href="/events" className="text-white/80 text-xs hover:text-white transition-colors">
            事件列表
          </Link>
          {user && user.role >= 2 && (
            <Link href="/admin" className="text-white/80 text-xs hover:text-white transition-colors">
              管理后台
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 text-white text-xs"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.nickname} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-app-blue flex items-center justify-center text-white text-xs">
                    {user.nickname.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline">{user.nickname}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-card py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-app-text hover:bg-app-gray"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-app-gray"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-white/80 text-xs hover:text-white transition-colors"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="bg-app-blue text-white text-xs px-4 py-1.5 rounded-full hover:bg-blue-600 transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
