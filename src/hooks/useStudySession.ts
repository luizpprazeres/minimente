"use client";

import { useCallback, useEffect, useReducer } from "react";
import { createClient } from "@/lib/supabase/client";
import { scheduleCard, createNewCard } from "@/lib/srs";
import type { Grade, FSRSCard } from "@/lib/srs";
import type { Question, QuestionOption, Explanation } from "@/types/database";

// ── State ──

interface QuestionBundle {
  question: Question;
  options: QuestionOption[];
  explanation?: Explanation;
  card: FSRSCard;
}

type SessionStatus = "loading" | "active" | "complete" | "error";

interface SessionState {
  status: SessionStatus;
  queue: QuestionBundle[];
  currentIndex: number;
  answers: { questionId: string; isCorrect: boolean; grade: Grade }[];
  xpEarned: number;
  error: string | null;
}

type SessionAction =
  | { type: "LOAD_SUCCESS"; queue: QuestionBundle[] }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "ANSWER"; questionId: string; isCorrect: boolean; grade: Grade; xp: number }
  | { type: "NEXT" };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, status: "active", queue: action.queue };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.error };
    case "ANSWER":
      return {
        ...state,
        answers: [
          ...state.answers,
          { questionId: action.questionId, isCorrect: action.isCorrect, grade: action.grade },
        ],
        xpEarned: state.xpEarned + action.xp,
      };
    case "NEXT": {
      const next = state.currentIndex + 1;
      if (next >= state.queue.length) return { ...state, status: "complete", currentIndex: next };
      return { ...state, currentIndex: next };
    }
    default:
      return state;
  }
}

// ── Hook ──

export function useStudySession(userId: string, sessionId?: string) {
  const supabase = createClient();
  const [state, dispatch] = useReducer(sessionReducer, {
    status: "loading",
    queue: [],
    currentIndex: 0,
    answers: [],
    xpEarned: 0,
    error: null,
  });

  // Load due cards
  useEffect(() => {
    if (!userId) return;

    async function loadQueue() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;

        // Get due FSRS cards (or new questions if none)
        const { data: cards } = await db.rpc("get_due_cards", {
          p_user_id: userId,
          p_limit: 20,
        });

        let queue: QuestionBundle[] = [];

        if (cards && cards.length > 0) {
          // Fetch questions for due cards
          const questionIds = cards.map((c: FSRSCard) => c.question_id);
          const { data: questions } = await db
            .from("questions")
            .select("*")
            .in("id", questionIds)
            .eq("published", true);

          if (questions) {
            const { data: options } = await db
              .from("question_options")
              .select("*")
              .in("question_id", questionIds);

            const { data: explanations } = await db
              .from("explanations")
              .select("*")
              .in("question_id", questionIds);

            queue = questions.map((q: Question) => ({
              question: q,
              options: (options ?? []).filter((o: QuestionOption) => o.question_id === q.id),
              explanation: (explanations ?? []).find((e: Explanation) => e.question_id === q.id),
              card: cards.find((c: FSRSCard) => c.question_id === q.id)!,
            }));
          }
        } else {
          // No due cards — load fresh questions
          const { data: questions } = await db
            .from("questions")
            .select("*")
            .eq("published", true)
            .limit(20);

          if (questions && questions.length > 0) {
            const qIds = questions.map((q: Question) => q.id);
            const { data: options } = await db
              .from("question_options")
              .select("*")
              .in("question_id", qIds);
            const { data: explanations } = await db
              .from("explanations")
              .select("*")
              .in("question_id", qIds);

            queue = questions.map((q: Question) => ({
              question: q,
              options: (options ?? []).filter((o: QuestionOption) => o.question_id === q.id),
              explanation: (explanations ?? []).find((e: Explanation) => e.question_id === q.id),
              card: createNewCard(userId, q.id) as FSRSCard,
            }));
          }
        }

        dispatch({ type: "LOAD_SUCCESS", queue });
      } catch (err) {
        dispatch({ type: "LOAD_ERROR", error: String(err) });
      }
    }

    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const gradeCard = useCallback(
    async (questionId: string, grade: Grade, responseTimeMs: number) => {
      const bundle = state.queue[state.currentIndex];
      if (!bundle) return;

      const now = new Date();
      const result = scheduleCard(bundle.card, grade, now);
      const isCorrect = grade >= 3;

      // XP: +10 base, +25 for hard questions (difficulty > 7)
      const xp = isCorrect
        ? bundle.question.difficulty_3pl > 1.5
          ? 25
          : 10
        : 0;

      dispatch({ type: "ANSWER", questionId, isCorrect, grade, xp });

      // Persist to DB (fire-and-forget)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        const elapsedDays = bundle.card.last_review
          ? (now.getTime() - new Date(bundle.card.last_review).getTime()) / 86400000
          : 0;

        await db.from("fsrs_cards").upsert({
          ...bundle.card,
          stability: result.stability,
          difficulty: result.difficulty,
          retrievability: result.retrievability,
          due_date: result.due_date.toISOString(),
          last_review: now.toISOString(),
          review_count: bundle.card.review_count + 1,
          state: result.state,
        });

        await db.from("review_logs").insert({
          user_id: userId,
          card_id: bundle.card.id ?? `${userId}_${questionId}`,
          grade,
          response_time_ms: responseTimeMs,
          scheduled_days: result.scheduled_days,
          elapsed_days: elapsedDays,
          reviewed_at: now.toISOString(),
        });

        if (xp > 0) {
          await db.rpc("increment_xp", { p_user_id: userId, p_xp: xp });
        }
      } catch {
        // Non-fatal: sync failure logged silently
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.queue, state.currentIndex, userId]
  );

  const advance = useCallback(() => {
    dispatch({ type: "NEXT" });
  }, []);

  const current = state.queue[state.currentIndex];
  const accuracy =
    state.answers.length > 0
      ? Math.round(
          (state.answers.filter((a) => a.isCorrect).length / state.answers.length) * 100
        )
      : 0;

  return {
    status: state.status,
    current,
    currentIndex: state.currentIndex,
    total: state.queue.length,
    answers: state.answers,
    xpEarned: state.xpEarned,
    accuracy,
    gradeCard,
    advance,
  };
}
