import { sqliteTable, text, integer, real, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { relations, sql } from "drizzle-orm";

// ─── Communities ───────────────────────────────────────────────
export const communities = sqliteTable("community", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").default(""),
  icon: text("icon"),
  banner: text("banner"),
  type: text("type", { enum: ["public", "restricted", "private"] })
    .default("public")
    .notNull(),
  createdById: text("createdById")
    .notNull()
    .references(() => users.id),
  memberCount: integer("memberCount").default(1).notNull(),
  rules: text("rules").default("[]"),
  flairs: text("flairs").default("[]"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const communitiesRelations = relations(communities, ({ many }) => ({
  memberships: many(memberships),
  posts: many(posts),
}));

// ─── Memberships ─────────────────────────────────────────────
export const memberships = sqliteTable(
  "membership",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    communityId: text("communityId")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["member", "moderator", "admin"] })
      .default("member")
      .notNull(),
    joinedAt: integer("joinedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.communityId] }),
  })
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  community: one(communities, {
    fields: [memberships.communityId],
    references: [communities.id],
  }),
}));

// ─── Posts ────────────────────────────────────────────────────
export const posts = sqliteTable("post", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").default(""),
  type: text("type", {
    enum: ["text", "link", "image", "video", "poll"],
  })
    .default("text")
    .notNull(),
  url: text("url"),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id),
  communityId: text("communityId")
    .notNull()
    .references(() => communities.id),
  score: integer("score").default(0).notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  commentCount: integer("commentCount").default(0).notNull(),
  flair: text("flair"),
  isPinned: integer("isPinned", { mode: "boolean" }).default(false),
  isLocked: integer("isLocked", { mode: "boolean" }).default(false),
  nsfw: integer("nsfw", { mode: "boolean" }).default(false),
  spoiler: integer("spoiler", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  comments: many(comments),
  votes: many(votes),
}));

// ─── Comments ─────────────────────────────────────────────────
export const comments = sqliteTable("comment", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id),
  postId: text("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  parentCommentId: text("parentCommentId"),
  score: integer("score").default(0).notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  depth: integer("depth").default(0).notNull(),
  isDeleted: integer("isDeleted", { mode: "boolean" }).default(false),
  edited: integer("edited", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
  replies: many(comments, { relationName: "replies" }),
  votes: many(votes),
}));

// ─── Votes ────────────────────────────────────────────────────
export const votes = sqliteTable(
  "vote",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: text("postId").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: text("commentId").references(() => comments.id, {
      onDelete: "cascade",
    }),
    value: integer("value").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    uniqueVote: uniqueIndex("unique_vote").on(table.userId, table.postId, table.commentId),
  })
);

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
  post: one(posts, { fields: [votes.postId], references: [posts.id] }),
  comment: one(comments, { fields: [votes.commentId], references: [comments.id] }),
}));

// ─── Notifications ────────────────────────────────────────────
export const notifications = sqliteTable("notification", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["reply", "mention", "upvote", "award", "modAction"],
  }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// ─── Saved Items ──────────────────────────────────────────────
export const savedItems = sqliteTable(
  "savedItem",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: text("postId").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: text("commentId").references(() => comments.id, {
      onDelete: "cascade",
    }),
    savedAt: integer("savedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId, table.commentId] }),
  })
);

// ─── Awards ───────────────────────────────────────────────────
export const awards = sqliteTable("award", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["gold", "silver", "custom"] }).notNull(),
  giverId: text("giverId")
    .notNull()
    .references(() => users.id),
  receiverId: text("receiverId")
    .notNull()
    .references(() => users.id),
  postId: text("postId").references(() => posts.id),
  commentId: text("commentId").references(() => comments.id),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// ─── Reports ──────────────────────────────────────────────────
export const reports = sqliteTable("report", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  postId: text("postId").references(() => posts.id),
  commentId: text("commentId").references(() => comments.id),
  reason: text("reason").notNull(),
  status: text("status", {
    enum: ["pending", "reviewed", "dismissed", "actionTaken"],
  })
    .default("pending")
    .notNull(),
  reviewedById: text("reviewedById").references(() => users.id),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  reviewedAt: integer("reviewedAt", { mode: "timestamp" }),
});

// ─── Mod Actions ──────────────────────────────────────────────
export const modActions = sqliteTable("modAction", {
  id: text("id").primaryKey(),
  moderatorId: text("moderatorId")
    .notNull()
    .references(() => users.id),
  communityId: text("communityId")
    .notNull()
    .references(() => communities.id),
  action: text("action", {
    enum: ["remove", "approve", "ban", "mute", "warn"],
  }).notNull(),
  targetUserId: text("targetUserId").references(() => users.id),
  targetPostId: text("targetPostId").references(() => posts.id),
  targetCommentId: text("targetCommentId").references(() => comments.id),
  reason: text("reason"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
