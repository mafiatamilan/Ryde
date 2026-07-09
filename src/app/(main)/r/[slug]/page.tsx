import { db } from "@/db";
import { communities, posts as postsTable, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CommunityPage } from "./community";
import { auth } from "@/lib/auth";

export default async function CommunityRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const community = await db
    .select()
    .from(communities)
    .where(eq(communities.slug, slug))
    .get();

  if (!community) notFound();

  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.communityId, community.id))
    .all();

  let isMember = false;
  if (session?.user?.id) {
    const member = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, session.user.id),
          eq(memberships.communityId, community.id)
        )
      )
      .get();
    isMember = !!member;
  }

  return (
    <CommunityPage
      community={community}
      posts={posts}
      isMember={isMember}
      isAuthenticated={!!session?.user}
    />
  );
}