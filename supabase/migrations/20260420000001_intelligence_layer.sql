-- ============================================================
-- miniMENTE — Intelligence Layer Migration v1.0
-- AMC Exam Preparation Platform
-- ============================================================
-- ULTRATHINK SCHEMA DESIGN:
-- 1. error_notebook_items: caderno de erros pessoal por usuário
-- 2. notebook_contexts: contexto NotebookLM pré-computado por questão
-- 3. exams: simulados pré-definidos com questões curadas
-- 4. exam_attempts: tentativas de simulado por usuário (com resumos AI)
-- ============================================================

-- ── 1. error_notebook_items ────────────────────────────────

create table error_notebook_items (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  question_id      uuid not null references questions(id) on delete cascade,
  note             text,
  review_count     integer not null default 0 check (review_count >= 0),
  added_at         timestamptz not null default now(),
  last_reviewed_at timestamptz,
  unique (user_id, question_id)
);

comment on table error_notebook_items is 'Caderno de erros pessoal: questões que o usuário marcou para revisão';

create index error_notebook_items_user_idx
  on error_notebook_items (user_id, added_at desc);

create index error_notebook_items_review_idx
  on error_notebook_items (user_id, last_reviewed_at nulls first);

-- ── 2. notebook_contexts ───────────────────────────────────

create table notebook_contexts (
  id              uuid primary key default uuid_generate_v4(),
  question_id     uuid not null unique references questions(id) on delete cascade,
  domain          amc_domain not null,
  context_en      text not null,
  context_pt      text,
  source_notebook text not null,
  enriched_at     timestamptz not null default now()
);

comment on table notebook_contexts is 'Contexto clínico pré-computado via NotebookLM para enriquecer insights GPT';

create index notebook_contexts_domain_idx
  on notebook_contexts (domain);

-- ── 3. exams ───────────────────────────────────────────────

create table exams (
  id                  uuid primary key default uuid_generate_v4(),
  title_en            text not null,
  title_pt            text not null,
  description_en      text,
  description_pt      text,
  question_ids        uuid[] not null,
  domain_distribution jsonb,
  difficulty_profile  jsonb,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

comment on table exams is 'Simulados pré-definidos curados com distribuição de domínios e dificuldade';

create index exams_published_idx
  on exams (is_published, created_at desc);

-- ── 4. exam_attempts ───────────────────────────────────────

create table exam_attempts (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  exam_id             uuid not null references exams(id) on delete cascade,
  answers             jsonb not null default '{}',
  score               integer check (score >= 0 and score <= 100),
  total_questions     integer not null,
  completed_questions integer not null default 0
    check (completed_questions >= 0),
  constraint valid_completed check (completed_questions <= total_questions),
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  summary_a           jsonb,   -- "O que a prova cobrou" (temas + conceitos)
  summary_b           jsonb    -- "Caderno de erros" (padrões pessoais)
);

comment on table exam_attempts is 'Tentativas de simulado por usuário, com resumos AI pós-prova';

create index exam_attempts_user_idx
  on exam_attempts (user_id, started_at desc);

create index exam_attempts_exam_idx
  on exam_attempts (exam_id, completed_at desc);

create index exam_attempts_incomplete_idx
  on exam_attempts (user_id, exam_id)
  where completed_at is null;

-- ── 5. ROW LEVEL SECURITY ──────────────────────────────────

alter table error_notebook_items enable row level security;
alter table notebook_contexts     enable row level security;
alter table exams                 enable row level security;
alter table exam_attempts         enable row level security;

-- error_notebook_items: CRUD apenas do próprio usuário
create policy "Users manage own error notebook"
  on error_notebook_items for select to authenticated
  using (user_id = auth.uid());

create policy "Users insert into own error notebook"
  on error_notebook_items for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users update own error notebook items"
  on error_notebook_items for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete from own error notebook"
  on error_notebook_items for delete to authenticated
  using (user_id = auth.uid());

-- notebook_contexts: leitura autenticada, escrita somente service_role
create policy "Notebook contexts readable by authenticated users"
  on notebook_contexts for select to authenticated
  using (true);

-- exams: apenas publicados visíveis
create policy "Published exams readable by authenticated users"
  on exams for select to authenticated
  using (is_published = true);

-- exam_attempts: CRUD do próprio usuário (sem DELETE — histórico preservado)
create policy "Users view own exam attempts"
  on exam_attempts for select to authenticated
  using (user_id = auth.uid());

create policy "Users create own exam attempts"
  on exam_attempts for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users update own exam attempts"
  on exam_attempts for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── END OF MIGRATION ────────────────────────────────────────
