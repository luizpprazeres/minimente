"use client";

import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Markdown renderer ──

/**
 * Pre-processes AMBOSS explanation text:
 * - Splits "**Option A:** text **Option B:** text" into separate blocks
 * - Normalises spacing around commas and parentheses
 */
function parseOptionBlocks(text: string): { label: string; content: string }[] {
  // Insert a unique separator before every **Option X:** marker
  const normalised = text.replace(
    /\s*\*\*(Option\s+([A-F]))\s*:\*\*/g,
    "\n§OPTION§$2§\n"
  );

  const lines = normalised.split("\n§OPTION§");
  const blocks: { label: string; content: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^([A-F])§\n?([\s\S]+)/);
    if (match) {
      blocks.push({
        label: match[1],
        content: match[2].trim(),
      });
    } else if (line.trim()) {
      // Introductory text before first option
      blocks.push({ label: "", content: line.trim() });
    }
  }

  return blocks;
}

interface MarkdownTextProps {
  children: string;
  className?: string;
}

function MarkdownText({ children, className }: MarkdownTextProps) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className={cn("leading-relaxed mb-2 last:mb-0", className)}>
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mt-1 mb-2 space-y-1 list-disc list-inside">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-1 mb-2 space-y-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 rounded-lg border border-neutral-200">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-neutral-100">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-semibold text-neutral-700 border-b border-neutral-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-1.5 text-neutral-700 border-b border-neutral-100 last:border-0">
            {children}
          </td>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-cinnamon-300 pl-3 my-2 text-neutral-600 italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

// ── Types ──

interface ReasoningStep {
  step: number;
  text: string;
}

interface ExplanationPanelProps {
  open: boolean;
  keyConcept: string;
  explanation: string;
  correctOptionLabel?: string; // e.g. "A"
  reasoningSteps?: ReasoningStep[];
  sourceRefs?: string[];
  className?: string;
}

// ── Component ──

export function ExplanationPanel({
  open,
  keyConcept,
  explanation,
  correctOptionLabel,
  reasoningSteps = [],
  sourceRefs = [],
  className,
}: ExplanationPanelProps) {
  const blocks = parseOptionBlocks(explanation);
  const hasOptionBlocks = blocks.some((b) => b.label !== "");

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
          <div className="mt-4 rounded-xl border border-cinnamon-200 bg-cinnamon-50 overflow-hidden">
            {/* Key Concept banner */}
            <div className="bg-cinnamon-100 px-5 py-3 border-b border-cinnamon-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-cinnamon-500">
                Key Concept
              </span>
              <p className="mt-0.5 text-sm font-semibold text-neutral-800 leading-snug">
                {keyConcept}
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* ── Option-by-option breakdown ── */}
              {hasOptionBlocks ? (
                <div className="space-y-3">
                  {blocks
                    .filter((b) => b.label !== "")
                    .map((block, idx) => {
                      const isCorrect =
                        correctOptionLabel &&
                        block.label === correctOptionLabel;
                      const isWrong =
                        correctOptionLabel &&
                        block.label !== correctOptionLabel;

                      return (
                        <motion.div
                          key={block.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + idx * 0.06 }}
                          className={cn(
                            "rounded-lg border px-4 py-3",
                            isCorrect
                              ? "border-success/30 bg-success-light/40"
                              : isWrong
                                ? "border-neutral-200 bg-white"
                                : "border-neutral-200 bg-white"
                          )}
                        >
                          {/* Option header */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : isWrong ? (
                              <XCircle className="h-4 w-4 text-neutral-300 shrink-0" />
                            ) : null}
                            <span
                              className={cn(
                                "text-xs font-bold uppercase tracking-wide",
                                isCorrect
                                  ? "text-success"
                                  : "text-neutral-500"
                              )}
                            >
                              Option {block.label}
                              {isCorrect && " — Correct"}
                            </span>
                          </div>

                          {/* Option explanation */}
                          <div className="text-sm text-neutral-700">
                            <MarkdownText>{block.content}</MarkdownText>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                /* Fallback: plain markdown if no option markers found */
                <div className="text-sm text-neutral-700">
                  <MarkdownText>{explanation}</MarkdownText>
                </div>
              )}

              {/* ── Reasoning steps ── */}
              {reasoningSteps.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
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
                        <span className="flex-1 leading-snug">
                          <MarkdownText className="text-neutral-700">
                            {step.text}
                          </MarkdownText>
                        </span>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ── Source refs ── */}
              {sourceRefs.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-cinnamon-200">
                  <BookOpen className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  {sourceRefs.map((ref) => (
                    <span
                      key={ref}
                      className="inline-flex items-center rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
