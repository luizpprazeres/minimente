"use client";

import { useState, useEffect } from "react";
import { ChevronRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { TopicItem } from "./TopicItem";
import { cn } from "@/lib/utils";
import type { Subject, Topic, MasteryLevel } from "@/types/database";

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  novice: "Novice",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  fellow: "Fellow",
};

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  novice: "bg-neutral-300 text-neutral-700",
  beginner: "bg-blue-100 text-blue-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-orange-100 text-orange-700",
  fellow: "bg-cinnamon-100 text-cinnamon-700",
};

interface DomainItemProps {
  subject: Subject;
  mastery: MasteryLevel;
  accuracy: number;
  questionCount: number;
  activeTopicId?: string;
  onTopicSelect?: (topicId: string) => void;
  onStudy?: (subjectId: string) => void;
}

export function DomainItem({
  subject,
  mastery,
  accuracy,
  questionCount,
  activeTopicId,
  onTopicSelect,
  onStudy,
}: DomainItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Lazy-load topics on expand
  useEffect(() => {
    if (!expanded || topics.length > 0) return;
    setLoadingTopics(true);

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("topics")
      .select("*")
      .eq("subject_id", subject.id)
      .order("sort_order")
      .then(({ data }: { data: Topic[] | null }) => {
        setTopics(data ?? []);
        setLoadingTopics(false);
      });
  }, [expanded, subject.id, topics.length]);

  return (
    <div className="group">
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      >
        {/* Color dot */}
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: subject.color_hex }}
        />

        {/* Icon */}
        <BookOpen className="h-4 w-4 text-neutral-400 shrink-0" />

        {/* Name + count */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 truncate">{subject.name_en}</p>
          <p className="text-xs text-neutral-400">{questionCount} questions</p>
        </div>

        {/* Mastery badge */}
        <span
          className={cn(
            "hidden group-hover:inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium",
            MASTERY_COLORS[mastery]
          )}
        >
          {MASTERY_LABELS[mastery]}
        </span>

        {/* Accuracy */}
        <span className="text-xs text-neutral-500 shrink-0">{accuracy}%</span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        </motion.div>
      </div>

      {/* Study on hover */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-8 pr-2"
          >
            {/* Study button */}
            <button
              onClick={(e) => { e.stopPropagation(); onStudy ? onStudy(subject.id) : (window.location.href = `/practice/session?domain=${subject.id}`); }}
              className="mb-1 w-full rounded-lg bg-cinnamon-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cinnamon-600 transition-colors"
            >
              Study this domain
            </button>

            {/* Topics */}
            {loadingTopics ? (
              <div className="space-y-1 py-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded-lg bg-neutral-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5 py-1">
                {topics.map((topic) => (
                  <TopicItem
                    key={topic.id}
                    topic={topic}
                    active={activeTopicId === topic.id}
                    completionPct={0} // TODO: real completion from user_domain_mastery
                    onSelect={onTopicSelect ?? (() => {})}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
