"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutGrid, BarChart2, BookMarked, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/practice", icon: BookOpen, label: "Study" },
  { href: "/dashboard", icon: LayoutGrid, label: "Domains" },
  { href: "/progress", icon: BarChart2, label: "Progress" },
  { href: "/vocab", icon: BookMarked, label: "Vocab" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around border-t border-neutral-200 bg-neutral-50 px-2 py-1 safe-area-inset-bottom">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        // B6 fix: exact match for dashboard, prefix for others to handle sub-routes
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
              active
                ? "text-cinnamon-500"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            <Icon
              className={cn("h-5 w-5", active && "text-cinnamon-500")}
              strokeWidth={active ? 2.5 : 1.75}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
