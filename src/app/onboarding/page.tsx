"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const DAILY_GOALS = [
  { value: 10, label: "10 questions", description: "Light — ~10 min/day" },
  { value: 20, label: "20 questions", description: "Moderate — ~20 min/day" },
  { value: 40, label: "40 questions", description: "Intensive — ~40 min/day" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      await db
        .from("user_profiles")
        .update({ onboarding_done: true, language_pref: language })
        .eq("user_id", user.id);

      await db
        .from("user_settings")
        .update({ daily_goal: dailyGoal })
        .eq("user_id", user.id);
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cinnamon-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-neutral-200 p-8 space-y-8">
        <div className="text-center">
          <span className="font-display text-3xl font-semibold text-cinnamon-500">
            mini<span className="text-neutral-800">MENTE</span>
          </span>
          <h2 className="mt-4 text-xl font-semibold text-neutral-800">Welcome! Let&apos;s set up your study profile.</h2>
        </div>

        {/* Language */}
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-3">Preferred language</p>
          <div className="grid grid-cols-2 gap-3">
            {(["en", "pt"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={cn(
                  "rounded-xl border py-3 text-sm font-medium transition-colors",
                  language === lang
                    ? "border-cinnamon-500 bg-cinnamon-50 text-cinnamon-600"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {lang === "en" ? "🇦🇺 English" : "🇧🇷 Português"}
              </button>
            ))}
          </div>
        </div>

        {/* Daily goal */}
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-3">Daily study goal</p>
          <div className="space-y-2">
            {DAILY_GOALS.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => setDailyGoal(goal.value)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                  dailyGoal === goal.value
                    ? "border-cinnamon-500 bg-cinnamon-50"
                    : "border-neutral-300 bg-white hover:bg-neutral-50"
                )}
              >
                <span className={cn("font-medium", dailyGoal === goal.value ? "text-cinnamon-600" : "text-neutral-800")}>
                  {goal.label}
                </span>
                <span className="text-neutral-400">{goal.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className="w-full rounded-xl bg-cinnamon-500 py-3 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : "Start Studying →"}
        </button>
      </div>
    </div>
  );
}
