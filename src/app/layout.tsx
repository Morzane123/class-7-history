import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "璧山中学高2027届7班班史",
  description: "记录班级点滴，珍藏青春记忆",
  icons: {
    icon: "/校徽.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-app-gray min-h-screen">{children}</body>
    </html>
  );
}
