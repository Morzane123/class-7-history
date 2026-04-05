import Navigation from "@/components/Navigation";
import LayoutClient from "@/components/LayoutClient";
import { getSections, getEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const sections = await getSections();
  const events = await getEvents({ limit: 50 });

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Navigation />
      <div className="flex">
        <LayoutClient sections={sections}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-8">
              事件列表
            </h1>

            {events.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#6e6e73] text-lg">暂无事件记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <a
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block bg-white rounded-xl p-6 shadow-[rgba(0,0,0,0.08)_0px_2px_8px] hover:shadow-[rgba(0,0,0,0.12)_0px_4px_16px] transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge badge-primary">
                            {event.section?.name}
                          </span>
                          <span className="text-sm text-[#6e6e73]">
                            {new Date(event.event_date).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
                          {event.title}
                        </h3>
                        <p className="text-[#6e6e73] line-clamp-2">
                          {event.content}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-[#86868b]">
                      <span>记录者：{event.author?.nickname}</span>
                      <span>·</span>
                      <span>
                        {new Date(event.created_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </LayoutClient>
      </div>
    </div>
  );
}
