"use client";

import { cn } from "@/lib/utils";
import type { Topic } from "@/types/database";

interface TopicItemProps {
  topic: Topic;
  active: boolean;
  completionPct: number;
  onSelect: (topicId: string) => void;
}

export function TopicItem({ topic, active, completionPct, onSelect }: TopicItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(topic.id)}
      className={cn(
        "w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-cinnamon-100 text-cinnamon-700 font-medium"
          : "text-neutral-600 hover:bg-neutral-100"
      )}
    >
      <span className="truncate">{topic.name_en}</span>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <div className="h-1 w-12 rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-cinnamon-400"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="text-xs text-neutral-400 w-8 text-right">{completionPct}%</span>
      </div>
    </button>
  );
}
