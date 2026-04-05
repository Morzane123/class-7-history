import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { getSections, getEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const sections = await getSections();
  const events = await getEvents({
    sectionId: params.section,
    year: params.year ? parseInt(params.year) : undefined,
    month: params.month ? parseInt(params.month) : undefined,
  });

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.event_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, "0")}`;
    
    if (!acc[key]) {
      acc[key] = {
        year,
        month,
        events: [],
      };
    }
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, { year: number; month: number; events: typeof events }>);

  const sortedKeys = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-0 md:ml-64 pt-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-8">
              时间线
            </h1>

            {sortedKeys.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#6e6e73] text-lg">暂无事件记录</p>
              </div>
            ) : (
              <div className="space-y-12">
                {sortedKeys.map((key) => {
                  const group = groupedEvents[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="timeline-badge">
                          <span className="text-2xl font-semibold">{group.year}</span>
                          <span className="text-lg ml-1">年{group.month}月</span>
                        </div>
                        <div className="flex-1 h-px bg-[#d2d2d7]" />
                      </div>

                      <div className="space-y-4">
                        {group.events.map((event) => (
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
