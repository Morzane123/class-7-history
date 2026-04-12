import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import Navigation from "@/components/Navigation";
import LayoutClient from "@/components/LayoutClient";
import { getSections } from "@/lib/db";
import Link from "next/link";
import TimelineClient from "@/components/TimelineClient";

const JWT_SECRET = process.env.JWT_SECRET || "class-7-history-secret-key-2027";

export const dynamic = "force-dynamic";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; year?: string; month?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let isLoggedIn = false;
  if (token) {
    try {
      verify(token, JWT_SECRET);
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  const params = await searchParams;
  const sections = await getSections();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0071e3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">请先登录</h2>
            <p className="text-[#6e6e73] mb-6">登录后才能查看班史内容</p>
            <Link href="/auth/login" className="btn-primary">
              前往登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Navigation />
      <div className="flex">
        <LayoutClient sections={sections}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-8">
              时间线
            </h1>

            <TimelineClient
              sectionId={params.section}
              year={params.year ? parseInt(params.year) : undefined}
              month={params.month ? parseInt(params.month) : undefined}
            />
          </div>
        </LayoutClient>
      </div>
    </div>
  );
}
