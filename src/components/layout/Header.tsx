"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/contexts/LangContext";

interface HeaderProps {
  streak?: number;
  xp?: number;
  avatarUrl?: string | null;
  className?: string;
}

/** Format large XP numbers for small screens (e.g. 1234 → "1.2k") */
function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}k`;
  return xp.toLocaleString();
}

export function Header({ streak = 0, xp = 0, avatarUrl, className }: HeaderProps) {
  const { lang, setLang } = useLang();

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4",
        className
      )}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
        <span className="font-display text-xl font-semibold text-cinnamon-500 group-hover:text-cinnamon-600 transition-colors">
          mini<span className="text-neutral-800">MENTE</span>
        </span>
      </Link>

      {/* Right: streak + XP + lang toggle + avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {streak > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
            <Flame
              className="h-4 w-4 animate-[pulse_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0ms" }}
            />
            <span>{streak}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm font-medium text-cinnamon-600">
          <Star className="h-4 w-4 shrink-0" />
          <span className="hidden xs:inline">{formatXP(xp)}</span>
          <span className="hidden xs:inline text-xs font-normal opacity-70">XP</span>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "pt" : "en")}
          className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
          aria-label="Toggle language"
        >
          {lang === "en" ? (
            <><span>🇦🇺</span><span className="hidden sm:inline">EN</span></>
          ) : (
            <><span>🇧🇷</span><span className="hidden sm:inline">PT</span></>
          )}
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-cinnamon-100 flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="User avatar"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-cinnamon-500" />
          )}
        </div>
      </div>
    </header>
  );
}
