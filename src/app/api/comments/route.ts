import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId, parentCommentId, content } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { message: "Post ID and content are required" },
        { status: 400 }
      );
    }

    let depth = 0;
    if (parentCommentId) {
      const parent = await db
        .select()
        .from(comments)
        .where(eq(comments.id, parentCommentId))
        .get();
      if (parent) {
        depth = parent.depth + 1;
      }
    }

    const now = new Date();
    const comment = {
      id: generateId(),
      body: content,
      authorId: session.user.id,
      postId,
      parentCommentId: parentCommentId || null,
      score: 0,
      upvotes: 0,
      downvotes: 0,
      depth,
      isDeleted: false,
      edited: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(comments).values(comment).run();
    await db
      .update(posts)
      .set({ commentCount: sql`comment_count + 1` })
      .where(eq(posts.id, postId))
      .run();

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const commentId = url.searchParams.get("id");
  if (!commentId) {
    return NextResponse.json(
      { message: "Comment ID required" },
      { status: 400 }
    );
  }

  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .get();

  if (!comment) {
    return NextResponse.json(
      { message: "Comment not found" },
      { status: 404 }
    );
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await db
    .update(comments)
    .set({ isDeleted: true, body: "[deleted]" })
    .where(eq(comments.id, commentId))
    .run();

  return NextResponse.json({ message: "Comment deleted" });
}