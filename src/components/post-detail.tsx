"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { timeAgo, formatKarma } from "@/lib/utils";

interface PostAuthor {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface Post {
  id: string;
  title: string;
  body: string | null;
  type: string;
  url: string | null;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  author: PostAuthor | null;
  communityId: string;
  createdAt: string;
  nsfw: boolean;
  spoiler: boolean;
}

interface Comment {
  id: string;
  body: string;
  authorId: string;
  postId: string;
  parentCommentId: string | null;
  score: number;
  depth: number;
  isDeleted: boolean;
  createdAt: string;
}

export function PostDetail({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}`);
    if (res.ok) {
      const data = await res.json();
      setPost(data.post);
      setComments(data.comments || []);
      setUserVote(data.userVote);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  async function handleVote(value: number) {
    if (!session) return;
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, value }),
    });
    if (res.ok) {
      const data = await res.json();
      setPost((p) => p ? { ...p, score: data.score, upvotes: data.upvotes, downvotes: data.downvotes } : p);
      setUserVote(userVote === value ? null : value);
    }
  }

  async function handleCommentVote(commentId: string, value: number) {
    if (!session) return;
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, value }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((cs) =>
        cs.map((c) =>
          c.id === commentId
            ? { ...c, score: data.score }
            : c
        )
      );
    }
  }

  async function submitComment(parentCommentId: string | null) {
    if (!replyContent.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, parentCommentId, content: replyContent }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((cs) => [...cs, newComment]);
      setReplyContent("");
      setReplyTo(null);
      setPost((p) => p ? { ...p, commentCount: p.commentCount + 1 } : p);
    }
  }

  function toggleCollapse(commentId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }

  function getReplies(parentId: string | null): Comment[] {
    return comments.filter((c) => c.parentCommentId === parentId);
  }

  function renderComment(comment: Comment, depth: number = 0) {
    if (depth > 0 && comment.parentCommentId && collapsed.has(comment.parentCommentId)) {
      return null;
    }

    const replies = getReplies(comment.id);
    const isCollapsed = collapsed.has(comment.id);

    const depthColors = [
      "border-l-indigo-500",
      "border-l-emerald-500",
      "border-l-amber-500",
      "border-l-rose-500",
      "border-l-cyan-500",
      "border-l-violet-500",
      "border-l-orange-500",
      "border-l-pink-500",
    ];

    return (
      <div key={comment.id} className="space-y-2">
        <div
          className={`pl-4 border-l-2 ${
            depthColors[depth % depthColors.length]
          } ${depth > 0 ? "ml-4" : ""}`}
        >
          {isCollapsed ? (
            <button
              onClick={() => toggleCollapse(comment.id)}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
            >
              [+] {comments.find((c) => c.id === comment.id)?.authorId.slice(0, 8)}
              {replies.length > 0 ? ` — ${replies.length} more replies` : ""}
            </button>
          ) : (
            <div className="space-y-2 py-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium text-zinc-400">
                  u/{comment.authorId.slice(0, 8)}
                </span>
                <span>{timeAgo(new Date(comment.createdAt))}</span>
              </div>

              <p className="text-sm text-zinc-200">
                {comment.isDeleted ? (
                  <span className="text-zinc-600 italic">[deleted]</span>
                ) : (
                  comment.body
                )}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCommentVote(comment.id, 1)}
                    className="text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-medium text-zinc-300 min-w-[20px] text-center">
                    {formatKarma(comment.score)}
                  </span>
                  <button
                    onClick={() => handleCommentVote(comment.id, -1)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {session && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Reply
                  </button>
                )}

                <button
                  onClick={() => toggleCollapse(comment.id)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Collapse
                </button>
              </div>

              {replyTo === comment.id && (
                <div className="space-y-2 mt-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => submitComment(comment.id)}>
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {replies.length > 0 && (
                <div className="space-y-2 mt-2">
                  {replies.map((reply) => renderComment(reply, depth + 1))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-zinc-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-zinc-500">Post not found</p>
      </div>
    );
  }

  const rootComments = getReplies(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <button
                onClick={() => handleVote(1)}
                className={`transition-colors ${
                  userVote === 1
                    ? "text-indigo-400"
                    : "text-zinc-500 hover:text-indigo-400"
                }`}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <span
                className={`text-sm font-bold text-center ${
                  userVote === 1
                    ? "text-indigo-400"
                    : userVote === -1
                    ? "text-red-400"
                    : "text-zinc-100"
                }`}
              >
                {formatKarma(post.score)}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`transition-colors ${
                  userVote === -1
                    ? "text-red-400"
                    : "text-zinc-500 hover:text-red-400"
                }`}
              >
                <ArrowDown className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <span>Posted by u/{post.author?.username || post.author?.name || "unknown"}</span>
                <span>{timeAgo(new Date(post.createdAt))}</span>
                {post.nsfw && <Badge variant="destructive">NSFW</Badge>}
                {post.spoiler && <Badge>Spoiler</Badge>}
              </div>
              <h1 className="text-xl font-bold text-zinc-100 mb-3">
                {post.title}
              </h1>

              {post.body && (
                <div className="text-sm text-zinc-300 whitespace-pre-wrap mb-3">
                  {post.body}
                </div>
              )}

              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline text-sm break-all"
                >
                  {post.url}
                </a>
              )}

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800">
                <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentCount} Comments
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {session && (
        <Card>
          <CardContent className="p-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="What are your thoughts?"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={() => submitComment(null)}>
                Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {rootComments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-zinc-500">No comments yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          rootComments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}