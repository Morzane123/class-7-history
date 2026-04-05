"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface Section {
  id: string;
  name: string;
  description: string | null;
}

interface SidebarProps {
  sections: Section[];
}

export default function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-12 h-[calc(100vh-48px)] bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {!collapsed && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              板块分类
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-app-gray transition-colors text-gray-500"
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            <svg
              className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <nav className="space-y-1">
          <Link
            href="/timeline"
            className={`flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === "/timeline"
                ? "bg-app-blue text-white"
                : "text-app-text hover:bg-app-gray"
            }`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {!collapsed && <span>全部事件</span>}
          </Link>
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/timeline?section=${section.id}`}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.includes(`section=${section.id}`)
                  ? "bg-app-blue text-white"
                  : "text-app-text hover:bg-app-gray"
              }`}
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {!collapsed && <span>{section.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            快捷操作
          </h2>
        )}
        <nav className="space-y-1">
          <Link
            href="/events/create"
            className="flex items-center px-4 py-2.5 rounded-lg text-sm text-app-text hover:bg-app-gray transition-colors"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!collapsed && <span>记录新事件</span>}
          </Link>
          <Link
            href="/search"
            className="flex items-center px-4 py-2.5 rounded-lg text-sm text-app-text hover:bg-app-gray transition-colors"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {!collapsed && <span>搜索</span>}
          </Link>
        </nav>
      </div>
    </aside>
  );
}
