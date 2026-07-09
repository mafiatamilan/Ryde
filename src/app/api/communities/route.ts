import { NextResponse } from "next/server";
import { db } from "@/db";
import { communities, memberships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateId, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(communities).all();
    return NextResponse.json(all);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, type } = body;

    if (!name || name.length < 3 || name.length > 21) {
      return NextResponse.json(
        { message: "Community name must be 3-21 characters" },
        { status: 400 }
      );
    }

    const slug = slugify(name);
    const existing = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug))
      .get();

    if (existing) {
      return NextResponse.json(
        { message: "Community already exists" },
        { status: 409 }
      );
    }

    const now = new Date();
    const community = {
      id: generateId(),
      name,
      slug,
      description: description || "",
      type: type || "public",
      createdById: session.user.id,
      memberCount: 1,
      createdAt: now,
    };

    await db.insert(communities).values(community).run();
    await db
      .insert(memberships)
      .values({
        userId: session.user.id,
        communityId: community.id,
        role: "admin",
        joinedAt: now,
      })
      .run();

    return NextResponse.json(community, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}