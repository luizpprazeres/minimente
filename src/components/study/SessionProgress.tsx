"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SessionProgressProps {
  current: number;
  total: number;
  onBack?: () => void;
}

export function SessionProgress({ current, total, onBack }: SessionProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-white">
      {onBack ? (
        <button
          onClick={onBack}
          className="p-1 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : (
        <Link
          href="/dashboard"
          className="p-1 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-neutral-500">
            Q {current} of {total}
          </span>
          <span className="text-xs text-neutral-400">{Math.round(percentage)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-cinnamon-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
