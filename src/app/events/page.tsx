import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { getSections, getEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const sections = await getSections();
  const events = await getEvents({ limit: 50 });

  return (
    <div className="min-h-screen bg-app-gray">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-64 pt-16">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-semibold text-app-text mb-8">
              事件列表
            </h1>

            {events.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">暂无事件记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <a
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block bg-white rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-app-blue font-medium">
                            {event.section?.name}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(event.event_date).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-app-text mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {event.content}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
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
        </main>
      </div>
    </div>
  );
}
