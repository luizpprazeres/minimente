"use client";

import { useRef } from "react";
import { useStudySession } from "@/hooks/useStudySession";
import { useUser } from "@/hooks/useUser";
import { QuestionCard } from "@/components/study/QuestionCard";
import { SessionProgress } from "@/components/study/SessionProgress";
import { SessionTimer } from "@/components/study/SessionTimer";
import { SessionSummary } from "@/components/study/SessionSummary";
import type { Grade } from "@/lib/srs";

export default function SessionPage() {
  const { user, loading: userLoading } = useUser();
  const answerTimeRef = useRef<number>(Date.now());

  const {
    status,
    current,
    currentIndex,
    total,
    xpEarned,
    accuracy,
    gradeCard,
    advance,
  } = useStudySession(user?.id ?? "");

  if (userLoading || status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cinnamon-500 border-t-transparent" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-error font-medium">Failed to load session</p>
          <p className="text-sm text-neutral-500 mt-1">Please try again</p>
        </div>
      </div>
    );
  }

  if (status === "complete" || !current) {
    return (
      <SessionSummary
        questionsAnswered={currentIndex}
        accuracy={accuracy}
        xpEarned={xpEarned}
      />
    );
  }

  function handleAnswer(_label: string, _isCorrect: boolean, grade: Grade) {
    const responseTimeMs = Date.now() - answerTimeRef.current;
    gradeCard(current!.question.id, grade, responseTimeMs);
  }

  function handleNext() {
    answerTimeRef.current = Date.now();
    advance();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar + timer */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex-1">
          <SessionProgress current={currentIndex + 1} total={total} />
        </div>
        <div className="pr-4">
          <SessionTimer mode="up" />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <QuestionCard
          question={current.question}
          options={current.options}
          explanation={current.explanation}
          language={user ? "en" : "en"}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
