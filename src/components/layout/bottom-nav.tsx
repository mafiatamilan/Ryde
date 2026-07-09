"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Flame, Globe, TrendingUp, Plus, Search } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Popular", href: "/popular", icon: Flame },
  { label: "Create", href: "/submit", icon: Plus },
  { label: "Search", href: "/search", icon: Search },
  { label: "All", href: "/all", icon: Globe },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950 lg:hidden">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}