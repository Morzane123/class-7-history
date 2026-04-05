import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { getEventById, getSections, getCommentsByEventId } from "@/lib/db";
import EventActions from "./EventActions";
import EventImages from "./EventImages";
import CommentSection from "./CommentSection";
import RichTextDisplay from "./RichTextDisplay";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  const sections = await getSections();
  const comments = await getCommentsByEventId(id);

  if (!event) {
    notFound();
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
                {event.updated_at !== event.created_at && (
                  <span>更新于 {new Date(event.updated_at).toLocaleDateString("zh-CN")}</span>
                )}
              </div>
            </header>

            <EventActions event={event} />

            <div className="card mb-8">
              <RichTextDisplay content={event.content} />
              <EventImages event={event} />
            </div>

            <CommentSection eventId={id} initialComments={comments} />
          </article>
        </main>
      </div>
    </div>
  );
}
