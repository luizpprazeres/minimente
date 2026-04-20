"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Flame, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { Lang } from "@/lib/copy";
import { sessionCopy, c } from "@/lib/copy";

// S3: count-up animation for numeric stats
function useCountUp(target: number, durationMs = 1000, delayMs = 400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / durationMs, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, delayMs]);
  return value;
}

interface SessionSummaryProps {
  questionsAnswered: number;
  accuracy: number;
  xpEarned: number;
  streakMaintained?: boolean;
  lang?: Lang;
  onRestart?: () => void;
}

export function SessionSummary({
  questionsAnswered,
  accuracy,
  xpEarned,
  streakMaintained,
  lang = "en",
  onRestart,
}: SessionSummaryProps) {
  const animQ = useCountUp(questionsAnswered, 800, 300);
  const animAcc = useCountUp(accuracy, 900, 500);
  const animXP = useCountUp(xpEarned, 1000, 700);

  const stats = [
    { key: "questions", label: c(sessionCopy.summary.questions, lang), value: String(animQ), color: "text-green-600" },
    { key: "accuracy", label: c(sessionCopy.summary.accuracy, lang), value: `${animAcc}%`, color: "text-blue-600" },
    { key: "xp", label: c(sessionCopy.summary.xp, lang), value: `+${animXP}`, color: "text-cinnamon-500" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 text-center max-w-md mx-auto">
      {/* S3: spring pop celebration */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-cinnamon-100"
      >
        <Star className="h-8 w-8 text-cinnamon-500" />
      </motion.div>

      <div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display text-2xl font-semibold text-neutral-800"
        >
          {c(sessionCopy.summary.title, lang)}
        </motion.h2>
        {streakMaintained && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1 flex items-center justify-center gap-1 text-sm text-orange-500 font-medium"
          >
            <Flame className="h-4 w-4" />
            {c(sessionCopy.summary.streakKept, lang)}
          </motion.p>
        )}
      </div>

      {/* Stats — staggered reveal */}
      <div className="w-full space-y-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
          >
            <span className="text-sm text-neutral-600">{stat.label}</span>
            <span className={`text-lg font-semibold ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex w-full gap-3"
      >
        {onRestart && (
          <button
            onClick={onRestart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            {c(sessionCopy.summary.restartBtn, lang)}
          </button>
        )}
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center rounded-xl bg-cinnamon-500 py-2.5 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors"
        >
          {c(sessionCopy.summary.dashboardBtn, lang)}
        </Link>
      </motion.div>
    </div>
  );
}
