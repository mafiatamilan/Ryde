"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Flame,
  TrendingUp,
  Globe,
  Home,
  Plus,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Community {
  id: string;
  name: string;
  slug: string;
}

const mainFeeds = [
  { label: "Home", href: "/", icon: Home },
  { label: "Popular", href: "/popular", icon: Flame },
  { label: "All", href: "/all", icon: Globe },
  { label: "Trending", href: "/trending", icon: TrendingUp },
];

export function SidebarClient({
  communities,
}: {
  communities: Community[];
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">
      <div className="p-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg text-zinc-100">RedditClone</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Feeds
          </p>
          {mainFeeds.map((feed) => {
            const Icon = feed.icon;
            const isActive =
              feed.href === "/" ? pathname === "/" : pathname.startsWith(feed.href);
            return (
              <Link
                key={feed.href}
                href={feed.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {feed.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Communities
            </p>
            <Link href="/r/create">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/r/${c.slug}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <Hash className="h-4 w-4" />
              <span>r/{c.name}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}