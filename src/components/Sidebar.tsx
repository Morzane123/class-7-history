"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface Section {
  id: string;
  name: string;
  description: string | null;
}

interface SidebarProps {
  sections: Section[];
  onCollapseChange?: (collapsed: boolean) => void;
}

function SidebarContent({ sections, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSection = searchParams.get("section");

  const isActive = (sectionId?: string) => {
    if (!sectionId) {
      return pathname === "/timeline" && !currentSection;
    }
    return pathname === "/timeline" && currentSection === sectionId;
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    onCollapseChange?.(collapsed);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <aside
        className={`fixed left-0 top-12 h-[calc(100vh-48px)] bg-white/80 backdrop-blur-xl border-r border-[#d2d2d7]/50 overflow-y-auto transition-all duration-300 z-40 
          ${collapsed ? "w-20" : "w-64"}
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:top-0 max-md:z-50 max-md:h-full max-md:w-64
          max-md:transform max-md:transition-transform max-md:duration-300
          ${mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!collapsed && (
              <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider">
                板块分类
              </h2>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors text-[#1d1d1f] ml-auto hidden md:flex"
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
            <button
              onClick={closeMobile}
              className="p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors text-[#1d1d1f] md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-1">
            <Link
              href="/timeline"
              onClick={closeMobile}
              className={`sidebar-link ${
                isActive() ? "sidebar-link-active" : "sidebar-link-inactive"
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
                onClick={closeMobile}
                className={`sidebar-link ${
                  isActive(section.id) ? "sidebar-link-active" : "sidebar-link-inactive"
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

        <div className="p-4 border-t border-[#d2d2d7]/50">
          {!collapsed && (
            <h2 className="text-sm font-semibold text-[#6e6e73] uppercase tracking-wider mb-4">
              快捷操作
            </h2>
          )}
          <nav className="space-y-1">
            <Link
              href="/events/create"
              onClick={closeMobile}
              className="sidebar-link sidebar-link-inactive"
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {!collapsed && <span>记录新事件</span>}
            </Link>
            <Link
              href="/search"
              onClick={closeMobile}
              className="sidebar-link sidebar-link-inactive"
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {!collapsed && <span>搜索</span>}
            </Link>
          </nav>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={closeMobile}
        />
      )}

      <button
        onClick={toggleMobile}
        className="fixed bottom-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-xl rounded-full shadow-lg md:hidden"
      >
        <svg className="w-6 h-6 text-[#1d1d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={
      <aside className="fixed left-0 top-12 h-[calc(100vh-48px)] w-64 bg-white border-r border-[#d2d2d7] z-40" />
    }>
      <SidebarContent {...props} />
    </Suspense>
  );
}
