import { NextResponse } from "next/server";
import { db } from "@/db";
import { communities, memberships, posts as postsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const community = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug))
      .get();

    if (!community) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    const session = await auth();
    let isMember = false;
    let membershipRole: string | null = null;

    if (session?.user?.id) {
      const membership = await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, session.user.id),
            eq(memberships.communityId, community.id)
          )
        )
        .get();

      if (membership) {
        isMember = true;
        membershipRole = membership.role;
      }
    }

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.communityId, community.id))
      .all();

    return NextResponse.json({
      ...community,
      isMember,
      membershipRole,
      posts,
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const community = await db
    .select()
    .from(communities)
    .where(eq(communities.slug, slug))
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
        eq(memberships.communityId, community.id),
        eq(memberships.role, "admin")
      )
    )
    .get();

  if (!membership) {
    return NextResponse.json(
      { message: "Only admins can delete communities" },
      { status: 403 }
    );
  }

  await db.delete(communities).where(eq(communities.id, community.id)).run();
  return NextResponse.json({ message: "Community deleted" });
}