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

export function useStudySession(userId: string, domain?: string, sessionId?: string) {
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

        const SESSION_MIN = 20; // always show at least this many questions

        if (cards && cards.length > 0) {
          // Fetch questions for due cards — filter by domain when specified
          const questionIds = cards.map((c: FSRSCard) => c.question_id);
          let qQuery = db
            .from("questions")
            .select("*")
            .in("id", questionIds)
            .eq("published", true);
          if (domain) qQuery = qQuery.eq("amc_domain", domain);
          const { data: questions } = await qQuery;

          if (questions) {
            const filteredIds = questions.map((q: Question) => q.id);
            const { data: options } = await db
              .from("question_options")
              .select("*")
              .in("question_id", filteredIds);

            const { data: explanations } = await db
              .from("explanations")
              .select("*")
              .in("question_id", filteredIds);

            queue = questions.map((q: Question) => ({
              question: q,
              options: (options ?? []).filter((o: QuestionOption) => o.question_id === q.id),
              explanation: (explanations ?? []).find((e: Explanation) => e.question_id === q.id),
              card: cards.find((c: FSRSCard) => c.question_id === q.id) ?? createNewCard(userId, q.id) as FSRSCard,
            }));
          }

          // Pad with fresh questions if due cards < SESSION_MIN
          if (queue.length < SESSION_MIN) {
            const needed = SESSION_MIN - queue.length;
            const dueIds = new Set(queue.map((b) => b.question.id));
            const excludeList = [...dueIds].join(",");

            let padQuery = db
              .from("questions")
              .select("id")
              .eq("published", true)
              .not("id", "in", `(${excludeList || "''"})`)
              .limit(needed * 4);
            if (domain) padQuery = padQuery.eq("amc_domain", domain);
            const { data: padIds } = await padQuery;

            if (padIds && padIds.length > 0) {
              const picked = [...padIds]
                .sort(() => Math.random() - 0.5)
                .slice(0, needed)
                .map((r: { id: string }) => r.id);

              const { data: padQ } = await db
                .from("questions")
                .select("*")
                .in("id", picked);
              const { data: padOpts } = await db
                .from("question_options")
                .select("*")
                .in("question_id", picked);
              const { data: padExp } = await db
                .from("explanations")
                .select("*")
                .in("question_id", picked);

              const padBundles = (padQ ?? []).map((q: Question) => ({
                question: q,
                options: (padOpts ?? []).filter((o: QuestionOption) => o.question_id === q.id),
                explanation: (padExp ?? []).find((e: Explanation) => e.question_id === q.id),
                card: createNewCard(userId, q.id) as FSRSCard,
              }));

              queue = [...queue, ...padBundles];
            }
          }
        } else {
          // No due cards — load fresh questions (randomised for variety).
          let idQuery = db
            .from("questions")
            .select("id")
            .eq("published", true)
            .limit(100);
          if (domain) idQuery = idQuery.eq("amc_domain", domain);
          const { data: idRows, error: qErr } = await idQuery;

          if (qErr) {
            console.error("[useStudySession] questions id fetch error:", qErr);
          }

          if (idRows && idRows.length > 0) {
            const shuffledIds = [...idRows]
              .sort(() => Math.random() - 0.5)
              .slice(0, 20)
              .map((r: { id: string }) => r.id);

            const { data: questions } = await db
              .from("questions")
              .select("*")
              .in("id", shuffledIds);

            const { data: options } = await db
              .from("question_options")
              .select("*")
              .in("question_id", shuffledIds);
            const { data: explanations } = await db
              .from("explanations")
              .select("*")
              .in("question_id", shuffledIds);

            queue = (questions ?? []).map((q: Question) => ({
              question: q,
              options: (options ?? []).filter((o: QuestionOption) => o.question_id === q.id),
              explanation: (explanations ?? []).find((e: Explanation) => e.question_id === q.id),
              card: createNewCard(userId, q.id) as FSRSCard,
            }));
          }
        }

        // Shuffle the entire queue so order is different every session
        queue = [...queue].sort(() => Math.random() - 0.5);

        dispatch({ type: "LOAD_SUCCESS", queue });
      } catch (err) {
        dispatch({ type: "LOAD_ERROR", error: String(err) });
      }
    }

    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, domain]);

  const gradeCard = useCallback(
    async (questionId: string, grade: Grade, responseTimeMs: number) => {
      const bundle = state.queue[state.currentIndex];
      if (!bundle) return;

      const now = new Date();
      const result = scheduleCard(bundle.card, grade, now);
      const isCorrect = grade >= 3;

      // XP: +10 base, +25 for hard questions (difficulty > 7)
      const xp = isCorrect
        ? bundle.question.difficulty_b > 1.5
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

        await db.from("review_log").insert({
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
