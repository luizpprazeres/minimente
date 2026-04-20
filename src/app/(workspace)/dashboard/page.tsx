"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Brain, Target } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Spaced Repetition",
    desc: "Science-backed algorithm that shows you cards exactly when you need them.",
    color: "bg-cinnamon-50 border-cinnamon-200",
    iconColor: "text-cinnamon-500",
  },
  {
    icon: Target,
    title: "Exam-Ready",
    desc: "Questions written to match real AMC MCQ format with detailed explanations.",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    icon: Sparkles,
    title: "Smart Insights",
    desc: "Track your weak areas and focus your energy where it matters most.",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center py-8 sm:py-12"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-800">
          Ready to study today?
        </h1>
        <p className="mt-2 max-w-md mx-auto text-sm sm:text-base text-neutral-500">
          Your personalized session is ready. Pick up where you left off.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mt-6"
        >
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 rounded-xl bg-cinnamon-500 px-6 py-3 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors shadow-sm"
          >
            Start session
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature cards — staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto w-full">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
            className={`rounded-2xl border p-4 ${f.color}`}
          >
            <f.icon className={`h-5 w-5 mb-2 ${f.iconColor}`} />
            <p className="text-sm font-semibold text-neutral-800">{f.title}</p>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
