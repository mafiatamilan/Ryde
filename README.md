<div align="center">
  <img src="https://img.shields.io/badge/status-active-success" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/drizzle-ORM-C5F74F?logo=drizzle" alt="Drizzle" />
  <br/><br/>
  <h1>🏄 Ryde</h1>
  <p><strong>A full-featured community platform — built with Next.js 16, Drizzle ORM, SQLite, and NextAuth.js.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech</a> •
    <a href="#getting-started">Setup</a> •
    <a href="#project-structure">Structure</a> •
    <a href="#api-routes">API</a>
  </p>
  <br/>
</div>

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="33%"><b>🔐 Auth</b><br/>Email/password + JWT sessions</td>
    <td align="center" width="33%"><b>🏘️ Communities</b><br/>Create, browse, join/leave</td>
    <td align="center" width="33%"><b>📝 Posts</b><br/>Text, link & image posts</td>
  </tr>
  <tr>
    <td align="center"><b>⬆️ Voting</b><br/>Upvote/downvote with live updates</td>
    <td align="center"><b>💬 Comments</b><br/>Threaded, nested, collapsible</td>
    <td align="center"><b>📰 Feeds</b><br/>Hot/New/Top/Rising/Controversial</td>
  </tr>
  <tr>
    <td align="center"><b>🔍 Search</b><br/>Posts, communities & users</td>
    <td align="center"><b>👤 Profiles</b><br/>History & karma breakdown</td>
    <td align="center"><b>📱 Mobile</b><br/>Responsive with bottom nav</td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Category | Choice |
|----------|--------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + shadcn/ui |
| **Database** | [SQLite](https://www.sqlite.org/) via [Drizzle ORM](https://orm.drizzle.team/) + better-sqlite3 |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) (Auth.js) with credentials provider |
| **Validation** | [Zod](https://zod.dev/) |
| **Icons** | [Lucide](https://lucide.dev/) |
| **Typography** | Inter + Plus Jakarta Sans |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.9+
- **npm**

### Installation

```bash
git clone https://github.com/mafiatamilan/Ryde.git
cd ryde
npm install
```

### Environment Variables

Create a `.env` file at the root:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-change-in-production"
```

### Database Setup

```bash
# Generate and apply migrations
npm run db:generate
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### Development

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — the app has 4 users, 4 communities, and sample posts ready to explore.

### 👥 Sample Accounts

After seeding, log in with any of these:

| Username | Email | Password |
|----------|-------|----------|
| **admin** | admin@example.com | `password123` |
| **alice** | alice@example.com | `password123` |
| **bob** | bob@example.com | `password123` |
| **charlie** | charlie@example.com | `password123` |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/              # Authenticated app shell
│   │   ├── page.tsx              # Home feed
│   │   ├── all/page.tsx          # All posts (new)
│   │   ├── popular/page.tsx      # Popular feed
│   │   ├── trending/page.tsx     # Trending feed
│   │   ├── search/page.tsx       # Search results
│   │   ├── submit/page.tsx       # Create a post
│   │   ├── post/[id]/            # Post detail + comments
│   │   ├── r/[slug]/             # Community page
│   │   ├── r/create/             # Create a community
│   │   └── u/[username]/         # User profile
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── api/                     # API route handlers
├── components/
│   ├── ui/                      # shadcn-style primitives
│   └── layout/                  # Sidebar, TopNav, BottomNav
├── db/
│   ├── index.ts                 # DB connection
│   ├── schema/
│   │   ├── auth.ts              # Auth.js tables
│   │   └── index.ts             # All domain tables
│   └── seed.ts                  # Seed script
├── lib/
│   ├── auth.ts                  # NextAuth config
│   └── utils.ts                 # Helpers
└── types/
    └── next-auth.d.ts           # Auth type augmentation
```

---

## 🗄️ Database Schema

| Entity | Purpose |
|--------|---------|
| `user` | Accounts with karma, bio, auth fields |
| `account` / `session` / `verificationToken` | NextAuth.js plumbing |
| `community` | Subreddits — type (public/restricted/private), rules, flairs |
| `membership` | User ↔ community join with role (member/moderator/admin) |
| `post` | Posts — type (text/link/image/video/poll), score, NSFW/spoiler flags |
| `comment` | Nested comments with depth tracking, soft delete |
| `vote` | +1/-1 votes on posts or comments (one per user per item) |
| `notification` | Reply, mention, upvote milestone, award, mod action alerts |
| `savedItem` | Bookmarked posts and comments |
| `award` | Gold/silver/custom awards on content |
| `report` | Content reports with moderation workflow |
| `modAction` | Moderator action audit log |

---

## 🌐 API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | Auth.js handler |
| `/api/auth/register` | POST | Create account |
| `/api/communities` | GET, POST | List / create communities |
| `/api/communities/[slug]` | GET, DELETE | Get / delete community |
| `/api/communities/[slug]/join` | POST, DELETE | Join / leave community |
| `/api/posts` | GET, POST | List (with sort) / create posts |
| `/api/posts/[id]` | GET | Post detail + comments |
| `/api/votes` | POST | Cast vote (+1/-1/0) |
| `/api/comments` | POST, DELETE | Create / soft-delete comment |
| `/api/search` | GET | Search across posts, communities, users |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly (dev) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Launch Drizzle Studio GUI |

---

<div align="center">
  <sub>Built with ❤️ using Next.js, Drizzle, and TypeScript</sub>
</div>
