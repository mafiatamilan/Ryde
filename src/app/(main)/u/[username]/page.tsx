import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { posts, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UserProfile } from "./user-profile";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user) notFound();

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, user.id))
    .all();

  const userComments = await db
    .select()
    .from(comments)
    .where(eq(comments.authorId, user.id))
    .all();

  return (
    <UserProfile
      user={user}
      posts={userPosts}
      comments={userComments}
    />
  );
}