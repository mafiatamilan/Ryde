"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Calendar, Award } from "lucide-react";
import { formatKarma, timeAgo } from "@/lib/utils";

interface UserData {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  karma: number;
  postKarma: number;
  commentKarma: number;
  createdAt: Date;
  cakeDay: Date | null;
}

export function UserProfile({
  user,
  posts,
  comments: userComments,
}: {
  user: UserData;
  posts: any[];
  comments: any[];
}) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-zinc-100">
                u/{user.username}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {user.bio || "No bio yet"}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  {formatKarma(user.karma)} karma
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Cake day {user.cakeDay ? timeAgo(user.cakeDay) : "N/A"}
                </span>
              </div>
              <div className="flex gap-3 mt-3">
                <Badge variant="secondary">
                  {formatKarma(user.postKarma)} post karma
                </Badge>
                <Badge variant="secondary">
                  {formatKarma(user.commentKarma)} comment karma
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-4">
          {posts.length === 0 && userComments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-zinc-500">
                No activity yet
              </CardContent>
            </Card>
          ) : (
            <>
              {posts.slice(0, 5).map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <Card className="hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="text-xs text-zinc-500 mb-1">
                        {timeAgo(new Date(post.createdAt))}
                      </div>
                      <p className="font-medium text-zinc-100">{post.title}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span>{formatKarma(post.score)} points</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.commentCount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-3 mt-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-zinc-500">
                No posts yet
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className="hover:border-zinc-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-zinc-500 mb-1">
                      {timeAgo(new Date(post.createdAt))}
                    </div>
                    <p className="font-medium text-zinc-100">{post.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span>{formatKarma(post.score)} points</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-3 mt-4">
          {userComments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-zinc-500">
                No comments yet
              </CardContent>
            </Card>
          ) : (
            userComments
              .filter((c) => !c.isDeleted)
              .map((comment) => (
                <Link key={comment.id} href={`/post/${comment.postId}`}>
                  <Card className="hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="text-xs text-zinc-500 mb-1">
                        {timeAgo(new Date(comment.createdAt))}
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-2">
                        {comment.body}
                      </p>
                      <div className="text-xs text-zinc-500 mt-2">
                        {formatKarma(comment.score)} points
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