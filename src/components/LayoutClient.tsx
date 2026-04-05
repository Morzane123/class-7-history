"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

interface Section {
  id: string;
  name: string;
  description: string | null;
}

interface LayoutClientProps {
  sections: Section[];
  children: React.ReactNode;
}

export default function LayoutClient({ sections, children }: LayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <Sidebar sections={sections} onCollapseChange={setSidebarCollapsed} />
      <main 
        className={`flex-1 pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        } ml-0`}
      >
        {children}
      </main>
    </>
  );
}
