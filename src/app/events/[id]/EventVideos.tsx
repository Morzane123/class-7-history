"use client";

import { useState, useEffect } from "react";

interface Video {
  id: string;
  video_path: string;
  sort_order: number;
}

interface EventVideosProps {
  eventId: string;
}

export default function EventVideos({ eventId }: EventVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetch(`/api/events/${eventId}/videos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videos) {
          setVideos(data.videos);
        }
      })
      .catch(() => {});
  }, [eventId]);

  if (videos.length === 0) return null;

  return (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">视频</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="relative rounded-xl overflow-hidden bg-black">
            <video
              src={video.video_path}
              controls
              className="w-full aspect-video object-contain"
              playsInline
            />
          </div>
        ))}
      </div>
    </div>
  );
}
