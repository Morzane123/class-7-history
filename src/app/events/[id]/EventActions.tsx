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

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex items-center gap-4 mb-6">
      {canEdit && (
        <a
          href={`/events/${event.id}/edit`}
          className="px-4 py-2 text-app-blue border border-app-blue rounded-lg hover:bg-app-blue hover:text-white transition-colors"
        >
          编辑
        </a>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
        >
          {isDeleting ? "删除中..." : "删除"}
        </button>
      )}
    </div>
  );
}
