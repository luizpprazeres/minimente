"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Lang } from "@/lib/copy";
import { sessionCopy, c } from "@/lib/copy";

const MILESTONES = [25, 50, 75]; // S3: % thresholds for celebration pulse

interface SessionProgressProps {
  current: number;
  total: number;
  lang?: Lang;
  onBack?: () => void;
}

export function SessionProgress({ current, total, lang = "en", onBack }: SessionProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const controls = useAnimation();
  const prevMilestoneRef = useRef<number>(-1);

  // S3: celebrate each 25/50/75% milestone with a bar pulse
  useEffect(() => {
    const crossed = MILESTONES.filter(
      (m) => percentage >= m && prevMilestoneRef.current < m
    );
    if (crossed.length > 0) {
      prevMilestoneRef.current = crossed[crossed.length - 1];
      controls.start({
        scaleY: [1, 1.8, 1],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }
  }, [percentage, controls]);

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
            {c(sessionCopy.progress.question, lang)} {current} {c(sessionCopy.progress.of, lang)} {total}
          </span>
          <span className="text-xs text-neutral-400">{Math.round(percentage)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-cinnamon-500 origin-left"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ overflow: "visible" }}
          >
            <motion.div
              className="h-full w-full rounded-full bg-cinnamon-400"
              animate={controls}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
