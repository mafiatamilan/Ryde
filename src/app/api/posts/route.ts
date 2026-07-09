import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, communities, memberships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, body: postBody, type, communityId, url } = body;

    if (!title || title.length < 1) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const community = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .get();

    if (!community) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    const membership = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, session.user.id),
          eq(memberships.communityId, communityId)
        )
      )
      .get();

    if (community.type !== "public" && !membership) {
      return NextResponse.json(
        { message: "You must be a member to post here" },
        { status: 403 }
      );
    }

    const now = new Date();
    const post = {
      id: generateId(),
      title,
      body: postBody || "",
      type: type || "text",
      url: url || null,
      authorId: session.user.id,
      communityId,
      score: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(posts).values(post).run();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const communityId = url.searchParams.get("communityId");
  const sort = url.searchParams.get("sort") || "hot";

  let allPosts;
  if (communityId) {
    allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.communityId, communityId))
      .all();
  } else {
    allPosts = await db.select().from(posts).all();
  }

  const now = Date.now();
  const sorted = [...allPosts].sort((a, b) => {
    if (sort === "new") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === "top") {
      return b.score - a.score;
    }
    const scoreA = Math.max(a.score, 1);
    const scoreB = Math.max(b.score, 1);
    const orderA = Math.log10(scoreA) + (new Date(a.createdAt).getTime() - now) / 45000;
    const orderB = Math.log10(scoreB) + (new Date(b.createdAt).getTime() - now) / 45000;
    return orderB - orderA;
  });

  return NextResponse.json(sorted);
}