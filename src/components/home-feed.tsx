"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowUp, ArrowDown, MessageCircle, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo, formatKarma } from "@/lib/utils";

interface PostItem {
  id: string;
  title: string;
  body: string | null;
  type: string;
  url: string | null;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  authorId: string;
  communityId: string;
  createdAt: string;
  nsfw: boolean;
}

interface SortOption {
  label: string;
  value: string;
}

const sortOptions: SortOption[] = [
  { label: "Hot", value: "hot" },
  { label: "New", value: "new" },
  { label: "Top", value: "top" },
  { label: "Rising", value: "rising" },
  { label: "Controversial", value: "controversial" },
];

const timeFilters: SortOption[] = [
  { label: "Now", value: "hour" },
  { label: "Today", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

export function HomeFeed({ feedType = "home" }: { feedType?: string }) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [sort, setSort] = useState("hot");
  const [timeFilter, setTimeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (sort === "top") params.set("time", timeFilter);
    const res = await fetch(`/api/posts?${params}`);
    if (res.ok) {
      let data = await res.json();

      if (sort === "rising") {
        const now = Date.now();
        data = data
          .filter((p: PostItem) => (now - new Date(p.createdAt).getTime()) < 86400000)
          .sort((a: PostItem, b: PostItem) => b.upvotes - a.upvotes);
      }

      if (sort === "controversial") {
        data = data
          .filter((p: PostItem) => p.downvotes > 0)
          .sort((a: PostItem, b: PostItem) => {
            const ratioA = a.downvotes > 0 ? a.upvotes / a.downvotes : a.upvotes;
            const ratioB = b.downvotes > 0 ? b.upvotes / b.downvotes : b.upvotes;
            return Math.abs(ratioA - 1) - Math.abs(ratioB - 1);
          });
      }

      if (sort === "top" && timeFilter !== "all") {
        const now = Date.now();
        const limits: Record<string, number> = {
          hour: 3600000,
          day: 86400000,
          week: 604800000,
          month: 2592000000,
          year: 31536000000,
        };
        data = data.filter(
          (p: PostItem) => (now - new Date(p.createdAt).getTime()) < (limits[timeFilter] || Infinity)
        );
      }

      setPosts(data);
    }
    setLoading(false);
  }, [sort, timeFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleVote(postId: string, value: number) {
    if (!session) return;
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, value }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((ps) =>
        ps.map((p) =>
          p.id === postId
            ? { ...p, score: data.score, upvotes: data.upvotes, downvotes: data.downvotes }
            : p
        )
      );
    }
  }

  return (
    <div>
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 w-fit">
          {sortOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={sort === opt.value ? "secondary" : "ghost"}
              size="sm"
              className="rounded-md text-xs"
              onClick={() => setSort(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {sort === "top" && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 w-fit">
            {timeFilters.map((opt) => (
              <Button
                key={opt.value}
                variant={timeFilter === opt.value ? "secondary" : "ghost"}
                size="sm"
                className="rounded-md text-xs"
                onClick={() => setTimeFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="min-w-[40px] space-y-2">
                    <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-8 bg-zinc-800 rounded animate-pulse mx-auto" />
                    <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse mx-auto" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-zinc-500 mb-2">No posts yet</p>
            <Link href="/submit">
              <Button>Create the first post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 min-w-[40px]">
                    <button
                      onClick={() => handleVote(post.id, 1)}
                      className="text-zinc-500 hover:text-indigo-400 transition-colors"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold text-zinc-100 text-center">
                      {formatKarma(post.score)}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, -1)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <ArrowDown className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                      <span>Posted by u/{post.authorId.slice(0, 8)}</span>
                      <span>{timeAgo(new Date(post.createdAt))}</span>
                    </div>
                    <Link href={`/post/${post.id}`}>
                      <h2 className="text-base font-semibold text-zinc-100 mb-1 leading-snug hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    {post.body && (
                      <p className="text-sm text-zinc-400 line-clamp-2">{post.body}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <Link href={`/post/${post.id}`}>
                        <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentCount} Comments
                        </button>
                      </Link>
                      <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}