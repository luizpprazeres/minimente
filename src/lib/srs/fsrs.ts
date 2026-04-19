/**
 * FSRS-5 Spaced Repetition Algorithm
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/Algorithm
 */

import type { FSRSCard, Grade, ScheduleResult, FsrsState } from "./types";

// FSRS-5 default weights (w0–w18)
const W = [
  0.40255, 1.18385, 3.173,   15.69105, 7.1949,   0.5345,  1.4604,
  0.0046,  1.54575, 0.1192,  1.01925,  1.9395,   0.11,    0.29605,
  2.2698,  0.2315,  2.9898,  0.51655,  0.6621,
] as const;

// Forgetting curve constants: R(t,S) = (1 + F·t/S)^C
const DECAY = -0.5; // C
const FACTOR = 19 / 81; // F (= (0.9^(1/C) - 1) / (1/S))
const TARGET_RETENTION = 0.9;

// ── Core Formulae ──

/** Retrievability after `t` days with stability `S` */
export function calcRetrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY);
}

/** Optimal interval for target retention */
export function calcInterval(stability: number, targetRetention = TARGET_RETENTION): number {
  return Math.max(1, Math.round(
    (stability / FACTOR) * (Math.pow(targetRetention, 1 / DECAY) - 1)
  ));
}

// ── Initial stability by grade (new cards) ──
function initStability(grade: Grade): number {
  return Math.max(W[grade - 1] as number, 0.1);
}

// ── Initial difficulty ──
function initDifficulty(grade: Grade): number {
  const d0 = W[4] - Math.exp(W[5] * (grade - 1)) + 1;
  return clampDifficulty(d0);
}

function clampDifficulty(d: number): number {
  return Math.min(Math.max(d, 1), 10);
}

// ── Next difficulty (review) ──
function nextDifficulty(d: number, grade: Grade): number {
  const delta = -W[6] * (grade - 3);
  const next = d + delta * (10 - d) / 9;
  return clampDifficulty(next);
}

// ── Short-term stability (learning/relearning) ──
function shortTermStability(stability: number, grade: Grade): number {
  const factor = Math.exp(W[17] * (grade - 3 + W[18]));
  return stability * factor;
}

// ── Long-term recall stability (review) ──
function nextRecallStability(
  d: number,
  s: number,
  r: number,
  grade: Grade
): number {
  const hardPenalty = grade === 2 ? W[15] : 1;
  const easyBonus = grade === 4 ? W[16] : 1;
  return (
    s *
    (Math.exp(W[8]) *
      (11 - d) *
      Math.pow(s, -W[9]) *
      (Math.exp((1 - r) * W[10]) - 1) *
      hardPenalty *
      easyBonus +
      1)
  );
}

// ── Forget stability (relearning) ──
function nextForgetStability(d: number, s: number, r: number): number {
  return W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]);
}

// ── Main scheduler ──

export function scheduleCard(
  card: FSRSCard,
  grade: Grade,
  now: Date = new Date()
): ScheduleResult {
  const elapsedDays =
    card.last_review
      ? Math.max(0, (now.getTime() - new Date(card.last_review).getTime()) / 86400000)
      : 0;

  let newState: FsrsState;
  let newStability: number;
  let newDifficulty: number;

  switch (card.state) {
    case "new": {
      newDifficulty = initDifficulty(grade);
      newStability = initStability(grade);
      newState = grade === 1 ? "learning" : grade === 2 ? "learning" : "review";
      break;
    }
    case "learning":
    case "relearning": {
      newDifficulty = card.difficulty; // difficulty doesn't change in short-term
      newStability = shortTermStability(card.stability, grade);
      newState = grade >= 3 ? "review" : card.state;
      break;
    }
    case "review": {
      const r = calcRetrievability(elapsedDays, card.stability);
      newDifficulty = nextDifficulty(card.difficulty, grade);
      if (grade === 1) {
        newStability = nextForgetStability(card.difficulty, card.stability, r);
        newState = "relearning";
      } else {
        newStability = nextRecallStability(card.difficulty, card.stability, r, grade);
        newState = "review";
      }
      break;
    }
  }

  const scheduledDays =
    newState === "learning" || newState === "relearning"
      ? grade === 1 ? 1 / 1440 : grade === 2 ? 10 / 1440 : 1 // <1 day for learning
      : calcInterval(newStability);

  const dueDate = new Date(now.getTime() + scheduledDays * 86400000);
  const newRetrievability = calcRetrievability(0, newStability); // at review moment = 1

  return {
    stability: Math.max(newStability, 0.1),
    difficulty: newDifficulty,
    retrievability: newRetrievability,
    due_date: dueDate,
    state: newState,
    scheduled_days: scheduledDays,
  };
}

/** Create a brand-new FSRS card (never reviewed) */
export function createNewCard(userId: string, questionId: string): Omit<FSRSCard, "id" | "created_at"> {
  return {
    user_id: userId,
    question_id: questionId,
    stability: W[0],
    difficulty: W[4],
    retrievability: 1,
    due_date: new Date().toISOString(),
    last_review: null,
    review_count: 0,
    state: "new",
  };
}
