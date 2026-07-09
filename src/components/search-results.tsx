"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Hash, Users } from "lucide-react";
import { timeAgo, formatKarma } from "@/lib/utils";

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<{
    posts: any[];
    communities: any[];
    users: any[];
  }>({ posts: [], communities: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&type=${tab}`)
      .then((r) => r.json())
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, tab]);

  if (!q) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-zinc-500">Search for posts, communities, and users</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">
        Results for &ldquo;{q}&rdquo;
      </h1>
      <p className="text-sm text-zinc-500 mb-4">
        {results.posts.length + results.communities.length + results.users.length} results
      </p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {results.communities.slice(0, 3).map((c: any) => (
                <Link key={c.id} href={`/r/${c.slug}`}>
                  <Card className="hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Hash className="h-5 w-5 text-indigo-400" />
                      <div>
                        <p className="font-medium text-zinc-100">r/{c.name}</p>
                        <p className="text-xs text-zinc-500">{c.description?.slice(0, 100)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {results.posts.slice(0, 5).map((p: any) => (
                <Link key={p.id} href={`/post/${p.id}`}>
                  <Card className="hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="text-xs text-zinc-500 mb-1">
                        {timeAgo(new Date(p.createdAt))}
                      </div>
                      <p className="font-medium text-zinc-100">{p.title}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span>{formatKarma(p.score)} points</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {p.commentCount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {results.users.slice(0, 3).map((u: any) => (
                <Link key={u.id} href={`/u/${u.username}`}>
                  <Card className="hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {u.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">u/{u.username}</p>
                        <p className="text-xs text-zinc-500">{u.bio?.slice(0, 100)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {results.posts.length === 0 && results.communities.length === 0 && results.users.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-zinc-500">
                    No results found
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-3 mt-4">
          {results.posts.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-zinc-500">No posts found</CardContent></Card>
          ) : (
            results.posts.map((p: any) => (
              <Link key={p.id} href={`/post/${p.id}`}>
                <Card className="hover:border-zinc-700 transition-colors">
                  <CardContent className="p-4">
                    <p className="font-medium text-zinc-100">{p.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span>{formatKarma(p.score)} points</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {p.commentCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="communities" className="space-y-3 mt-4">
          {results.communities.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-zinc-500">No communities found</CardContent></Card>
          ) : (
            results.communities.map((c: any) => (
              <Link key={c.id} href={`/r/${c.slug}`}>
                <Card className="hover:border-zinc-700 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Hash className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="font-medium text-zinc-100">r/{c.name}</p>
                      <p className="text-xs text-zinc-500">{c.description?.slice(0, 200)}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">{c.memberCount} members</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-3 mt-4">
          {results.users.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-zinc-500">No users found</CardContent></Card>
          ) : (
            results.users.map((u: any) => (
              <Link key={u.id} href={`/u/${u.username}`}>
                <Card className="hover:border-zinc-700 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {u.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">u/{u.username}</p>
                      <p className="text-xs text-zinc-500">{u.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}