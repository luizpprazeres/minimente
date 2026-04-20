/**
 * Supabase Database Type Definitions for miniMENTE
 * Generated manually — will be replaced by `supabase gen types` after schema setup
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enum Types (defined first to avoid circular references) ──

export type AmcDomain =
  | "adult_medicine"
  | "adult_surgery"
  | "womens_health"
  | "child_health"
  | "mental_health"
  | "population_health";

export type FsrsState = "new" | "learning" | "review" | "relearning";
export type QuestionMediaType = "none" | "ecg" | "xray" | "ct" | "photo";
export type LanguagePref = "en" | "pt";
export type StudyMode = "practice" | "exam_simulation" | "tutor" | "vocabulary" | "weak_areas";
export type MasteryLevel = "novice" | "beginner" | "intermediate" | "advanced" | "fellow";

// ── Database Interface ──

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, "id" | "created_at">;
        Update: Partial<Omit<Subject, "id">>;
      };
      topics: {
        Row: Topic;
        Insert: Omit<Topic, "id" | "created_at">;
        Update: Partial<Omit<Topic, "id">>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, "id" | "created_at">;
        Update: Partial<Omit<Question, "id">>;
      };
      question_options: {
        Row: QuestionOption;
        Insert: Omit<QuestionOption, "id">;
        Update: Partial<QuestionOption>;
      };
      explanations: {
        Row: Explanation;
        Insert: Omit<Explanation, "id">;
        Update: Partial<Explanation>;
      };
      fsrs_cards: {
        Row: FSRSCard;
        Insert: Omit<FSRSCard, "id" | "created_at">;
        Update: Partial<Omit<FSRSCard, "id">>;
      };
      review_logs: {
        Row: ReviewLog;
        Insert: Omit<ReviewLog, "id">;
        Update: never;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "id" | "created_at">;
        Update: Partial<Omit<UserProfile, "id">>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, "id">;
        Update: Partial<UserSettings>;
      };
      user_xp: {
        Row: UserXP;
        Insert: Omit<UserXP, "id">;
        Update: Partial<UserXP>;
      };
      user_streaks: {
        Row: UserStreak;
        Insert: Omit<UserStreak, "id">;
        Update: Partial<UserStreak>;
      };
      user_domain_mastery: {
        Row: UserDomainMastery;
        Insert: Omit<UserDomainMastery, "id" | "updated_at">;
        Update: Partial<UserDomainMastery>;
      };
      study_sessions: {
        Row: StudySession;
        Insert: Omit<StudySession, "id">;
        Update: Partial<StudySession>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, "id">;
        Update: Partial<Achievement>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, "id">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_due_cards: {
        Args: { p_user_id: string; p_limit?: number };
        Returns: FSRSCard[];
      };
      hybrid_search: {
        Args: { query_text: string; query_embedding: number[]; match_count?: number };
        Returns: { chunk_id: string; content: string; metadata: Json; score: number }[];
      };
    };
    Enums: {
      amc_domain: AmcDomain;
      fsrs_state: FsrsState;
      question_media_type: QuestionMediaType;
      language_pref: LanguagePref;
      study_mode: StudyMode;
      mastery_level: MasteryLevel;
    };
  };
}

// ── Core Domain Types ──

export interface Subject {
  id: string;
  slug: string;
  name_en: string;
  name_pt: string;
  amc_domain: AmcDomain;
  weight_percentage: number;
  icon: string;
  color_hex: string;
  order: number;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  slug: string;
  name_en: string;
  name_pt: string;
  description_en: string | null;
  description_pt: string | null;
  order: number;
  created_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  slug: string;
  name_en: string;
  name_pt: string;
  order: number;
  created_at: string;
}

export interface Question {
  id: string;
  subtopic_id: string;
  stem_en: string;
  stem_pt: string;
  media_url: string | null;
  media_type: QuestionMediaType;
  difficulty_b: number;
  discrimination_a: number;
  pseudoguessing_c: number;
  amc_domain: AmcDomain;
  published: boolean;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  label: "A" | "B" | "C" | "D" | "E";
  text_en: string;
  text_pt: string;
  is_correct: boolean;
}

export interface Explanation {
  id: string;
  question_id: string;
  explanation_en: string;
  explanation_pt: string;
  reasoning_steps: Json;
  source_refs: Json;
  key_concept_en: string;
  key_concept_pt: string;
}

// ── FSRS Types ──

export interface FSRSCard {
  id: string;
  user_id: string;
  question_id: string;
  stability: number;
  difficulty: number;
  retrievability: number;
  due_date: string;
  last_review: string | null;
  review_count: number;
  state: FsrsState;
  created_at: string;
}

export interface ReviewLog {
  id: string;
  user_id: string;
  card_id: string;
  grade: 1 | 2 | 3 | 4;
  response_time_ms: number;
  scheduled_days: number;
  elapsed_days: number;
  reviewed_at: string;
}

// ── User Types ──

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  language_pref: LanguagePref;
  timezone: string;
  avatar_url: string | null;
  onboarding_done: boolean;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  daily_goal: number;
  notifications_enabled: boolean;
  exam_mode: boolean;
}

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  xp_to_next_level: number;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  streak_shields_available: number;
}

export interface UserDomainMastery {
  id: string;
  user_id: string;
  domain: AmcDomain;
  mastery_level: MasteryLevel;
  accuracy_percentage: number;
  questions_answered: number;
  updated_at: string;
}

// ── Study Session Types ──

export interface StudySession {
  id: string;
  user_id: string;
  mode: StudyMode;
  started_at: string;
  ended_at: string | null;
  domain_filter: AmcDomain | null;
  questions_answered: number;
  correct_count: number;
  xp_earned: number;
  streak_maintained: boolean;
}

// ── Gamification Types ──

export interface Achievement {
  id: string;
  slug: string;
  name_en: string;
  name_pt: string;
  description_en: string;
  description_pt: string;
  icon: string;
  criteria: Json;
  xp_reward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}
