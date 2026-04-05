"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  author_id: string;
}

interface EventActionsProps {
  event: Event;
}

export default function EventActions({ event }: EventActionsProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; role: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const canEdit = currentUser && (currentUser.id === event.author_id || currentUser.role >= 2);
  const canDelete = currentUser && (currentUser.id === event.author_id || currentUser.role >= 2);

  const handleDelete = async () => {
    if (!confirm("确定要删除此事件吗？")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/timeline");
      }
    } catch {
      alert("删除失败");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    const shareText = `【${event.title}】\n${window.location.href}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {
      alert("复制失败，请手动复制");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <button
        onClick={handleShare}
        className="btn-ghost text-sm"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {shareSuccess ? "已复制！" : "分享"}
      </button>
      
      {canEdit && (
        <a
          href={`/events/edit?id=${event.id}`}
          className="btn-outline text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </a>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn-danger text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {isDeleting ? "删除中..." : "删除"}
        </button>
      )}
    </div>
  );
}
