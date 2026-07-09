import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, communities } from "@/db/schema";
import { users } from "@/db/schema/auth";
import { like, or } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "all";

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], communities: [], users: [] });
  }

  const searchTerm = `%${q}%`;

  let results: Record<string, unknown[]> = { posts: [], communities: [], users: [] };

  if (type === "all" || type === "posts") {
    results.posts = await db
      .select()
      .from(posts)
      .where(or(like(posts.title, searchTerm), like(posts.body, searchTerm)))
      .all();
  }

  if (type === "all" || type === "communities") {
    results.communities = await db
      .select()
      .from(communities)
      .where(
        or(
          like(communities.name, searchTerm),
          like(communities.description, searchTerm)
        )
      )
      .all();
  }

  if (type === "all" || type === "users") {
    results.users = await db
      .select({ id: users.id, name: users.name, username: users.username, image: users.image, bio: users.bio })
      .from(users)
      .where(like(users.name, searchTerm))
      .all();
  }

  return NextResponse.json(results);
}