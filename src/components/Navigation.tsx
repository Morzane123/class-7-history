"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Avatar from "./Avatar";

interface User {
  id: string;
  nickname: string;
  avatar: string | null;
  role: number;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <img src="/校徽.png" alt="校徽" className="h-7 w-7 object-contain" />
            <span className="text-white text-sm font-medium hidden sm:inline">7班班史</span>
          </Link>
        </div>

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
                <Avatar src={user.avatar} alt={user.nickname} size="sm" />
                <span className="hidden sm:inline">{user.nickname}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[#ff3b30] hover:bg-[#f5f5f7]"
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
                className="bg-[#0071e3] text-white text-xs px-4 py-1.5 rounded-full hover:bg-[#0062cc] transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/timeline"
              className="block text-white/80 text-sm hover:text-white py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              时间线
            </Link>
            <Link
              href="/events"
              className="block text-white/80 text-sm hover:text-white py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              事件列表
            </Link>
            {user && user.role >= 2 && (
              <Link
                href="/admin"
                className="block text-white/80 text-sm hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                管理后台
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
