import { NextResponse } from "next/server";
import { db } from "@/db";
import { votes, posts, comments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId, commentId, value } = body;

    if (![-1, 0, 1].includes(value)) {
      return NextResponse.json({ message: "Invalid vote value" }, { status: 400 });
    }

    if (postId && commentId) {
      return NextResponse.json(
        { message: "Cannot vote on both post and comment" },
        { status: 400 }
      );
    }

    if (!postId && !commentId) {
      return NextResponse.json(
        { message: "Must specify postId or commentId" },
        { status: 400 }
      );
    }

    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, session.user.id),
          postId ? eq(votes.postId, postId) : eq(votes.commentId, commentId),
          postId ? isNull(votes.commentId) : isNull(votes.postId)
        )
      )
      .get();

    const upvoteDelta = existingVote
      ? value - (existingVote.value === 1 ? 1 : 0)
      : value === 1 ? 1 : 0;
    const downvoteDelta = existingVote
      ? (existingVote.value === -1 ? -1 : 0) - (value === -1 ? 1 : 0)
      : value === -1 ? -1 : 0;
    const scoreDelta = value - (existingVote?.value ?? 0);

    if (existingVote) {
      if (value === 0) {
        await db.delete(votes).where(eq(votes.id, existingVote.id)).run();
      } else {
        await db
          .update(votes)
          .set({ value })
          .where(eq(votes.id, existingVote.id))
          .run();
      }
    } else if (value !== 0) {
      await db
        .insert(votes)
        .values({
          id: generateId(),
          userId: session.user.id,
          postId: postId || null,
          commentId: commentId || null,
          value,
          createdAt: new Date(),
        })
        .run();
    }

    if (postId) {
      await db
        .update(posts)
        .set({
          score: sql`score + ${scoreDelta}`,
          upvotes: sql`upvotes + ${upvoteDelta}`,
          downvotes: sql`downvotes + ${downvoteDelta}`,
        })
        .where(eq(posts.id, postId))
        .run();

      const updated = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .get();

      return NextResponse.json({ score: updated?.score, upvotes: updated?.upvotes, downvotes: updated?.downvotes });
    }

    if (commentId) {
      await db
        .update(comments)
        .set({
          score: sql`score + ${scoreDelta}`,
          upvotes: sql`upvotes + ${upvoteDelta}`,
          downvotes: sql`downvotes + ${downvoteDelta}`,
        })
        .where(eq(comments.id, commentId))
        .run();

      const updated = await db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .get();

      return NextResponse.json({ score: updated?.score, upvotes: updated?.upvotes, downvotes: updated?.downvotes });
    }

    return NextResponse.json({ message: "No action" });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}