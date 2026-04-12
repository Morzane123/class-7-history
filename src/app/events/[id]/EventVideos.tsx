"use client";

import { useState, useEffect } from "react";
import { LazyVideo } from "@/components/LazyLoad";
import VideoPlayer from "@/components/VideoPlayer";

interface Video {
  id: string;
  video_path: string;
}

interface EventVideosProps {
  eventId: string;
}

export default function EventVideos({ eventId }: EventVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/videos`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data.videos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  const openPlayer = (videoPath: string) => {
    setCurrentVideo(videoPath);
    setPlayerOpen(true);
  };

  if (loading) {
    return null;
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">相关视频</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group cursor-pointer"
            onClick={() => openPlayer(video.video_path)}
          >
            <LazyVideo
              src={video.video_path}
              className="rounded-xl w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
              <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <svg className="w-8 h-8 text-[#0071e3] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <button
              className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openPlayer(video.video_path);
              }}
            >
              全屏播放
            </button>
          </div>
        ))}
      </div>

      {playerOpen && currentVideo && (
        <VideoPlayer src={currentVideo} onClose={() => setPlayerOpen(false)} />
      )}
    </div>
  );
}
