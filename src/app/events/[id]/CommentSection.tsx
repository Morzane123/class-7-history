"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user?: { id: string; nickname: string; avatar: string | null; is_class7?: number; class_name?: string | null };
  replies?: Comment[];
}

interface CommentSectionProps {
  eventId: string;
  initialComments: Comment[];
}

function CommentItem({ 
  comment, 
  eventId, 
  onReply,
  onDelete,
  currentUserId,
  depth = 0 
}: { 
  comment: Comment; 
  eventId: string;
  onReply: (parentId: string, content: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string | null;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent);
    setReplyContent("");
    setReplying(false);
  };

  const displayName = comment.user?.nickname + 
    (comment.user?.is_class7 === 0 && comment.user?.class_name ? ` (${comment.user.class_name})` : "");

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-[#d2d2d7] pl-4" : ""}`}>
      <div className="flex items-start gap-3 py-4">
        <div className="flex-shrink-0">
          {comment.user?.avatar ? (
            <img src={comment.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-sm">
              {comment.user?.nickname?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[#1d1d1f]">{displayName}</span>
            {comment.user?.is_class7 === 0 && (
              <span className="text-xs bg-[#f5f5f7] text-[#6e6e73] px-2 py-0.5 rounded-full">外班</span>
            )}
            <span className="text-xs text-[#86868b]">
              {new Date(comment.created_at).toLocaleDateString("zh-CN")}
            </span>
          </div>
          <p className="text-[#1d1d1f] break-words">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setReplying(!replying)}
              className="text-xs text-[#0071e3] hover:underline"
            >
              回复
            </button>
            {currentUserId === comment.user_id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-[#ff3b30] hover:underline"
              >
                删除
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm resize-none focus:outline-none focus:border-[#0071e3]"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setReplying(false)}
                  className="text-xs text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="text-xs bg-[#0071e3] text-white px-3 py-1 rounded-full hover:bg-[#0062cc] disabled:opacity-50"
                >
                  发送
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-0">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  eventId={eventId}
                  onReply={onReply}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ eventId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUser) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([...comments, data.comment]);
        setNewComment("");
      }
    } catch {
      alert("评论失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      const data = await res.json();
      if (res.ok) {
        const addReplyToComment = (comments: Comment[]): Comment[] => {
          return comments.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), data.comment],
              };
            }
            if (c.replies) {
              return {
                ...c,
                replies: addReplyToComment(c.replies),
              };
            }
            return c;
          });
        };
        setComments(addReplyToComment(comments));
      }
    } catch {
      alert("回复失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments
            .filter((c) => c.id !== id)
            .map((c) => ({
              ...c,
              replies: c.replies ? removeComment(c.replies) : [],
            }));
        };
        setComments(removeComment(comments));
      }
    } catch {
      alert("删除失败");
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">
        评论 ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h2>

      {currentUser ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full px-4 py-3 border border-[#d2d2d7] rounded-lg resize-none focus:outline-none focus:border-[#0071e3]"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !newComment.trim()}
              className="btn-primary text-sm px-4 py-2"
            >
              {loading ? "发送中..." : "发表评论"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-[#f5f5f7] rounded-lg text-center">
          <a href="/auth/login" className="text-[#0071e3] hover:underline">
            登录
          </a>
          <span className="text-[#6e6e73]"> 后参与评论</span>
        </div>
      )}

      <div className="divide-y divide-[#d2d2d7]">
        {comments.length === 0 ? (
          <p className="text-center text-[#86868b] py-8">暂无评论</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              eventId={eventId}
              onReply={handleReply}
              onDelete={handleDelete}
              currentUserId={currentUser?.id || null}
            />
          ))
        )}
      </div>
    </div>
  );
}
