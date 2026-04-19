"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReasoningStep {
  step: number;
  text: string;
}

interface ExplanationPanelProps {
  open: boolean;
  keyConcept: string;
  explanation: string;
  reasoningSteps?: ReasoningStep[];
  sourceRefs?: string[];
  className?: string;
}

export function ExplanationPanel({
  open,
  keyConcept,
  explanation,
  reasoningSteps = [],
  sourceRefs = [],
  className,
}: ExplanationPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className={cn("overflow-hidden", className)}
        >
          <div className="mt-4 rounded-xl border border-cinnamon-200 bg-cinnamon-50 p-5 space-y-4">
            {/* Key Concept */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-cinnamon-500">
                Key Concept
              </span>
              <p className="mt-1 font-medium text-neutral-800">{keyConcept}</p>
            </div>

            {/* Explanation */}
            <p className="text-sm text-neutral-700 leading-relaxed">{explanation}</p>

            {/* Reasoning steps */}
            {reasoningSteps.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Reasoning
                </span>
                <ol className="mt-2 space-y-2">
                  {reasoningSteps.map((step, idx) => (
                    <motion.li
                      key={step.step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.08 }}
                      className="flex gap-3 text-sm text-neutral-700"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cinnamon-200 text-xs font-semibold text-cinnamon-700">
                        {step.step}
                      </span>
                      <span className="flex-1 leading-snug">{step.text}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            )}

            {/* Source refs */}
            {sourceRefs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sourceRefs.map((ref) => (
                  <span
                    key={ref}
                    className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
