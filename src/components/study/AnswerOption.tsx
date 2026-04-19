"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnswerState =
  | "idle"
  | "selected"
  | "revealed-correct"
  | "revealed-incorrect"
  | "revealed-wrong-selection";

interface AnswerOptionProps {
  label: "A" | "B" | "C" | "D" | "E";
  text: string;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
}

export function AnswerOption({ label, text, state, disabled, onSelect }: AnswerOptionProps) {
  const isSelected = state === "selected";
  const isCorrect = state === "revealed-correct";
  const isWrong = state === "revealed-wrong-selection";

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={isSelected || isCorrect || isWrong}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnamon-500",
        "disabled:cursor-not-allowed",
        // States
        state === "idle" &&
          "border-neutral-200 bg-white text-neutral-800 hover:border-cinnamon-300 hover:bg-cinnamon-50",
        isSelected &&
          "border-cinnamon-400 bg-cinnamon-50 text-cinnamon-700",
        isCorrect &&
          "border-success bg-success-light text-success",
        isWrong &&
          "border-error bg-error-light text-error",
        state === "revealed-incorrect" &&
          "border-neutral-200 bg-neutral-50 text-neutral-400 opacity-60"
      )}
      animate={
        isWrong
          ? { x: [0, -6, 6, -4, 4, 0] }
          : isCorrect
          ? { scale: [1, 1.02, 1] }
          : {}
      }
      transition={
        isWrong
          ? { duration: 0.3, ease: "easeOut" }
          : { duration: 0.4, ease: "easeOut" }
      }
    >
      {/* Label badge */}
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold mt-0.5",
          state === "idle" && "border-neutral-300 text-neutral-500",
          isSelected && "border-cinnamon-400 bg-cinnamon-500 text-white",
          isCorrect && "border-success bg-success text-white",
          isWrong && "border-error bg-error text-white",
          state === "revealed-incorrect" && "border-neutral-300 text-neutral-400"
        )}
      >
        {isCorrect ? <Check className="h-3.5 w-3.5" /> : isWrong ? <X className="h-3.5 w-3.5" /> : label}
      </span>

      {/* Text */}
      <span className="flex-1 leading-snug">{text}</span>
    </motion.button>
  );
}
