"use client";

import { useEffect, useRef, useState } from "react";
import { useStudySession } from "@/hooks/useStudySession";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { QuestionCard } from "@/components/study/QuestionCard";
import { SessionProgress } from "@/components/study/SessionProgress";
import { SessionTimer } from "@/components/study/SessionTimer";
import { SessionSummary } from "@/components/study/SessionSummary";
import { InsightPanel } from "@/components/study/InsightPanel";
import type { Grade } from "@/lib/srs";
import type { Lang } from "@/lib/copy";
import { sessionCopy, c } from "@/lib/copy";

export default function SessionPage() {
  const { user, loading: userLoading } = useUser();
  const answerTimeRef = useRef<number>(Date.now());
  const [lang, setLang] = useState<Lang>("en");

  // Load language preference from user profile
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("user_profiles")
      .select("language_pref")
      .eq("user_id", user.id)
      .single()
      .then(({ data }: { data: { language_pref: string } | null }) => {
        if (data?.language_pref === "pt") setLang("pt");
      })
      .catch(() => {});
  }, [user?.id]);

  const {
    status,
    current,
    currentIndex,
    total,
    xpEarned,
    accuracy,
    answers,
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
          <p className="text-red-600 font-medium">{c(sessionCopy.loadError, lang)}</p>
          <p className="text-sm text-neutral-500 mt-1">{c(sessionCopy.tryAgain, lang)}</p>
        </div>
      </div>
    );
  }

  if (status === "complete" || !current) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 overflow-y-auto">
        <SessionSummary
          questionsAnswered={currentIndex}
          accuracy={accuracy}
          xpEarned={xpEarned}
          lang={lang}
        />
        {user?.id && answers.length > 0 && (
          <InsightPanel
            userId={user.id}
            answers={answers}
            lang={lang}
          />
        )}
      </div>
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

  async function handleAddToNotebook(questionId: string) {
    await fetch("/api/error-notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId }),
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar + timer */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex-1">
          <SessionProgress current={currentIndex + 1} total={total} lang={lang} />
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
          language={lang}
          onAnswer={handleAnswer}
          onNext={handleNext}
          autoAdvanceMs={0}
          onAddToNotebook={handleAddToNotebook}
        />
      </div>
    </div>
  );
}
