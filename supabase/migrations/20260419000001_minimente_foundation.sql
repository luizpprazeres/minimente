-- ============================================================
-- miniMENTE — Foundation Migration v1.0
-- AMC Exam Preparation Platform
-- ============================================================
-- ULTRATHINK SCHEMA DESIGN:
-- 1. Extensions first, then enums, then tables (dependency order)
-- 2. Every table has RLS enabled from the start
-- 3. Indexes designed for FSRS scheduling query pattern
-- 4. HNSW index on vectors (sub-100ms at scale)
-- 5. Trigger auto-creates user profile on signup
-- 6. Full-text search columns for BM25 hybrid search
-- 7. All bilingual columns (en/pt) co-located in same table
-- 8. IRT 3PL parameters stored per question for adaptive scoring
-- ============================================================

-- ── 1. EXTENSIONS ──────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "vector";
create extension if not exists "pg_trgm";     -- trigram for fuzzy full-text
create extension if not exists "unaccent";     -- normalize accented chars (PT)

-- ── 2. ENUMERATIONS ────────────────────────────────────────

create type amc_domain as enum (
  'adult_medicine',
  'adult_surgery',
  'womens_health',
  'child_health',
  'mental_health',
  'population_health'
);

create type fsrs_state as enum (
  'new',
  'learning',
  'review',
  'relearning'
);

create type question_media_type as enum (
  'none',
  'ecg',
  'xray',
  'ct',
  'photo',
  'table',
  'graph'
);

create type language_pref as enum (
  'en',
  'pt'
);

create type study_mode as enum (
  'practice',
  'exam_simulation',
  'tutor',
  'vocabulary',
  'weak_areas'
);

create type achievement_rarity as enum (
  'common',
  'rare',
  'epic',
  'legendary'
);

create type mastery_level as enum (
  'novice',
  'intern',
  'resident',
  'registrar',
  'specialist',
  'fellow'
);

-- ── 3. KNOWLEDGE BASE TABLES ───────────────────────────────
-- (Platform curated — never user-generated in Phase 0-1)

create table subjects (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  name_en     text not null,
  name_pt     text not null,
  amc_domain  amc_domain not null,
  -- Weight as percentage of exam (must sum to 100 across all domains)
  weight_pct  numeric(5,2) not null check (weight_pct > 0 and weight_pct <= 100),
  icon        text not null default 'stethoscope',
  color_hex   text not null default '#c45c2e',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table topics (
  id          uuid primary key default uuid_generate_v4(),
  subject_id  uuid not null references subjects(id) on delete cascade,
  slug        text not null,
  name_en     text not null,
  name_pt     text not null,
  description_en text,
  description_pt text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (subject_id, slug)
);

create table subtopics (
  id          uuid primary key default uuid_generate_v4(),
  topic_id    uuid not null references topics(id) on delete cascade,
  slug        text not null,
  name_en     text not null,
  name_pt     text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (topic_id, slug)
);

-- ── Knowledge Chunks (RAG corpus) ──

create table knowledge_chunks (
  id          uuid primary key default uuid_generate_v4(),
  subtopic_id uuid references subtopics(id) on delete set null,
  subject_id  uuid references subjects(id) on delete cascade,
  content_en  text not null,
  content_pt  text,
  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dims)
  embedding   vector(1536),
  source_ref  text,
  chunk_type  text not null default 'concept'
    check (chunk_type in ('concept', 'explanation', 'guideline', 'case', 'drug', 'procedure')),
  -- Full-text search vectors (generated columns for BM25 hybrid)
  fts_en      tsvector generated always as (to_tsvector('english', content_en)) stored,
  fts_pt      tsvector generated always as (
    to_tsvector('portuguese', coalesce(content_pt, content_en))
  ) stored,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ── Questions (MCQ — AMC format) ──

create table questions (
  id                  uuid primary key default uuid_generate_v4(),
  subtopic_id         uuid references subtopics(id) on delete set null,
  subject_id          uuid not null references subjects(id) on delete cascade,
  amc_domain          amc_domain not null,
  -- Clinical vignette (question stem)
  stem_en             text not null,
  stem_pt             text,
  -- Media attachment (ECG, X-ray, CT, photo)
  media_url           text,
  media_type          question_media_type not null default 'none',
  media_caption_en    text,
  media_caption_pt    text,
  -- IRT 3-Parameter Logistic model parameters
  -- difficulty_b: -3 to +3 (higher = harder)
  -- discrimination_a: 0 to 3 (higher = better discriminator)
  -- pseudoguessing_c: 0 to 0.35 (guessing probability)
  difficulty_b        numeric(5,3) not null default 0.0
    check (difficulty_b >= -3.0 and difficulty_b <= 3.0),
  discrimination_a    numeric(5,3) not null default 1.0
    check (discrimination_a >= 0.0 and discrimination_a <= 3.0),
  pseudoguessing_c    numeric(5,3) not null default 0.2
    check (pseudoguessing_c >= 0.0 and pseudoguessing_c <= 0.35),
  -- Quality control
  published           boolean not null default false,
  validated_by        text,  -- name/role of medical validator
  validation_date     date,
  source_ref          text,
  -- Full-text for BM25
  fts_stem_en         tsvector generated always as (to_tsvector('english', stem_en)) stored,
  created_at          timestamptz not null default now()
);

create table question_options (
  id          uuid primary key default uuid_generate_v4(),
  question_id uuid not null references questions(id) on delete cascade,
  label       char(1) not null check (label in ('A','B','C','D','E')),
  text_en     text not null,
  text_pt     text,
  is_correct  boolean not null default false,
  -- Distractor analysis fields (for contrastive ICL in RAG)
  distractor_rationale_en text,
  distractor_rationale_pt text,
  unique (question_id, label)
);

-- Ensure exactly 1 correct answer per question
create or replace function check_single_correct_answer()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from question_options
    where question_id = new.question_id
      and is_correct = true
      and id != new.id
  ) then
    raise exception 'Question % already has a correct answer', new.question_id;
  end if;
  return new;
end;
$$;

create trigger enforce_single_correct_answer
  before insert or update on question_options
  for each row when (new.is_correct = true)
  execute function check_single_correct_answer();

create table explanations (
  id                  uuid primary key default uuid_generate_v4(),
  question_id         uuid not null unique references questions(id) on delete cascade,
  explanation_en      text not null,
  explanation_pt      text,
  -- Structured reasoning steps for step-by-step display
  reasoning_steps     jsonb not null default '[]',
  -- Source references (textbooks, guidelines, PubMed)
  source_refs         jsonb not null default '[]',
  key_concept_en      text,
  key_concept_pt      text,
  -- High-yield tags for filtering
  high_yield_tags     text[] not null default '{}',
  created_at          timestamptz not null default now()
);

-- ── Vocabulary Terms (Duolingo-style drills) ──

create table vocabulary_terms (
  id              uuid primary key default uuid_generate_v4(),
  subtopic_id     uuid references subtopics(id) on delete set null,
  subject_id      uuid not null references subjects(id) on delete cascade,
  term_en         text not null,
  term_pt         text not null,
  definition_en   text not null,
  definition_pt   text not null,
  phonetic_en     text,
  example_en      text,
  example_pt      text,
  embedding       vector(1536),
  created_at      timestamptz not null default now()
);

-- ── 4. USER TABLES ─────────────────────────────────────────

create table user_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  display_name    text not null,
  language_pref   language_pref not null default 'en',
  timezone        text not null default 'UTC',
  avatar_url      text,
  -- Onboarding state
  onboarding_done boolean not null default false,
  -- Study goals
  daily_goal_questions integer not null default 20
    check (daily_goal_questions >= 1 and daily_goal_questions <= 200),
  target_exam_date date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table user_settings (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null unique references auth.users(id) on delete cascade,
  -- FSRS configuration
  srs_target_retention    numeric(3,2) not null default 0.90
    check (srs_target_retention >= 0.70 and srs_target_retention <= 0.97),
  -- Notification preferences
  notifications_enabled   boolean not null default true,
  study_reminder_time     time,
  -- UI preferences
  theme                   text not null default 'light'
    check (theme in ('light', 'dark', 'system')),
  -- Exam simulation settings
  exam_sim_duration_mins  integer not null default 210,  -- 3.5 hours
  exam_sim_question_count integer not null default 150,
  created_at              timestamptz not null default now()
);

create table user_xp (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references auth.users(id) on delete cascade,
  total_xp          bigint not null default 0 check (total_xp >= 0),
  level             integer not null default 1 check (level >= 1),
  xp_to_next_level  integer not null default 100,
  updated_at        timestamptz not null default now()
);

create table user_streaks (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null unique references auth.users(id) on delete cascade,
  current_streak          integer not null default 0 check (current_streak >= 0),
  longest_streak          integer not null default 0 check (longest_streak >= 0),
  last_study_date         date,
  streak_shields_available integer not null default 0 check (streak_shields_available >= 0),
  updated_at              timestamptz not null default now()
);

-- Per-domain mastery tracking
create table user_domain_mastery (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amc_domain  amc_domain not null,
  level       mastery_level not null default 'novice',
  accuracy    numeric(5,2) not null default 0.0
    check (accuracy >= 0.0 and accuracy <= 100.0),
  questions_answered integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique (user_id, amc_domain)
);

-- ── 5. FSRS SPACED REPETITION TABLES ───────────────────────

create table fsrs_cards (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     uuid not null references questions(id) on delete cascade,
  -- FSRS-5 DSR state variables
  -- stability: days required for R to decay from 100% to 90%
  -- difficulty: 1-10 (higher = harder, smaller stability gains)
  -- retrievability: probability of recall at current moment (0-1)
  stability       double precision not null default 0.0
    check (stability >= 0.0),
  difficulty      double precision not null default 5.0
    check (difficulty >= 1.0 and difficulty <= 10.0),
  retrievability  double precision not null default 0.0
    check (retrievability >= 0.0 and retrievability <= 1.0),
  due_date        timestamptz not null default now(),
  last_review     timestamptz,
  review_count    integer not null default 0 check (review_count >= 0),
  state           fsrs_state not null default 'new',
  created_at      timestamptz not null default now(),
  unique (user_id, question_id)
);

create table review_log (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  card_id         uuid not null references fsrs_cards(id) on delete cascade,
  -- Grade: 1=Again, 2=Hard, 3=Good, 4=Easy
  grade           smallint not null check (grade >= 1 and grade <= 4),
  -- Timing
  response_time_ms integer not null check (response_time_ms >= 0),
  -- FSRS scheduling data (for optimizer)
  scheduled_days  double precision not null default 0.0,
  elapsed_days    double precision not null default 0.0,
  -- FSRS state snapshot at review time
  stability_before    double precision,
  difficulty_before   double precision,
  retrievability_at_review double precision,
  reviewed_at     timestamptz not null default now()
);

-- ── 6. STUDY SESSION TABLES ────────────────────────────────

create table study_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  mode                study_mode not null,
  started_at          timestamptz not null default now(),
  ended_at            timestamptz,
  -- Optional domain filter (null = all domains)
  domain_filter       amc_domain,
  -- Results
  questions_answered  integer not null default 0 check (questions_answered >= 0),
  correct_count       integer not null default 0 check (correct_count >= 0),
  xp_earned           integer not null default 0 check (xp_earned >= 0),
  streak_maintained   boolean not null default false,
  -- Check: correct can't exceed answered
  constraint valid_correct check (correct_count <= questions_answered)
);

create table session_events (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references study_sessions(id) on delete cascade,
  event_type  text not null,
  payload     jsonb not null default '{}',
  ts          timestamptz not null default now()
);

-- ── 7. GAMIFICATION TABLES ─────────────────────────────────

create table achievements (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,
  name_en         text not null,
  name_pt         text not null,
  description_en  text not null,
  description_pt  text not null,
  icon            text not null,
  -- Criteria stored as JSON rule set
  -- e.g. {"type": "streak", "value": 7} or {"type": "accuracy", "domain": "cardiology", "value": 0.7}
  criteria        jsonb not null default '{}',
  xp_reward       integer not null default 0 check (xp_reward >= 0),
  rarity          achievement_rarity not null default 'common',
  created_at      timestamptz not null default now()
);

create table user_achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  achievement_id  uuid not null references achievements(id) on delete cascade,
  unlocked_at     timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- Weekly/monthly leaderboard snapshots
create table leaderboard_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  period      text not null,  -- 'weekly:2026-W16', 'monthly:2026-04'
  amc_domain  amc_domain,     -- null = overall
  score       bigint not null default 0,
  rank        integer,
  questions   integer not null default 0,
  accuracy    numeric(5,2) not null default 0.0,
  created_at  timestamptz not null default now(),
  unique (user_id, period, amc_domain)
);

-- ── 8. AI/TUTOR TABLES ─────────────────────────────────────

create table tutor_conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  session_id  uuid references study_sessions(id) on delete set null,
  -- Messages as JSON array: [{role, content, timestamp}]
  messages    jsonb not null default '[]',
  -- RAG context snapshot for this conversation
  context     jsonb not null default '{}',
  -- Token tracking
  total_tokens_used integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table ai_generated_content (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete set null,
  -- What was generated
  prompt_type     text not null
    check (prompt_type in ('explanation', 'summary', 'tutor_response', 'question_gen', 'vocab_drill')),
  input_context   jsonb not null default '{}',
  output_text     text not null,
  language        language_pref not null default 'en',
  -- Cost tracking
  model_used      text not null,
  tokens_used     integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ── 9. INDEXES ─────────────────────────────────────────────

-- Vector similarity search (HNSW — sub-100ms at scale)
-- ef_construction=128, m=16 gives good recall vs build time
create index knowledge_chunks_embedding_hnsw_idx
  on knowledge_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 128);

create index vocabulary_terms_embedding_hnsw_idx
  on vocabulary_terms
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 128);

-- Full-text search (BM25 via tsvector)
create index knowledge_chunks_fts_en_idx on knowledge_chunks using gin(fts_en);
create index knowledge_chunks_fts_pt_idx on knowledge_chunks using gin(fts_pt);
create index questions_fts_stem_en_idx on questions using gin(fts_stem_en);

-- FSRS scheduling (most critical query: "give me due cards for user X")
create index fsrs_cards_due_idx on fsrs_cards (user_id, due_date) where state != 'new';
create index fsrs_cards_new_idx on fsrs_cards (user_id, state) where state = 'new';
create index fsrs_cards_weak_idx on fsrs_cards (user_id, retrievability) where retrievability < 0.7;

-- Review log (for FSRS optimizer after 1000+ reviews)
create index review_log_user_time_idx on review_log (user_id, reviewed_at desc);
create index review_log_card_idx on review_log (card_id, reviewed_at desc);

-- Subject/Topic navigation
create index topics_subject_idx on topics (subject_id, sort_order);
create index subtopics_topic_idx on subtopics (topic_id, sort_order);
create index knowledge_chunks_subject_idx on knowledge_chunks (subject_id);
create index knowledge_chunks_subtopic_idx on knowledge_chunks (subtopic_id);
create index questions_subject_idx on questions (subject_id, published);
create index questions_domain_idx on questions (amc_domain, published);

-- User data
create index study_sessions_user_idx on study_sessions (user_id, started_at desc);
create index session_events_session_idx on session_events (session_id, ts desc);
create index user_achievements_user_idx on user_achievements (user_id, unlocked_at desc);
create index leaderboard_entries_period_idx on leaderboard_entries (period, amc_domain, rank);

-- AI content
create index ai_content_user_type_idx on ai_generated_content (user_id, prompt_type, created_at desc);

-- ── 10. HELPER FUNCTIONS ───────────────────────────────────

-- Auto-create user profile + settings + xp + streak on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  _display_name text;
begin
  _display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.user_profiles (user_id, display_name)
  values (new.id, _display_name);

  insert into public.user_settings (user_id)
  values (new.id);

  insert into public.user_xp (user_id)
  values (new.id);

  insert into public.user_streaks (user_id)
  values (new.id);

  -- Initialize domain mastery for all 6 AMC domains
  insert into public.user_domain_mastery (user_id, amc_domain)
  select new.id, unnest(enum_range(null::amc_domain));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- FSRS retrievability calculation: R(t, S) = (1 + F*t/S)^C
-- F = 19/81, C = -0.5
create or replace function public.calc_fsrs_retrievability(
  elapsed_days double precision,
  stability double precision
) returns double precision
language sql immutable strict as $$
  select
    case
      when stability <= 0 then 0.0
      else power(1.0 + (19.0/81.0) * elapsed_days / stability, -0.5)
    end;
$$;

-- Get FSRS interval from stability and desired retention
-- interval = (S/F) * (r_d^(1/C) - 1), F = 19/81, C = -0.5
create or replace function public.calc_fsrs_interval(
  stability double precision,
  desired_retention double precision default 0.9
) returns double precision
language sql immutable strict as $$
  select
    case
      when stability <= 0 then 0.0
      else (stability / (19.0/81.0)) * (power(desired_retention, 1.0 / (-0.5)) - 1.0)
    end;
$$;

-- Bulk update retrievability for all of a user's cards
-- Run periodically via pg_cron or after study sessions
create or replace function public.refresh_user_retrievability(p_user_id uuid)
returns void language plpgsql as $$
begin
  update fsrs_cards
  set retrievability = public.calc_fsrs_retrievability(
    extract(epoch from now() - last_review) / 86400.0,
    stability
  )
  where user_id = p_user_id
    and state in ('review', 'relearning')
    and last_review is not null;
end;
$$;

-- Get due cards for study session (FSRS scheduling query)
create or replace function public.get_due_cards(
  p_user_id uuid,
  p_domain amc_domain default null,
  p_limit integer default 20,
  p_include_new integer default 5
) returns table (
  card_id uuid,
  question_id uuid,
  card_state fsrs_state,
  due_date timestamptz,
  retrievability double precision
) language sql stable as $$
  -- Due review cards first, then new cards
  (
    select
      fc.id, fc.question_id, fc.state, fc.due_date, fc.retrievability
    from fsrs_cards fc
    join questions q on q.id = fc.question_id
    where fc.user_id = p_user_id
      and fc.state in ('learning', 'review', 'relearning')
      and fc.due_date <= now()
      and q.published = true
      and (p_domain is null or q.amc_domain = p_domain)
    order by fc.due_date asc
    limit p_limit - p_include_new
  )
  union all
  (
    select
      fc.id, fc.question_id, fc.state, fc.due_date, fc.retrievability
    from fsrs_cards fc
    join questions q on q.id = fc.question_id
    where fc.user_id = p_user_id
      and fc.state = 'new'
      and q.published = true
      and (p_domain is null or q.amc_domain = p_domain)
    order by random()
    limit p_include_new
  );
$$;

-- Hybrid search: vector + full-text (for RAG pipeline)
create or replace function public.hybrid_search(
  p_query_embedding vector(1536),
  p_query_text text,
  p_language language_pref default 'en',
  p_domain amc_domain default null,
  p_match_count integer default 10
) returns table (
  chunk_id uuid,
  content text,
  source_ref text,
  chunk_type text,
  vector_score double precision,
  fts_rank double precision,
  hybrid_score double precision
) language sql stable as $$
  with
  vector_results as (
    select
      id,
      case when p_language = 'en' then content_en else coalesce(content_pt, content_en) end as content,
      source_ref,
      chunk_type,
      1 - (embedding <=> p_query_embedding) as vector_score,
      row_number() over (order by embedding <=> p_query_embedding) as vector_rank
    from knowledge_chunks
    where (p_domain is null or subject_id in (
      select id from subjects where amc_domain = p_domain
    ))
    order by embedding <=> p_query_embedding
    limit p_match_count * 2
  ),
  fts_results as (
    select
      id,
      case when p_language = 'en' then content_en else coalesce(content_pt, content_en) end as content,
      source_ref,
      chunk_type,
      case when p_language = 'en'
        then ts_rank(fts_en, websearch_to_tsquery('english', p_query_text))
        else ts_rank(fts_pt, websearch_to_tsquery('portuguese', p_query_text))
      end as fts_rank,
      row_number() over (
        order by case when p_language = 'en'
          then ts_rank(fts_en, websearch_to_tsquery('english', p_query_text))
          else ts_rank(fts_pt, websearch_to_tsquery('portuguese', p_query_text))
        end desc
      ) as fts_rank_pos
    from knowledge_chunks
    where (p_domain is null or subject_id in (
      select id from subjects where amc_domain = p_domain
    ))
    and (
      case when p_language = 'en'
        then fts_en @@ websearch_to_tsquery('english', p_query_text)
        else fts_pt @@ websearch_to_tsquery('portuguese', p_query_text)
      end
    )
    limit p_match_count * 2
  ),
  -- Reciprocal Rank Fusion: score = 1/(k + rank), k=60 standard
  rrfusion as (
    select
      coalesce(v.id, f.id) as chunk_id,
      coalesce(v.content, f.content) as content,
      coalesce(v.source_ref, f.source_ref) as source_ref,
      coalesce(v.chunk_type, f.chunk_type)  as chunk_type,
      coalesce(v.vector_score, 0) as vector_score,
      coalesce(f.fts_rank, 0) as fts_rank,
      coalesce(1.0 / (60 + v.vector_rank), 0) + coalesce(1.0 / (60 + f.fts_rank_pos), 0) as hybrid_score
    from vector_results v
    full outer join fts_results f on f.id = v.id
  )
  select
    chunk_id,
    content,
    source_ref,
    chunk_type,
    vector_score,
    fts_rank,
    hybrid_score
  from rrfusion
  order by hybrid_score desc
  limit p_match_count;
$$;

-- ── 11. ROW LEVEL SECURITY ─────────────────────────────────

-- Enable RLS on all user-facing tables
alter table user_profiles          enable row level security;
alter table user_settings          enable row level security;
alter table user_xp                enable row level security;
alter table user_streaks           enable row level security;
alter table user_domain_mastery    enable row level security;
alter table fsrs_cards             enable row level security;
alter table review_log             enable row level security;
alter table study_sessions         enable row level security;
alter table session_events         enable row level security;
alter table user_achievements      enable row level security;
alter table leaderboard_entries    enable row level security;
alter table tutor_conversations    enable row level security;
alter table ai_generated_content   enable row level security;

-- Knowledge base: public read, admin write (no RLS for now — service role only writes)
alter table subjects               enable row level security;
alter table topics                 enable row level security;
alter table subtopics              enable row level security;
alter table knowledge_chunks       enable row level security;
alter table questions              enable row level security;
alter table question_options       enable row level security;
alter table explanations           enable row level security;
alter table vocabulary_terms       enable row level security;
alter table achievements           enable row level security;

-- ── RLS Policies ──

-- Knowledge base: readable by all authenticated users
create policy "Knowledge base is public to authenticated users"
  on subjects for select to authenticated using (true);
create policy "Topics readable by authenticated users"
  on topics for select to authenticated using (true);
create policy "Subtopics readable by authenticated users"
  on subtopics for select to authenticated using (true);
create policy "Knowledge chunks readable by authenticated users"
  on knowledge_chunks for select to authenticated using (true);
create policy "Published questions readable by authenticated users"
  on questions for select to authenticated using (published = true);
create policy "Question options readable by authenticated users"
  on question_options for select to authenticated using (true);
create policy "Explanations readable by authenticated users"
  on explanations for select to authenticated using (true);
create policy "Vocabulary readable by authenticated users"
  on vocabulary_terms for select to authenticated using (true);
create policy "Achievements readable by authenticated users"
  on achievements for select to authenticated using (true);

-- User profile: own data only
create policy "Users can view own profile"
  on user_profiles for select to authenticated
  using (user_id = auth.uid());
create policy "Users can update own profile"
  on user_profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- User settings: own data only
create policy "Users can manage own settings"
  on user_settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- User XP: own data
create policy "Users can view own XP"
  on user_xp for select to authenticated using (user_id = auth.uid());
create policy "Users can update own XP"
  on user_xp for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Streaks: own data
create policy "Users can view own streaks"
  on user_streaks for select to authenticated using (user_id = auth.uid());
create policy "Users can update own streaks"
  on user_streaks for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Domain mastery: own data
create policy "Users can view own domain mastery"
  on user_domain_mastery for select to authenticated using (user_id = auth.uid());
create policy "Users can update own domain mastery"
  on user_domain_mastery for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- FSRS cards: own data
create policy "Users can manage own FSRS cards"
  on fsrs_cards for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Review log: own data
create policy "Users can manage own review log"
  on review_log for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Study sessions: own data
create policy "Users can manage own study sessions"
  on study_sessions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Session events: through study_sessions ownership
create policy "Users can view own session events"
  on session_events for select to authenticated
  using (
    session_id in (
      select id from study_sessions where user_id = auth.uid()
    )
  );
create policy "Users can insert own session events"
  on session_events for insert to authenticated
  with check (
    session_id in (
      select id from study_sessions where user_id = auth.uid()
    )
  );

-- Achievements: own unlocks
create policy "Users can view own achievements"
  on user_achievements for select to authenticated
  using (user_id = auth.uid());

-- Leaderboard: all authenticated users can see (leaderboard is public by design)
create policy "Leaderboard visible to authenticated users"
  on leaderboard_entries for select to authenticated using (true);

-- Tutor conversations: own data
create policy "Users can manage own tutor conversations"
  on tutor_conversations for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AI generated content: own data
create policy "Users can view own AI content"
  on ai_generated_content for select to authenticated
  using (user_id = auth.uid());

-- ── 12. SEED DATA — AMC SUBJECTS ───────────────────────────
-- The 6 official AMC domains with correct weights

insert into subjects (slug, name_en, name_pt, amc_domain, weight_pct, icon, color_hex, sort_order) values
  ('adult-medicine',    'Adult Health — Medicine',        'Saúde do Adulto — Medicina',     'adult_medicine',    29.17, 'heart-pulse',    '#2e6da4', 1),
  ('adult-surgery',     'Adult Health — Surgery',         'Saúde do Adulto — Cirurgia',     'adult_surgery',     20.83, 'scissors',       '#1b7a4e', 2),
  ('womens-health',     'Women''s Health',                 'Saúde da Mulher',                'womens_health',     12.50, 'baby',           '#8e44ad', 3),
  ('child-health',      'Child Health',                    'Saúde da Criança',               'child_health',      12.50, 'smile',          '#e67e22', 4),
  ('mental-health',     'Mental Health',                   'Saúde Mental',                   'mental_health',     12.50, 'brain',          '#5d6d7e', 5),
  ('population-health', 'Population Health & Ethics',     'Saúde Coletiva e Ética',         'population_health', 12.50, 'users',          '#16a085', 6);

-- ── 13. SEED DATA — ACHIEVEMENTS ───────────────────────────

insert into achievements (slug, name_en, name_pt, description_en, description_pt, icon, criteria, xp_reward, rarity) values
  -- Common
  ('first-blood',      'First Blood',        'Primeiro Passo',     'Answer your first question',             'Responda sua primeira questão',              '🎯', '{"type":"questions_answered","value":1}',       25,   'common'),
  ('day-one',          'Day One',            'Dia Um',             'Complete your first study session',      'Complete sua primeira sessão de estudo',      '📚', '{"type":"sessions_completed","value":1}',       50,   'common'),
  ('streak-3',         '3-Day Streak',       'Sequência de 3',     'Study 3 days in a row',                  'Estude 3 dias seguidos',                     '🔥', '{"type":"streak","value":3}',                  75,   'common'),
  ('correct-10',       'Getting Warmed Up',  'Aquecendo',          'Answer 10 questions correctly',          'Responda 10 questões corretamente',           '✅', '{"type":"correct_answers","value":10}',         50,   'common'),

  -- Rare
  ('streak-7',         'Week Warrior',       'Guerreiro Semanal',  'Study 7 days in a row',                  'Estude 7 dias seguidos',                     '🔥', '{"type":"streak","value":7}',                  200,  'rare'),
  ('correct-50',       'Building Momentum',  'Ganhando Ritmo',     'Answer 50 questions correctly',          'Responda 50 questões corretamente',           '💪', '{"type":"correct_answers","value":50}',         150,  'rare'),
  ('accuracy-70',      'Sharp Mind',         'Mente Afiada',       'Achieve 70% accuracy in any session',    'Alcance 70% de acerto em qualquer sessão',   '🧠', '{"type":"session_accuracy","value":70}',        200,  'rare'),
  ('night-owl',        'Night Owl',          'Coruja Noturna',     'Study after midnight',                   'Estude depois da meia-noite',                '🦉', '{"type":"study_time","after":"22:00"}',         100,  'rare'),

  -- Epic
  ('streak-30',        'Month of Mastery',   'Mês de Domínio',     'Study 30 days in a row',                 'Estude 30 dias seguidos',                    '🏆', '{"type":"streak","value":30}',                 500,  'epic'),
  ('correct-200',      'AMC Ready',          'Pronto para AMC',    'Answer 200 questions correctly',         'Responda 200 questões corretamente',          '⭐', '{"type":"correct_answers","value":200}',        400,  'epic'),
  ('domain-resident',  'Domain Resident',    'Residente de Área',  'Reach Resident level in any domain',     'Alcance nível Residente em qualquer domínio', '🩺', '{"type":"mastery_level","value":"resident"}',   350,  'epic'),
  ('accuracy-80-exam', 'Exam Ace',           'Ás do Exame',        'Score 80%+ in an exam simulation',       'Tire 80%+ numa simulação de prova',          '🎓', '{"type":"exam_sim_accuracy","value":80}',       400,  'epic'),

  -- Legendary
  ('streak-100',       'Iron Will',          'Vontade de Ferro',   'Study 100 days in a row',                'Estude 100 dias seguidos',                   '💎', '{"type":"streak","value":100}',                1500, 'legendary'),
  ('all-domains-specialist', 'AMC Specialist', 'Especialista AMC', 'Reach Specialist level in all 6 domains', 'Alcance nível Especialista nos 6 domínios', '🌟', '{"type":"all_domains_mastery","value":"specialist"}', 2000, 'legendary'),
  ('thousand-questions', 'The Thousand',     'O Milhar',          'Answer 1,000 questions correctly',        'Responda 1.000 questões corretamente',        '🏅', '{"type":"correct_answers","value":1000}',       1000, 'legendary');

-- ── END OF MIGRATION ────────────────────────────────────────
