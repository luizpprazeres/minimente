export type FsrsState = "new" | "learning" | "review" | "relearning";

/** FSRS grade: 1=Again, 2=Hard, 3=Good, 4=Easy */
export type Grade = 1 | 2 | 3 | 4;

export interface FSRSCard {
  id: string;
  user_id: string;
  question_id: string;
  /** Stability (days before 90% retention) */
  stability: number;
  /** Difficulty [1–10] */
  difficulty: number;
  /** Current retrievability [0–1] */
  retrievability: number;
  due_date: string; // ISO
  last_review: string | null;
  review_count: number;
  state: FsrsState;
  created_at: string;
}

export interface ScheduleResult {
  stability: number;
  difficulty: number;
  retrievability: number;
  due_date: Date;
  state: FsrsState;
  scheduled_days: number;
}

export interface ReviewEntry {
  card_id: string;
  grade: Grade;
  scheduled_days: number;
  elapsed_days: number;
  reviewed_at: Date;
  response_time_ms: number;
}
