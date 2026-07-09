"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Users,
  Globe,
  Lock,
  EyeOff,
} from "lucide-react";
import { formatKarma, timeAgo } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  banner: string | null;
  type: "public" | "restricted" | "private";
  memberCount: number;
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  body: string | null;
  type: string;
  score: number;
  commentCount: number;
  authorId: string;
  createdAt: Date;
}

export function CommunityPage({
  community,
  posts,
  isMember: initialMember,
  isAuthenticated,
}: {
  community: Community;
  posts: Post[];
  isMember: boolean;
  isAuthenticated: boolean;
}) {
  const [isMember, setIsMember] = useState(initialMember);
  const [memberCount, setMemberCount] = useState(community.memberCount);
  const router = useRouter();

  async function toggleJoin() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const res = await fetch(
      `/api/communities/${community.slug}/join`,
      { method: isMember ? "DELETE" : "POST" }
    );

    if (res.ok) {
      setIsMember(!isMember);
      setMemberCount((c) => (isMember ? c - 1 : c + 1));
    }
  }

  const typeIcon = {
    public: Globe,
    restricted: EyeOff,
    private: Lock,
  };
  const TypeIcon = typeIcon[community.type];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Banner */}
      {community.banner && (
        <div className="h-48 rounded-xl overflow-hidden mb-4 bg-zinc-900">
          <img
            src={community.banner}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sort tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 w-fit">
            {["Hot", "New", "Top", "Rising"].map((tab) => (
              <Button
                key={tab}
                variant={tab === "Hot" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-md text-xs"
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Posts */}
          {posts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-zinc-500">
                  No posts yet. Be the first to post!
                </p>
              </CardContent>
            </Card>
          )}

          {posts.map((post) => (
            <Card key={post.id} className="hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 min-w-[40px]">
                    <button className="text-zinc-500 hover:text-indigo-400 transition-colors">
                      <ArrowUp className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold text-zinc-100">
                      {formatKarma(post.score)}
                    </span>
                    <button className="text-zinc-500 hover:text-red-400 transition-colors">
                      <ArrowDown className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                      <span>Posted by u/{post.authorId.slice(0, 8)}</span>
                      <span>{timeAgo(new Date(post.createdAt))}</span>
                    </div>
                    <h2 className="text-base font-semibold text-zinc-100 mb-1">
                    <Link href={`/post/${post.id}`} className="hover:text-indigo-400 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                        <MessageCircle className="h-4 w-4" />
                        {post.commentCount} Comments
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
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

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {community.name[0].toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-lg">r/{community.name}</CardTitle>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <TypeIcon className="h-3 w-3" />
                    {community.type}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">{community.description}</p>

              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Users className="h-4 w-4" />
                <span>{memberCount.toLocaleString()} members</span>
              </div>

              <Button
                className="w-full"
                variant={isMember ? "outline" : "default"}
                onClick={toggleJoin}
              >
                {isMember ? "Joined" : "Join"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}