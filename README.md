# RedditClone

A full-featured Reddit clone built with Next.js 16, Drizzle ORM, SQLite, and NextAuth.js.

## Features

- **Auth** — Email/password registration & login with NextAuth.js, JWT sessions
- **Communities** — Create, browse, and join/leave communities (public/restricted/private)
- **Posts** — Text, link, and image posts with voting
- **Comments** — Threaded, infinitely-nested comments with collapse/expand and per-depth colored borders
- **Voting** — Upvote/downvote on posts and comments with real-time score updates
- **Feeds** — Home, Popular, All, Trending with Hot/New/Top/Rising/Controversial sorting
- **Search** — Global search across posts, communities, and users
- **Profiles** — User profiles with post/comment history and karma breakdown
- **Mobile** — Bottom navigation bar on small screens with responsive layout
- **Dark Mode** — Dark-mode-first design with indigo accent color
- **Toasts** — Notification toast system for actions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, shadcn/ui components |
| Database | SQLite via Drizzle ORM + better-sqlite3 |
| Auth | NextAuth.js v5 (Auth.js) with credentials provider |
| Forms | Zod validation |
| Icons | Lucide React |
| Fonts | Inter + Plus Jakarta Sans |

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm

### Installation

```bash
git clone <repo-url>
cd reddit_clone
npm install
```

### Environment Variables

Create a `.env` file (already provided for dev):

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-change-in-production"
AUTH_URL="http://localhost:3000"
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

Open [http://localhost:3000](http://localhost:3000).

### Sample Accounts

After seeding:

| Username | Email | Password |
|----------|-------|----------|
| admin | admin@example.com | password123 |
| alice | alice@example.com | password123 |
| bob | bob@example.com | password123 |
| charlie | charlie@example.com | password123 |

## Project Structure

```
src/
├── app/
│   ├── (main)/          # Main app layout with sidebar + topnav
│   │   ├── page.tsx          # Home feed
│   │   ├── all/page.tsx      # All posts feed
│   │   ├── popular/page.tsx  # Popular feed
│   │   ├── trending/page.tsx # Trending feed
│   │   ├── search/page.tsx   # Search results
│   │   ├── submit/page.tsx   # Create post
│   │   ├── post/[id]/        # Post detail + comments
│   │   ├── r/[slug]/         # Community page
│   │   └── u/[username]/     # User profile
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Registration page
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # shadcn-style UI primitives
│   └── layout/               # Sidebar, TopNav, BottomNav
├── db/
│   ├── index.ts              # Database connection
│   ├── schema/
│   │   ├── auth.ts           # Auth.js tables
│   │   └── index.ts          # All application tables
│   └── seed.ts               # Seed script
└── lib/
    ├── auth.ts               # NextAuth configuration
    └── utils.ts              # Utility functions
```

## Database Schema

- **user** — User accounts with karma, bio, and auth fields
- **account / session / verificationToken** — NextAuth.js tables
- **community** — Subreddits with type (public/restricted/private), rules, flairs
- **membership** — User-community join table with role (member/moderator/admin)
- **post** — Posts with type (text/link/image/video/poll), score, flags
- **comment** — Nested comments with depth tracking and soft delete
- **vote** — User vote on posts/comments (+1/-1)
- **notification** — User notifications (reply, mention, upvote, award, mod action)
- **savedItem** — Saved/bookmarked posts and comments
- **award** — Gold/silver/custom awards on posts/comments
- **report** — Content reports with moderation status
- **modAction** — Moderator action log

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | GET/POST | Auth.js handlers |
| `/api/auth/register` | POST | User registration |
| `/api/communities` | GET/POST | List/create communities |
| `/api/communities/[slug]` | GET/DELETE | Get/delete community |
| `/api/communities/[slug]/join` | POST/DELETE | Join/leave community |
| `/api/posts` | GET/POST | List/create posts (supports sort params) |
| `/api/posts/[id]` | GET | Get post with comments |
| `/api/votes` | POST | Cast vote on post/comment |
| `/api/comments` | POST/DELETE | Create/delete comment |
| `/api/search` | GET | Search posts, communities, users |

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:migrate` — Apply migrations
- `npm run db:push` — Push schema changes directly
- `npm run db:seed` — Seed database with sample data
- `npm run db:studio` — Launch Drizzle Studio
