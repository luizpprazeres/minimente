"use client";

import { motion } from "framer-motion";
import { Check, Star, Flame, RotateCcw } from "lucide-react";
import Link from "next/link";

interface SessionSummaryProps {
  questionsAnswered: number;
  accuracy: number;
  xpEarned: number;
  streakMaintained?: boolean;
  onRestart?: () => void;
}

const STATS = [
  { key: "questions", icon: Check, label: "Questions answered", color: "text-success" },
  { key: "accuracy", icon: Check, label: "Accuracy", color: "text-info" },
  { key: "xp", icon: Star, label: "XP earned", color: "text-cinnamon-500" },
] as const;

export function SessionSummary({
  questionsAnswered,
  accuracy,
  xpEarned,
  streakMaintained,
  onRestart,
}: SessionSummaryProps) {
  const stats = [
    { ...STATS[0], value: String(questionsAnswered) },
    { ...STATS[1], value: `${accuracy}%` },
    { ...STATS[2], value: `+${xpEarned}` },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 text-center max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-cinnamon-100"
      >
        <Star className="h-8 w-8 text-cinnamon-500" />
      </motion.div>

      <div>
        <h2 className="font-display text-2xl font-semibold text-neutral-800">Session Complete!</h2>
        {streakMaintained && (
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-orange-500 font-medium">
            <Flame className="h-4 w-4" />
            Streak maintained
          </p>
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
      <div className="flex w-full gap-3">
        {onRestart && (
          <button
            onClick={onRestart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Study again
          </button>
        )}
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center rounded-xl bg-cinnamon-500 py-2.5 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
