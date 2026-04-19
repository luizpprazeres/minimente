"use client";

import { useReducer } from "react";

export type SessionPhase = "active" | "complete";

interface SessionState {
  phase: SessionPhase;
  currentIndex: number;
  answers: { questionId: string; label: string; isCorrect: boolean; grade: 1 | 2 | 3 | 4 }[];
}

type SessionAction =
  | { type: "ANSWER"; questionId: string; label: string; isCorrect: boolean; grade: 1 | 2 | 3 | 4 }
  | { type: "NEXT"; totalQuestions: number }
  | { type: "RESET" };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "ANSWER":
      return {
        ...state,
        answers: [
          ...state.answers,
          {
            questionId: action.questionId,
            label: action.label,
            isCorrect: action.isCorrect,
            grade: action.grade,
          },
        ],
      };
    case "NEXT": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= action.totalQuestions) {
        return { ...state, phase: "complete", currentIndex: nextIndex };
      }
      return { ...state, currentIndex: nextIndex };
    }
    case "RESET":
      return { phase: "active", currentIndex: 0, answers: [] };
    default:
      return state;
  }
}

export function useQuestionSession() {
  const [state, dispatch] = useReducer(sessionReducer, {
    phase: "active",
    currentIndex: 0,
    answers: [],
  });

  function recordAnswer(
    questionId: string,
    label: string,
    isCorrect: boolean,
    grade: 1 | 2 | 3 | 4
  ) {
    dispatch({ type: "ANSWER", questionId, label, isCorrect, grade });
  }

  function advance(totalQuestions: number) {
    dispatch({ type: "NEXT", totalQuestions });
  }

  function reset() {
    dispatch({ type: "RESET" });
  }

  const correctCount = state.answers.filter((a) => a.isCorrect).length;
  const accuracy =
    state.answers.length > 0
      ? Math.round((correctCount / state.answers.length) * 100)
      : 0;

  return {
    phase: state.phase,
    currentIndex: state.currentIndex,
    answers: state.answers,
    correctCount,
    accuracy,
    recordAnswer,
    advance,
    reset,
  };
}
