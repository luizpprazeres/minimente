import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DueCardsCount } from "./DueCardsCount";
import { StreakDisplay } from "./StreakDisplay";
import { GoalProgress } from "./GoalProgress";
import { AlertTriangle } from "lucide-react";
import type { AmcDomain } from "@/types/database";

const DOMAIN_NAMES: Record<AmcDomain, string> = {
  adult_medicine: "Adult Medicine",
  adult_surgery: "Adult Surgery",
  womens_health: "Women's Health",
  child_health: "Child Health",
  mental_health: "Mental Health",
  population_health: "Population Health",
};

interface PerformancePanelProps {
  userId: string;
}

export async function PerformancePanel({ userId }: PerformancePanelProps) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [
    { data: streakData },
    { data: settingsData },
    { data: masteryData },
    { count: dueCount },
  ] = await Promise.all([
    db.from("user_streaks").select("current_streak, longest_streak").eq("user_id", userId).single(),
    db.from("user_settings").select("daily_goal").eq("user_id", userId).single(),
    db.from("user_domain_mastery")
      .select("domain, accuracy_percentage")
      .eq("user_id", userId)
      .order("accuracy_percentage"),
    db.from("fsrs_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due_date", new Date().toISOString()),
  ]);

  const streak = streakData?.current_streak ?? 0;
  const longest = streakData?.longest_streak ?? 0;
  const dailyGoal = settingsData?.daily_goal ?? 20;
  const weakest = masteryData?.[0]?.domain as AmcDomain | undefined;

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 px-1">
        Performance
      </h2>

      <DueCardsCount count={dueCount ?? 0} />
      <GoalProgress answered={0} goal={dailyGoal} />
      <StreakDisplay streak={streak} longest={longest} />

      {/* Weakest area */}
      {weakest && (
        <div className="flex items-center gap-2 rounded-xl border border-warning bg-warning-light p-3">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-600">Weakest area</p>
            <p className="text-sm font-medium text-neutral-800 truncate">
              {DOMAIN_NAMES[weakest]}
            </p>
          </div>
        </div>
      )}

      {/* Start session CTA */}
      <Link
        href="/practice/session"
        className="flex w-full items-center justify-center rounded-xl bg-cinnamon-500 py-3 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors"
      >
        Start Session
      </Link>
    </div>
  );
}
