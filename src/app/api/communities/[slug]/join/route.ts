import { NextResponse } from "next/server";
import { db } from "@/db";
import { communities, memberships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
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

  const existing = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, session.user.id),
        eq(memberships.communityId, community.id)
      )
    )
    .get();

  if (existing) {
    return NextResponse.json(
      { message: "Already a member" },
      { status: 400 }
    );
  }

  await db
    .insert(memberships)
    .values({
      userId: session.user.id,
      communityId: community.id,
      role: "member",
      joinedAt: new Date(),
    })
    .run();

  await db
    .update(communities)
    .set({ memberCount: community.memberCount + 1 })
    .where(eq(communities.id, community.id))
    .run();

  return NextResponse.json({ message: "Joined community" });
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

  await db
    .delete(memberships)
    .where(
      and(
        eq(memberships.userId, session.user.id),
        eq(memberships.communityId, community.id)
      )
    )
    .run();

  await db
    .update(communities)
    .set({ memberCount: Math.max(0, community.memberCount - 1) })
    .where(eq(communities.id, community.id))
    .run();

  return NextResponse.json({ message: "Left community" });
}