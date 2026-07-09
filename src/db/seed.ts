import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import bcrypt from "bcryptjs";
import * as authSchema from "./schema/auth";
import * as schema from "./schema";

const sqlite = new Database("dev.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema: { ...authSchema, ...schema } });

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  sqlite.exec("DELETE FROM vote");
  sqlite.exec("DELETE FROM comment");
  sqlite.exec("DELETE FROM post");
  sqlite.exec("DELETE FROM membership");
  sqlite.exec("DELETE FROM community");
  sqlite.exec("DELETE FROM session");
  sqlite.exec("DELETE FROM account");
  sqlite.exec("DELETE FROM user");

  const now = new Date();
  const hash = await bcrypt.hash("password123", 12);

  // Users
  const users = [
    { id: crypto.randomUUID(), name: "admin", username: "admin", email: "admin@example.com", passwordHash: hash, bio: "The admin of the clone", createdAt: now, cakeDay: now },
    { id: crypto.randomUUID(), name: "alice", username: "alice", email: "alice@example.com", passwordHash: hash, bio: "Full-stack developer", createdAt: now, cakeDay: now },
    { id: crypto.randomUUID(), name: "bob", username: "bob", email: "bob@example.com", passwordHash: hash, bio: "Designer & UI enthusiast", createdAt: now, cakeDay: now },
    { id: crypto.randomUUID(), name: "charlie", username: "charlie", email: "charlie@example.com", passwordHash: hash, bio: "Just here for the memes", createdAt: now, cakeDay: now },
  ];

  for (const u of users) {
    db.insert(authSchema.users).values(u).run();
  }
  console.log(`Created ${users.length} users`);

  // Communities
  const comms = [
    { id: crypto.randomUUID(), name: "announcements", slug: "announcements", description: "Official announcements about the platform", createdById: users[0].id, createdAt: now },
    { id: crypto.randomUUID(), name: "programming", slug: "programming", description: "All things code, software, and engineering", createdById: users[0].id, createdAt: now },
    { id: crypto.randomUUID(), name: "design", slug: "design", description: "UI/UX, graphic design, and visual arts", createdById: users[1].id, createdAt: now },
    { id: crypto.randomUUID(), name: "technology", slug: "technology", description: "Latest tech news and discussions", createdById: users[2].id, createdAt: now },
  ];

  for (const c of comms) {
    db.insert(schema.communities).values(c).run();
  }
  console.log(`Created ${comms.length} communities`);

  // Memberships
  for (const c of comms) {
    for (const u of users) {
      db.insert(schema.memberships).values({
        userId: u.id,
        communityId: c.id,
        role: u.name === "admin" ? "admin" : "member",
        joinedAt: now,
      }).run();
    }
  }
  console.log("Created memberships");

  // Posts
  const posts = [
    {
      id: crypto.randomUUID(),
      title: "Welcome to Ryde!",
      body: "This is the front page of your clone. Feel free to explore, create communities, and start posting. This platform is built with Next.js, Drizzle ORM, and SQLite.",
      type: "text" as const,
      authorId: users[0].id,
      communityId: comms[0].id,
      score: 42, upvotes: 45, downvotes: 3,
      commentCount: 2,
      createdAt: new Date(now.getTime() - 7200000),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "TypeScript 5.7 is out — what's new?",
      body: "TypeScript 5.7 brings some exciting new features including better type inference for arrays, improved `--isolatedDeclarations` support, and more. Check out the official blog post for details.",
      type: "text" as const,
      authorId: users[1].id,
      communityId: comms[1].id,
      score: 128, upvotes: 135, downvotes: 7,
      commentCount: 23,
      createdAt: new Date(now.getTime() - 3600000),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "New CSS layout techniques you should know in 2026",
      body: "CSS has evolved a lot. From container queries to `@scope` and anchor positioning — here's what every frontend dev should have in their toolkit.",
      type: "text" as const,
      authorId: users[2].id,
      communityId: comms[2].id,
      score: 89, upvotes: 92, downvotes: 3,
      commentCount: 15,
      createdAt: new Date(now.getTime() - 1800000),
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "What's your IDE setup for 2026?",
      body: "Curious what everyone is using these days. VS Code? Neovim? Zed? JetBrains? Share your setup and favorite extensions!",
      type: "text" as const,
      authorId: users[3].id,
      communityId: comms[3].id,
      score: 34, upvotes: 36, downvotes: 2,
      commentCount: 8,
      createdAt: new Date(now.getTime() - 900000),
      updatedAt: now,
    },
  ];

  for (const p of posts) {
    db.insert(schema.posts).values(p).run();
  }
  console.log(`Created ${posts.length} posts`);

  // Comments
  const comments = [
    { id: crypto.randomUUID(), body: "Excited to be here! This looks like a great platform.", authorId: users[1].id, postId: posts[0].id, score: 5, depth: 0, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), body: "Welcome everyone! Let's build great things together.", authorId: users[2].id, postId: posts[0].id, score: 3, depth: 0, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), body: "The template literal types are a game changer for my library code.", authorId: users[2].id, postId: posts[1].id, score: 12, depth: 0, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), body: "Container queries finally made responsive design truly composable.", authorId: users[1].id, postId: posts[2].id, score: 8, depth: 0, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), body: "Zed is surprisingly fast. I've been using it for 6 months now.", authorId: users[0].id, postId: posts[3].id, score: 6, depth: 0, createdAt: now, updatedAt: now },
  ];

  for (const c of comments) {
    db.insert(schema.comments).values(c).run();
  }
  console.log(`Created ${comments.length} comments`);

  console.log("Seed complete!");
}

seed().catch(console.error);