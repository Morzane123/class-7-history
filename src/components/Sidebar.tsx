"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="fixed left-0 top-12 w-64 h-[calc(100vh-48px)] bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          板块分类
        </h2>
        <nav className="space-y-1">
          <Link
            href="/timeline"
            className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === "/timeline"
                ? "bg-app-blue text-white"
                : "text-app-text hover:bg-app-gray"
            }`}
          >
            全部事件
          </Link>
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/timeline?section=${section.id}`}
              className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.includes(`section=${section.id}`)
                  ? "bg-app-blue text-white"
                  : "text-app-text hover:bg-app-gray"
              }`}
            >
              {section.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          快捷操作
        </h2>
        <nav className="space-y-1">
          <Link
            href="/events/create"
            className="block px-4 py-2.5 rounded-lg text-sm text-app-text hover:bg-app-gray transition-colors"
          >
            记录新事件
          </Link>
          <Link
            href="/search"
            className="block px-4 py-2.5 rounded-lg text-sm text-app-text hover:bg-app-gray transition-colors"
          >
            搜索
          </Link>
        </nav>
      </div>
    </aside>
  );
}
