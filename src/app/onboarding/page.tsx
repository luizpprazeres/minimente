"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const DAILY_GOALS = [
  {
    value: 10,
    label: "10 questions · ~10 min",
    labelPt: "10 questões · ~10 min",
    badge: "Light",
    badgePt: "Leve",
  },
  {
    value: 20,
    label: "20 questions · ~20 min",
    labelPt: "20 questões · ~20 min",
    badge: "Moderate",
    badgePt: "Moderado",
    recommended: true,
  },
  {
    value: 40,
    label: "40 questions · ~40 min",
    labelPt: "40 questões · ~40 min",
    badge: "Intensive",
    badgePt: "Intensivo",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [loading, setLoading] = useState(false);
  const logoRef = useRef<HTMLSpanElement>(null);

  const t = (en: string, pt: string) => (language === "en" ? en : pt);

  // anime.js v4: logo entrance timeline on mount
  useEffect(() => {
    if (!logoRef.current) return;
    import("animejs").then((mod) => {
      const { createTimeline } = mod;
      createTimeline({ defaults: { ease: "outExpo" } })
        .add(logoRef.current!, {
          translateY: [-20, 0],
          opacity: [0, 1],
          duration: 700,
        })
        .add(logoRef.current!, {
          scale: [1, 1.06, 1],
          duration: 500,
          ease: "inOutSine",
        }, "-=200");
    });
  }, []);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-cinnamon-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-neutral-200 p-6 sm:p-8 space-y-8"
      >
        <div className="text-center">
          <span
            ref={logoRef}
            style={{ opacity: 0 }}
            className="font-display text-3xl font-semibold text-cinnamon-500"
          >
            mini<span className="text-neutral-800">MENTE</span>
          </span>
          <h2 className="mt-4 text-xl font-semibold text-neutral-800">
            {t(
              "Let's personalize your experience",
              "Vamos personalizar sua experiência"
            )}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {t(
              "Answer 2 quick questions to get you started right.",
              "Responda 2 perguntinhas para começarmos do jeito certo."
            )}
          </p>
        </div>

        {/* Language selector */}
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-3">
            {t("What's your preferred language?", "Qual idioma você prefere?")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["en", "pt"] as const).map((lang) => (
              <motion.button
                key={lang}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "rounded-xl border py-3 text-sm font-medium transition-colors",
                  language === lang
                    ? "border-cinnamon-500 bg-cinnamon-50 text-cinnamon-600"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {lang === "en" ? "🇦🇺 English" : "🇧🇷 Português"}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Daily goal */}
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-3">
            {t("How many questions per day?", "Quantas questões por dia?")}
          </p>
          <div className="space-y-2">
            {DAILY_GOALS.map((goal) => (
              <motion.button
                key={goal.value}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setDailyGoal(goal.value)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                  dailyGoal === goal.value
                    ? "border-cinnamon-500 bg-cinnamon-50"
                    : "border-neutral-300 bg-white hover:bg-neutral-50"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    dailyGoal === goal.value ? "text-cinnamon-600" : "text-neutral-800"
                  )}
                >
                  {language === "en" ? goal.label : goal.labelPt}
                </span>
                <div className="flex items-center gap-1.5">
                  {goal.recommended && (
                    <span className="text-xs text-cinnamon-500 font-medium">
                      {t("recommended", "recomendado")}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">
                    {language === "en" ? goal.badge : goal.badgePt}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleComplete}
          disabled={loading}
          className="w-full rounded-xl bg-cinnamon-500 py-3 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? t("Saving…", "Salvando…")
            : t("Let's go →", "Começar agora →")}
        </motion.button>
      </motion.div>
    </div>
  );
}
