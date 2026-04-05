import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { getEventById, getSections } from "@/lib/db";
import EventActions from "./EventActions";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  const sections = await getSections();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-app-gray">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-64 pt-16">
          <article className="max-w-4xl mx-auto px-8 py-12">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-app-blue text-white text-sm rounded-full">
                  {event.section?.name}
                </span>
                <span className="text-gray-400 text-sm">
                  事件发生时间：{new Date(event.event_date).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <h1 className="text-4xl font-semibold text-app-text mb-4">
                {event.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {event.author?.avatar ? (
                    <img src={event.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-app-blue flex items-center justify-center text-white text-xs">
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

            <div className="bg-white rounded-xl p-8 shadow-card">
              <div className="prose prose-lg max-w-none">
                {event.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-app-text leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {event.images && event.images.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {event.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.image_path}
                      alt=""
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
