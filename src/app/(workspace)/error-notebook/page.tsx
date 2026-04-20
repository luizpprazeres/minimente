"use client";

import { useEffect, useState } from "react";
import { BookMarked, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const DOMAIN_LABELS: Record<string, string> = {
  adult_medicine: "Adult Medicine",
  adult_surgery: "Adult Surgery",
  womens_health: "Women's Health",
  child_health: "Child Health",
  mental_health: "Mental Health",
  population_health: "Population Health",
};

const DOMAIN_COLORS: Record<string, string> = {
  adult_medicine: "bg-blue-50 text-blue-700 border-blue-200",
  adult_surgery: "bg-orange-50 text-orange-700 border-orange-200",
  womens_health: "bg-pink-50 text-pink-700 border-pink-200",
  child_health: "bg-green-50 text-green-700 border-green-200",
  mental_health: "bg-purple-50 text-purple-700 border-purple-200",
  population_health: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

interface ErrorNotebookEntry {
  id: string;
  note: string | null;
  review_count: number;
  added_at: string;
  last_reviewed_at: string | null;
  question: {
    id: string;
    stem_en: string;
    stem_pt: string;
    amc_domain: string;
    difficulty_b: number;
  } | null;
}

export default function ErrorNotebookPage() {
  const [items, setItems] = useState<ErrorNotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/error-notebook")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(questionId: string) {
    setRemoving(questionId);
    try {
      await fetch("/api/error-notebook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      setItems((prev) => prev.filter((item) => item.question?.id !== questionId));
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-3 max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cinnamon-100">
          <BookMarked className="h-5 w-5 text-cinnamon-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Error Notebook</h1>
          <p className="text-sm text-neutral-500">
            {items.length === 0
              ? "No questions saved yet"
              : `${items.length} question${items.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">
          <BookMarked className="h-10 w-10 text-neutral-300" />
          <div>
            <p className="font-medium text-neutral-600">Your notebook is empty</p>
            <p className="mt-1 text-sm text-neutral-400">
              After answering a question wrong, tap &quot;Add to error notebook&quot; to save it here.
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => {
          if (!item.question) return null;
          const domain = item.question.amc_domain;
          const domainLabel = DOMAIN_LABELS[domain] ?? domain;
          const domainColor = DOMAIN_COLORS[domain] ?? "bg-neutral-50 text-neutral-600 border-neutral-200";
          const addedDate = new Date(item.added_at).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={item.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3 shadow-sm"
            >
              {/* Domain + date */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    domainColor
                  )}
                >
                  {domainLabel}
                </span>
                <div className="flex items-center gap-3">
                  {item.review_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <RotateCcw className="h-3 w-3" />
                      {item.review_count}× reviewed
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">{addedDate}</span>
                </div>
              </div>

              {/* Stem */}
              <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3">
                {item.question.stem_en}
              </p>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleRemove(item.question!.id)}
                  disabled={removing === item.question.id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
