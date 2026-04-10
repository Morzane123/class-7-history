"use client";

import Announcement from "@/components/Announcement";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Announcement />
    </>
  );
}
