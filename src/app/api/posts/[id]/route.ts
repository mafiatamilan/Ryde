import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, comments as commentsTable, votes } from "@/db/schema";
import { users } from "@/db/schema/auth";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .get();

  if (!post) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  const author = await db
    .select()
    .from(users)
    .where(eq(users.id, post.authorId))
    .get();

  const postComments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.postId, id))
    .all();

  let userVote: number | null = null;
  const session = await auth();
  if (session?.user?.id) {
    const vote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, session.user.id),
          eq(votes.postId, id),
          isNull(votes.commentId)
        )
      )
      .get();
    if (vote) userVote = vote.value;
  }

  return NextResponse.json({
    post: { ...post, author: author ? { id: author.id, name: author.name, username: author.username, image: author.image } : null },
    comments: postComments,
    userVote,
  });
}