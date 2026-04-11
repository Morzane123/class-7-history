import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { getEventById, getSections, getCommentsByEventId } from "@/lib/db";
import EventActions from "./EventActions";
import EventImages from "./EventImages";
import EventVideos from "./EventVideos";
import CommentSection from "./CommentSection";
import RichTextDisplay from "./RichTextDisplay";

const JWT_SECRET = process.env.JWT_SECRET || "class-7-history-secret-key-2027";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
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

  const { id } = await params;
  const event = await getEventById(id);
  const sections = await getSections();
  const comments = await getCommentsByEventId(id);

  if (!event) {
    notFound();
  }

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
        <Sidebar sections={sections} />
        <main className="flex-1 ml-0 md:ml-64 pt-16">
          <article className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="badge badge-primary">
                  {event.section?.name}
                </span>
                <span className="text-sm text-[#6e6e73]">
                  事件发生时间：{new Date(event.event_date).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-4">
                {event.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#6e6e73]">
                <div className="flex items-center gap-2">
                  {event.author?.avatar ? (
                    <img src={event.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-xs">
                      {event.author?.nickname?.charAt(0)}
                    </div>
                  )}
                  <span>{event.author?.nickname}</span>
                </div>
                <span>记录于 {new Date(event.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
            </header>

            <EventActions event={event} />

            <EventImages event={event} />

            <EventVideos eventId={id} />

            <div className="card mb-8">
              <RichTextDisplay content={event.content} />
            </div>

            <CommentSection eventId={id} initialComments={comments} />
          </article>
        </main>
      </div>
    </div>
  );
}
