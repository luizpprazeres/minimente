"use client";

import Link from "next/link";
import { Flame, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  streak?: number;
  xp?: number;
  avatarUrl?: string | null;
  className?: string;
}

export function Header({ streak = 0, xp = 0, avatarUrl, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4",
        className
      )}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <span className="font-display text-xl font-semibold text-cinnamon-500 group-hover:text-cinnamon-600 transition-colors">
          mini<span className="text-neutral-800">MENTE</span>
        </span>
      </Link>

      {/* Right: streak + XP + avatar */}
      <div className="flex items-center gap-4">
        {streak > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
            <Flame className="h-4 w-4" />
            <span>{streak}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm font-medium text-cinnamon-600">
          <Star className="h-4 w-4" />
          <span>{xp.toLocaleString()} XP</span>
        </div>

        <div className="h-8 w-8 rounded-full bg-cinnamon-100 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-cinnamon-500" />
          )}
        </div>
      </div>
    </header>
  );
}
