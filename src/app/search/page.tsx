"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";

interface Section {
  id: string;
  name: string;
  description: string | null;
}

interface Event {
  id: string;
  title: string;
  content: string;
  event_date: string;
  section_id: string;
  section?: { name: string };
  author?: { nickname: string };
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  useState(() => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch(() => {});
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/events?limit=100`);
      const data = await res.json();
      const allEvents = data.events || [];
      
      const filtered = allEvents.filter((event: Event) =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.content.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-gray">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-64 pt-16">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-semibold text-app-text mb-8">
              搜索事件
            </h1>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="输入关键词搜索..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-app-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "搜索中..." : "搜索"}
                </button>
              </div>
            </form>

            {searched && (
              <div>
                <p className="text-gray-500 mb-4">
                  找到 {results.length} 条结果
                </p>

                {results.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">没有找到相关事件</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((event) => (
                      <a
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="block bg-white rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow"
                      >
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
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
