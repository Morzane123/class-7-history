"use client";

export function EventCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#f5f5f7] rounded-full" />
        <div className="flex-1">
          <div className="h-5 bg-[#f5f5f7] rounded-lg w-3/4 mb-2" />
          <div className="h-4 bg-[#f5f5f7] rounded-lg w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-[#f5f5f7] rounded-lg" />
        <div className="h-4 bg-[#f5f5f7] rounded-lg w-5/6" />
        <div className="h-4 bg-[#f5f5f7] rounded-lg w-4/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 bg-[#f5f5f7] rounded-full w-16" />
        <div className="h-6 bg-[#f5f5f7] rounded-full w-20" />
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#d2d2d7]" />
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`relative flex items-start gap-4 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f5f5f7] rounded-full border-4 border-white animate-pulse" />
            <div className={`ml-12 md:ml-0 md:w-5/12 ${i % 2 === 0 ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}`}>
              <EventCardSkeleton />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 bg-[#f5f5f7] rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-[#f5f5f7] rounded-lg w-24 mb-2" />
        <div className="h-4 bg-[#f5f5f7] rounded-lg w-full mb-1" />
        <div className="h-4 bg-[#f5f5f7] rounded-lg w-3/4" />
      </div>
    </div>
  );
}

export function ImageGallerySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square bg-[#f5f5f7] rounded-xl" />
      ))}
    </div>
  );
}

export function VideoGallerySkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-video bg-[#f5f5f7] rounded-xl" />
      ))}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-[#f5f5f7] rounded-lg w-24 mb-2" />
      <div className="h-4 bg-[#f5f5f7] rounded-lg w-40" />
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-xl rounded-xl animate-pulse">
      <div className="w-12 h-12 bg-[#f5f5f7] rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-[#f5f5f7] rounded-lg w-32 mb-2" />
        <div className="h-3 bg-[#f5f5f7] rounded-lg w-48" />
      </div>
      <div className="h-8 bg-[#f5f5f7] rounded-lg w-20" />
    </div>
  );
}
