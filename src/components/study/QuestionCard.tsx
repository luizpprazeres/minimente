"use client";

import { useEffect, useReducer, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import { ExplanationPanel } from "./ExplanationPanel";
import { MediaDisplay } from "./MediaDisplay";
import type { Question, QuestionOption, Explanation } from "@/types/database";

// ── State Machine ──

type Grade = 1 | 2 | 3 | 4; // FSRS grades (Again / Hard / Good / Easy)

type QuestionState =
  | { phase: "idle" }
  | { phase: "selected"; selectedLabel: string }
  | { phase: "revealed"; selectedLabel: string; isCorrect: boolean };

type Action =
  | { type: "SELECT"; label: string }
  | { type: "CONFIRM" }
  | { type: "RESET" };

function reducer(state: QuestionState, action: Action): QuestionState {
  switch (action.type) {
    case "SELECT":
      if (state.phase === "idle")
        return { phase: "selected", selectedLabel: action.label };
      return state;
    case "CONFIRM":
      if (state.phase === "selected")
        return { ...state, phase: "revealed", isCorrect: false }; // isCorrect set by parent
      return state;
    case "RESET":
      return { phase: "idle" };
    default:
      return state;
  }
}

// ── Component ──

interface QuestionCardProps {
  question: Question;
  options: QuestionOption[];
  explanation?: Explanation;
  language?: "en" | "pt";
  onAnswer: (label: string, isCorrect: boolean, grade: Grade) => void;
  onNext: () => void;
  autoAdvanceMs?: number;
}

export function QuestionCard({
  question,
  options,
  explanation,
  language = "en",
  onAnswer,
  onNext,
  autoAdvanceMs = 3000,
}: QuestionCardProps) {
  const [state, dispatch] = useReducer(reducer, { phase: "idle" });

  const correctLabel = options.find((o) => o.is_correct)?.label;
  const stem = language === "en" ? question.stem_en : question.stem_pt;
  const isRevealed = state.phase === "revealed";

  // Compute option states
  function getOptionState(label: string): AnswerState {
    if (state.phase === "idle") return "idle";
    if (state.phase === "selected") {
      return state.selectedLabel === label ? "selected" : "idle";
    }
    // revealed
    if (label === correctLabel) return "revealed-correct";
    if (label === state.selectedLabel) return "revealed-wrong-selection";
    return "revealed-incorrect";
  }

  // Confirm answer on selection
  const handleSelect = useCallback(
    (label: string) => {
      if (state.phase !== "idle") return;
      dispatch({ type: "SELECT", label });

      const isCorrect = label === correctLabel;
      // Grade: 3=Good for correct, 1=Again for wrong (simple default)
      const grade: Grade = isCorrect ? 3 : 1;
      onAnswer(label, isCorrect, grade);

      // Immediately go to revealed (single-click reveal)
      setTimeout(() => {
        dispatch({ type: "CONFIRM" });
      }, 50);
    },
    [state.phase, correctLabel, onAnswer]
  );

  // Keyboard navigation
  useEffect(() => {
    const LABELS = ["a", "b", "c", "d", "e"] as const;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        if (isRevealed) onNext();
        return;
      }
      const idx = LABELS.indexOf(e.key.toLowerCase() as (typeof LABELS)[number]);
      if (idx !== -1 && options[idx] && state.phase === "idle") {
        handleSelect(options[idx].label);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRevealed, onNext, options, state.phase, handleSelect]);

  // Auto-advance after explanation shown
  useEffect(() => {
    if (!isRevealed || !autoAdvanceMs) return;
    const t = setTimeout(onNext, autoAdvanceMs);
    return () => clearTimeout(t);
  }, [isRevealed, onNext, autoAdvanceMs]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl mx-auto"
        role="radiogroup"
        aria-label="Answer options"
      >
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {/* Question body */}
          <div className="p-6 space-y-4">
            {/* Media */}
            {question.media_url && (
              <MediaDisplay url={question.media_url} type={question.media_type} />
            )}

            {/* Stem */}
            <p className="text-base leading-relaxed text-neutral-800">{stem}</p>

            {/* Options */}
            <div className="space-y-2.5">
              {options.map((option) => (
                <AnswerOption
                  key={option.id}
                  label={option.label}
                  text={language === "en" ? option.text_en : option.text_pt}
                  state={getOptionState(option.label)}
                  disabled={state.phase !== "idle"}
                  onSelect={() => handleSelect(option.label)}
                />
              ))}
            </div>
          </div>

          {/* Explanation panel */}
          {explanation && (
            <div className="px-6 pb-4">
              <ExplanationPanel
                open={isRevealed}
                keyConcept={language === "en" ? explanation.key_concept_en : explanation.key_concept_pt}
                explanation={language === "en" ? explanation.explanation_en : explanation.explanation_pt}
                reasoningSteps={
                  Array.isArray(explanation.reasoning_steps)
                    ? (explanation.reasoning_steps as { step: number; text: string }[])
                    : []
                }
                sourceRefs={
                  Array.isArray(explanation.source_refs)
                    ? (explanation.source_refs as string[])
                    : []
                }
              />
            </div>
          )}

          {/* Next button */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-6"
            >
              <button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cinnamon-500 py-3 text-sm font-semibold text-white hover:bg-cinnamon-600 transition-colors"
              >
                Next question
                <ChevronRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-center text-xs text-neutral-400">
                Auto-advancing in {Math.round(autoAdvanceMs / 1000)}s · Press → to skip
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
