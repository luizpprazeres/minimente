"use client";

import { motion } from "framer-motion";

interface GoalProgressProps {
  answered: number;
  goal: number;
}

export function GoalProgress({ answered, goal }: GoalProgressProps) {
  const pct = Math.min(100, goal > 0 ? Math.round((answered / goal) * 100) : 0);
  const complete = answered >= goal;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-700">Daily goal</span>
        <span className="text-sm font-semibold text-neutral-800">
          {answered}/{goal}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${complete ? "bg-success" : "bg-cinnamon-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {complete && (
        <p className="text-xs text-success font-medium text-center">Goal reached! 🎉</p>
      )}
    </div>
  );
}
