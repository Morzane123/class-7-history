"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TimelineSkeleton } from "@/components/Skeleton";
import { LazyImage } from "@/components/LazyLoad";

interface Event {
  id: string;
  title: string;
  content: string;
  event_date: string;
  section_id: string;
  section?: { id: string; name: string };
  author?: { id: string; nickname: string; avatar: string | null };
  images?: { id: string; image_path: string }[];
}

interface TimelineClientProps {
  sectionId?: string;
  year?: number;
  month?: number;
}

const PAGE_SIZE = 10;

export default function TimelineClient({ sectionId, year, month }: TimelineClientProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchEvents = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (sectionId) params.append("section", sectionId);
      if (year) params.append("year", year.toString());
      if (month) params.append("month", month.toString());
      params.append("limit", PAGE_SIZE.toString());
      params.append("offset", (pageNum * PAGE_SIZE).toString());

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();

      if (append) {
        setEvents((prev) => [...prev, ...data.events]);
      } else {
        setEvents(data.events);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sectionId, year, month]);

  useEffect(() => {
    setPage(0);
    fetchEvents(0, false);
  }, [fetchEvents]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, true);
  };

  const hasMore = events.length < total;

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.event_date);
    const eventYear = date.getFullYear();
    const eventMonth = date.getMonth() + 1;
    const key = `${eventYear}-${eventMonth.toString().padStart(2, "0")}`;

    if (!acc[key]) {
      acc[key] = {
        year: eventYear,
        month: eventMonth,
        events: [],
      };
    }
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, { year: number; month: number; events: Event[] }>);

  const sortedKeys = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return <TimelineSkeleton />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6e6e73]">暂无事件记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedKeys.map((key) => {
        const group = groupedEvents[key];
        return (
          <div key={key}>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">
              {group.year}年{group.month}月
            </h2>
            <div className="space-y-4">
              {group.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-[rgba(0,0,0,0.08)_0px_2px_8px] hover:shadow-[rgba(0,0,0,0.12)_0px_4px_16px] transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#0071e3]/10 rounded-xl flex items-center justify-center">
                      <span className="text-[#0071e3] font-semibold">
                        {new Date(event.event_date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-[#6e6e73] line-clamp-2">
                        {event.content.replace(/<[^>]*>/g, "")}
                      </p>
                      {event.images && event.images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-hidden">
                          {event.images.slice(0, 3).map((img) => (
                            <LazyImage
                              key={img.id}
                              src={img.image_path}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ))}
                          {event.images.length > 3 && (
                            <div className="w-16 h-16 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-sm text-[#6e6e73]">
                              +{event.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {event.section && (
                        <span className="inline-block mt-2 px-3 py-1 bg-[#f5f5f7] rounded-full text-xs text-[#6e6e73]">
                          {event.section.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-secondary"
          >
            {loadingMore ? "加载中..." : "加载更多"}
          </button>
          <p className="text-sm text-[#6e6e73] mt-2">
            已加载 {events.length} / {total} 条
          </p>
        </div>
      )}
    </div>
  );
}
