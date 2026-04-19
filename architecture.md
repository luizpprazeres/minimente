# miniMENTE — System Architecture

**Document Type:** Architecture Reference
**Project:** miniMENTE — AI-Powered AMC Exam Preparation Platform
**Version:** 1.0.0
**Status:** Planning
**Audience:** Engineering Team, Technical Leads, Stakeholders

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Product Vision and Goals](#2-product-vision-and-goals)
3. [AMC Exam Domain Model](#3-amc-exam-domain-model)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend and Database Architecture](#7-backend-and-database-architecture)
8. [Database Schema](#8-database-schema)
9. [RAG Pipeline](#9-rag-pipeline)
10. [FSRS-5 Spaced Repetition Engine](#10-fsrs-5-spaced-repetition-engine)
11. [AI Integration Layer](#11-ai-integration-layer)
12. [MCP Integration](#12-mcp-integration)
13. [Learning Modes](#13-learning-modes)
14. [Gamification Engine](#14-gamification-engine)
15. [Internationalization (i18n)](#15-internationalization-i18n)
16. [Authentication and Authorization](#16-authentication-and-authorization)
17. [Content Ingestion Pipeline](#17-content-ingestion-pipeline)
18. [Media and Storage Architecture](#18-media-and-storage-architecture)
19. [Realtime Architecture](#19-realtime-architecture)
20. [Scalability and Performance](#20-scalability-and-performance)
21. [Security Architecture](#21-security-architecture)
22. [AMC Data Strategy and Legal Compliance](#22-amc-data-strategy-and-legal-compliance)
23. [Deployment Architecture](#23-deployment-architecture)
24. [Phased Development Roadmap](#24-phased-development-roadmap)
25. [Key Architectural Decisions](#25-key-architectural-decisions)
26. [Open Questions and Future Considerations](#26-open-questions-and-future-considerations)

---

## 1. Executive Overview

miniMENTE is a full-stack AI-powered study platform purpose-built for candidates preparing for the Australian Medical Council (AMC) Computer Adaptive Test (CAT). It synthesizes four proven learning paradigms into a single cohesive product:

| Paradigm | Inspiration | Implementation |
|----------|-------------|----------------|
| Contextual AI Intelligence | NotebookLM | MCP-powered RAG with curated medical corpus |
| Spaced Repetition | Anki | FSRS-5 algorithm (DSR model, 19 parameters) |
| Gamified Progression | Duolingo | XP, streaks, mastery levels, achievements |
| Adaptive Tutoring | Khanmigo | GPT-4.1 tutor mode grounded in medical knowledge |

The platform is bilingual (English/Portuguese), targets the 6 official AMC domains, and is designed to reduce study time by 20–30% compared to traditional question-bank approaches through intelligent scheduling and contextual explanations.

---

## 2. Product Vision and Goals

### 2.1 Core Value Proposition

- Reduce the volume of required study through intelligent FSRS scheduling
- Ensure explanations are grounded in authoritative Australian medical content (no hallucination)
- Serve bilingual candidates (EN/PT) with identical content quality in both languages
- Provide exam-day simulation fidelity with IRT 3PL scoring model
- Maximize engagement through Duolingo-style gamification loops

### 2.2 Target User

International Medical Graduates (IMGs) preparing for the AMC CAT examination, with a focus on Portuguese-speaking candidates (Brazilian, Portuguese, and Mozambican IMGs).

### 2.3 Quality Constraints

| Constraint | Target |
|------------|--------|
| AI response grounding | 100% — no invented clinical information |
| Explanation language parity | EN = PT quality |
| FSRS target retention | 90% (configurable 70–97%) |
| Vector search latency | < 100ms at scale |
| Exam simulation fidelity | 150q CAT, 3.5h, IRT-scored |
| Mobile responsiveness | Full feature parity on mobile |

---

## 3. AMC Exam Domain Model

### 3.1 Domain Breakdown

The AMC CAT covers 6 domains with fixed weighting:

| Domain | Weight | Approximate Questions (120 scored) |
|--------|--------|-------------------------------------|
| Adult Medicine | 30% | ~36 |
| Adult Surgery | 21% | ~25 |
| Women's Health | 12.5% | ~15 |
| Child Health | 12.5% | ~15 |
| Mental Health | 12.5% | ~15 |
| Population Health & Ethics | 12.5% | ~15 |

### 3.2 Exam Format

- **Format:** Computer Adaptive Test (CAT)
- **Total Questions:** 150 (120 scored + 30 pilot/unscored)
- **Duration:** 3.5 hours (210 minutes)
- **Scoring Model:** Item Response Theory — 3-Parameter Logistic (3PL)
  - Difficulty parameter (b)
  - Discrimination parameter (a)
  - Pseudo-guessing parameter (c)

### 3.3 Visual Content Types

The AMC CAT heavily features clinical media. miniMENTE must support:

| Media Type | Examples |
|------------|---------|
| ECG | 12-lead ECGs, rhythm strips |
| X-ray | Chest PA/lateral, abdominal |
| CT/MRI | Head CT, chest/abdo CT, brain MRI |
| Clinical Photos | Rashes, wounds, eye findings, lesions |

### 3.4 Content Taxonomy

```
AMC Domain
  └── Subject (e.g., Cardiology, Respiratory)
       └── Topic (e.g., Arrhythmias, COPD)
            └── Subtopic (e.g., Atrial Fibrillation, Acute Exacerbations)
                 ├── Knowledge Chunks (RAG source)
                 ├── Questions
                 └── Vocabulary Terms
```

---

## 4. High-Level System Architecture

### 4.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           miniMENTE Platform                            │
│                                                                         │
│  ┌──────────────────┐     ┌──────────────────┐    ┌──────────────────┐ │
│  │   Next.js 15     │     │  Supabase Cloud  │    │  OpenAI API      │ │
│  │   (Vercel Edge)  │────▶│  PostgreSQL       │    │  GPT-4.1         │ │
│  │   App Router     │     │  pgvector         │    │  GPT-4o-mini     │ │
│  │   TypeScript 5   │     │  Auth             │    │  text-embedding  │ │
│  │   Tailwind v4    │     │  Realtime         │    │  -3-small        │ │
│  │   Framer Motion  │     │  Storage          │◀───│                  │ │
│  │   Lottie         │     │  Edge Functions   │    └──────────────────┘ │
│  └──────────────────┘     └──────────────────┘                         │
│           │                        │                                    │
│           │                ┌───────▼──────┐                            │
│           │                │  MCP Server  │                            │
│           └───────────────▶│  notebooklm  │                            │
│                            │  -mcp-struct │                            │
│                            └──────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
        │                                           │
        ▼                                           ▼
  ┌──────────┐                             ┌──────────────┐
  │  Student │                             │ Content Team │
  │  (Browser│                             │ (Admin Panel)│
  │  /Mobile)│                             └──────────────┘
  └──────────┘
```

### 4.2 Request Flow (Typical Study Session)

```
Browser
  │
  ├─[1] Auth (Supabase Auth JWT)
  │
  ├─[2] Next.js App Router (Server Components)
  │       │
  │       ├─[3] FSRS Engine → next due cards (Supabase Edge Function)
  │       │
  │       ├─[4] Question fetch (Supabase RLS-protected query)
  │       │
  │       └─[5] AI explanation request
  │               │
  │               ├─[6] RAG Pipeline (pgvector + BM25)
  │               │
  │               └─[7] GPT-4.1 generation (grounded)
  │
  └─[8] Realtime XP/streak update (Supabase Realtime)
```

### 4.3 Component Ownership

| Layer | Technology | Responsibility |
|-------|-----------|---------------|
| Presentation | Next.js 15, React, Tailwind v4 | UI rendering, routing, animations |
| State | React Server Components + Client hooks | Server-side data, client-side interactivity |
| API | Next.js Route Handlers + Supabase Edge Functions | Business logic, AI calls |
| Data | Supabase PostgreSQL + pgvector | Persistence, vector search |
| AI | OpenAI API (GPT-4.1 + GPT-4o-mini) | Generation, embeddings |
| SRS | FSRS-5 (TypeScript port) | Card scheduling |
| MCP | notebooklm-mcp-structured | Grounded tutoring |
| Auth | Supabase Auth | JWT, OAuth, RLS enforcement |
| Realtime | Supabase Realtime | Live XP, session sync |
| Storage | Supabase Storage + CDN | Medical images |
| Deploy | Vercel + Supabase Cloud | Infrastructure |

---

## 5. Technology Stack

### 5.1 Canonical Stack

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Frontend Framework** | Next.js | 15 (App Router) | RSC, SSG, Edge runtime, Vercel-native |
| **Language** | TypeScript | 5 | Type safety across full stack |
| **CSS** | Tailwind CSS | v4 | Design token system, utility-first |
| **Animation** | Framer Motion | latest | Spring physics, gesture handling |
| **Animation (Lottie)** | Lottie | latest | Achievement unlock animations |
| **Database** | Supabase (PostgreSQL) | latest | pgvector, RLS, Edge Functions |
| **Vector Extension** | pgvector | latest | HNSW indexing, cosine similarity |
| **AI — Reasoning** | OpenAI GPT-4.1 | latest | Explanations, tutor mode |
| **AI — Fast** | OpenAI GPT-4o-mini | latest | Question selection, UI interactions |
| **Embeddings** | text-embedding-3-small | 1536 dims | Semantic search for RAG |
| **SRS Algorithm** | FSRS-5 | 19 params | Optimal scheduling, 20–30% fewer reviews |
| **MCP Server** | notebooklm-mcp-structured | paolodalprato | Grounded tutoring with citations |
| **i18n** | next-intl | latest | EN/PT routing and translations |
| **Auth** | Supabase Auth | latest | JWT, RLS integration |
| **Realtime** | Supabase Realtime | latest | Live session sync, XP events |
| **Storage** | Supabase Storage | latest | ECGs, X-rays, clinical photos |
| **Package Manager** | pnpm | latest | Disk efficiency, monorepo support |
| **Deployment** | Vercel | latest | Edge network, preview deployments |

### 5.2 Development Tooling

| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Code quality and formatting |
| Vitest | Unit testing (FSRS, utilities) |
| Playwright | E2E testing |
| Storybook | Component documentation |
| Husky + lint-staged | Pre-commit hooks |

---

## 6. Frontend Architecture

### 6.1 App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (app)/
│   ├── layout.tsx              # Authenticated shell, nav, XP bar
│   ├── dashboard/              # Daily goals, streak, domain progress
│   ├── study/
│   │   ├── practice/           # FSRS-driven practice mode
│   │   ├── exam-sim/           # 150q CAT simulation
│   │   ├── tutor/              # MCP-powered tutor mode
│   │   ├── vocabulary/         # Bilingual term drills
│   │   └── weak-areas/         # Low retrievability cards
│   ├── domains/
│   │   └── [slug]/             # Per-domain progress view
│   ├── achievements/           # Achievement gallery
│   ├── leaderboard/            # Weekly/monthly rankings
│   ├── settings/               # SRS config, language, notifications
│   └── profile/
├── api/
│   ├── study/
│   │   ├── submit-answer/      # Grade submission + FSRS update
│   │   └── next-card/          # FSRS next card selection
│   ├── ai/
│   │   ├── explain/            # RAG + GPT-4.1 explanation
│   │   ├── tutor/              # MCP tutor interaction
│   │   └── generate-quiz/      # AI question generation (admin)
│   └── admin/
│       ├── questions/
│       └── knowledge/
└── [locale]/                   # next-intl locale routing (en/pt)
```

### 6.2 Component Architecture

Components follow an Atomic Design pattern adapted for the study platform:

```
components/
├── primitives/               # Headless, unstyled base components
│   ├── Button/
│   ├── Card/
│   └── Modal/
├── ui/                       # Styled Tailwind components
│   ├── ProgressRing/
│   ├── XpBar/
│   ├── StreakFlame/
│   └── DomainBadge/
├── study/                    # Study-specific components
│   ├── QuestionCard/         # Question stem + options
│   ├── MediaViewer/          # ECG, X-ray, CT, photo display
│   ├── ExplanationPanel/     # RAG-grounded explanation
│   ├── FsrsScheduleInfo/     # Next review preview
│   └── GradingButtons/       # Again / Hard / Good / Easy
├── gamification/
│   ├── AchievementToast/     # Lottie unlock animation
│   ├── LevelUpModal/
│   ├── StreakShield/
│   └── LeaderboardRow/
├── tutor/
│   ├── TutorChat/
│   ├── CitationHighlight/
│   └── ConfidenceIndicator/
└── layout/
    ├── AppShell/
    ├── DomainNav/
    └── LanguageSwitcher/
```

### 6.3 State Management Strategy

| State Type | Solution | Rationale |
|------------|---------|-----------|
| Server data (questions, cards) | React Server Components | No client hydration cost |
| Session state (current question, answers) | React `useState` / `useReducer` | Local, ephemeral |
| Realtime (XP, streak) | Supabase Realtime hooks | Live sync across tabs |
| Global UI (theme, language) | `next-intl` + CSS variables | No Redux overhead |
| Study progress | React Query | Background refetch, optimistic updates |

### 6.4 Animation System

| Interaction | Technology | Behavior |
|-------------|-----------|----------|
| Page transitions | Framer Motion | Slide + fade between routes |
| Answer feedback | Framer Motion | Spring bounce on correct, shake on wrong |
| Achievement unlock | Lottie | Pre-rendered JSON animation |
| Streak flame | Lottie | Idle pulse + level-up burst |
| Progress rings | Framer Motion | Animated SVG stroke-dashoffset |
| XP bar fill | Framer Motion | Width tween with spring |

### 6.5 Design Token System (Tailwind v4)

```css
/* tokens — defined in global CSS, consumed via Tailwind utilities */
:root {
  /* Domain Colors */
  --color-adult-medicine: #3B82F6;
  --color-adult-surgery: #EF4444;
  --color-womens-health: #EC4899;
  --color-child-health: #10B981;
  --color-mental-health: #8B5CF6;
  --color-population-health: #F59E0B;

  /* FSRS Grade Colors */
  --color-again: #EF4444;
  --color-hard: #F97316;
  --color-good: #22C55E;
  --color-easy: #3B82F6;

  /* Gamification */
  --color-xp: #FBBF24;
  --color-streak: #F97316;
  --color-legendary: #F59E0B;
  --color-epic: #A855F7;
  --color-rare: #3B82F6;
  --color-common: #6B7280;
}
```

---

## 7. Backend and Database Architecture

### 7.1 Supabase Architecture

miniMENTE's backend is entirely built on Supabase, which provides:

```
Supabase Project
├── PostgreSQL 15+
│   ├── Extensions: pgvector, pg_trgm, uuid-ossp, pg_cron
│   └── Row Level Security (RLS) on all user tables
├── Auth
│   ├── Email/Password
│   ├── OAuth (Google)
│   └── JWT token injection
├── Edge Functions (Deno)
│   ├── fsrs-scheduler       — Daily FSRS due-date computation
│   ├── embed-chunk          — Generate embeddings for new content
│   ├── generate-explanation — RAG + GPT-4.1 call
│   └── xp-events            — XP and streak processing
├── Realtime
│   ├── Channel: user:{id}:xp
│   └── Channel: session:{id}:events
└── Storage
    ├── Bucket: medical-media (public CDN, read-only)
    └── Bucket: user-avatars (private, user-scoped)
```

### 7.2 Row Level Security (RLS) Philosophy

Every table containing user data is RLS-protected. The general policy pattern:

```sql
-- Users can only access their own data
CREATE POLICY "user_own_data" ON fsrs_cards
  FOR ALL USING (auth.uid() = user_id);

-- Published content is readable by all authenticated users
CREATE POLICY "published_content" ON questions
  FOR SELECT USING (auth.role() = 'authenticated' AND published = true);

-- Admin-only mutations on content tables
CREATE POLICY "admin_write" ON questions
  FOR INSERT, UPDATE, DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### 7.3 Edge Functions

| Function | Trigger | Responsibility |
|----------|---------|---------------|
| `fsrs-scheduler` | pg_cron (daily 02:00 UTC) | Recompute due_date for all cards |
| `embed-chunk` | INSERT on knowledge_chunks | Call OpenAI embeddings API, store vector |
| `generate-explanation` | HTTP (from Next.js API) | RAG retrieval + GPT-4.1 generation |
| `xp-events` | HTTP (from Next.js API) | XP award, level check, streak update |
| `irt-estimate` | HTTP (admin trigger) | Compute IRT parameters from answer logs |

### 7.4 API Route Architecture (Next.js)

All sensitive AI calls and business logic go through Next.js Route Handlers (not exposed directly to client):

```
app/api/
├── study/
│   ├── submit-answer/route.ts
│   │     • Validate answer
│   │     • Compute FSRS grade
│   │     • Update fsrs_cards + review_log
│   │     • Trigger xp-events Edge Function
│   │     • Return: correct boolean + next FSRS interval
│   │
│   └── next-card/route.ts
│         • Query fsrs_cards WHERE due_date <= now() AND user_id = auth.uid()
│         • Apply domain filter if set
│         • Return: question_id + FSRS state
│
├── ai/
│   ├── explain/route.ts
│   │     • Rate limit check (Redis / KV)
│   │     • Invoke RAG pipeline (pgvector + BM25)
│   │     • Call GPT-4.1 with grounded context
│   │     • Store in ai_generated_content
│   │     • Return: explanation + citations
│   │
│   └── tutor/route.ts
│         • Load conversation history (tutor_conversations)
│         • Invoke MCP client (notebooklm-mcp-structured)
│         • Append to conversation
│         • Return: response + sources + confidence
│
└── admin/
    ├── questions/route.ts      # CRUD, requires admin JWT claim
    └── knowledge/route.ts      # Chunk ingestion, embedding trigger
```

---

## 8. Database Schema

### 8.1 Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    ├──▶ user_profiles
    ├──▶ user_settings
    ├──▶ fsrs_cards ─────────────────▶ questions
    ├──▶ review_log ─────────────────▶ fsrs_cards
    ├──▶ study_sessions
    │         └──▶ session_events
    ├──▶ user_achievements ──────────▶ achievements
    ├──▶ user_streaks
    ├──▶ user_xp
    ├──▶ tutor_conversations
    └──▶ ai_generated_content

subjects
    └──▶ topics
          └──▶ subtopics
                ├──▶ knowledge_chunks  (embedding vector(1536))
                ├──▶ questions
                │       ├──▶ question_options
                │       └──▶ explanations
                └──▶ vocabulary_terms
```

### 8.2 Full Schema Definition

#### User Tables

```sql
-- Extends Supabase auth.users
CREATE TABLE user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  language_pref   TEXT NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'pt')),
  timezone        TEXT NOT NULL DEFAULT 'UTC',
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  srs_target_retention    FLOAT NOT NULL DEFAULT 0.9 CHECK (srs_target_retention BETWEEN 0.7 AND 0.97),
  daily_question_goal     INT NOT NULL DEFAULT 20,
  notifications_enabled   BOOLEAN NOT NULL DEFAULT true,
  theme                   TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system'))
);
```

#### Content Taxonomy Tables

```sql
CREATE TABLE subjects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  name_en           TEXT NOT NULL,
  name_pt           TEXT NOT NULL,
  amc_domain        TEXT NOT NULL,
  weight_percentage FLOAT NOT NULL,
  icon              TEXT,
  color_hex         TEXT,
  "order"           INT NOT NULL
);

CREATE TABLE topics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,
  name_en         TEXT NOT NULL,
  name_pt         TEXT NOT NULL,
  description_en  TEXT,
  description_pt  TEXT,
  "order"         INT NOT NULL
);

CREATE TABLE subtopics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  slug        TEXT UNIQUE NOT NULL,
  name_en     TEXT NOT NULL,
  name_pt     TEXT NOT NULL,
  "order"     INT NOT NULL
);
```

#### Knowledge and Questions

```sql
CREATE TABLE knowledge_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id   UUID NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  content_en    TEXT NOT NULL,
  content_pt    TEXT NOT NULL,
  embedding     vector(1536),                           -- text-embedding-3-small
  source_ref    TEXT,                                   -- e.g., "AMC Question Book Vol 1, p.42"
  chunk_type    TEXT NOT NULL CHECK (
                  chunk_type IN ('concept', 'explanation', 'guideline', 'case')
                ),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW index for sub-100ms cosine similarity search at scale
CREATE INDEX knowledge_chunks_embedding_idx
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE TABLE questions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id         UUID NOT NULL REFERENCES subtopics(id),
  stem_en             TEXT NOT NULL,
  stem_pt             TEXT NOT NULL,
  media_url           TEXT,
  media_type          TEXT NOT NULL DEFAULT 'none'
                        CHECK (media_type IN ('none', 'ecg', 'xray', 'ct', 'photo')),
  difficulty_3pl      FLOAT,                            -- IRT b parameter
  discrimination_3pl  FLOAT,                            -- IRT a parameter
  pseudoguessing_3pl  FLOAT,                            -- IRT c parameter
  amc_domain          TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  published           BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE question_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label       CHAR(1) NOT NULL CHECK (label IN ('A', 'B', 'C', 'D', 'E')),
  text_en     TEXT NOT NULL,
  text_pt     TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (question_id, label)
);

CREATE TABLE explanations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID UNIQUE NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  explanation_en  TEXT NOT NULL,
  explanation_pt  TEXT NOT NULL,
  reasoning_steps JSONB DEFAULT '[]',  -- [{step: 1, text_en: "...", text_pt: "..."}]
  references      JSONB DEFAULT '[]',  -- [{title: "...", source: "...", url: "..."}]
  key_concept_en  TEXT,
  key_concept_pt  TEXT
);
```

#### Vocabulary

```sql
CREATE TABLE vocabulary_terms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id     UUID NOT NULL REFERENCES subtopics(id),
  term_en         TEXT NOT NULL,
  term_pt         TEXT NOT NULL,
  definition_en   TEXT NOT NULL,
  definition_pt   TEXT NOT NULL,
  phonetic_en     TEXT,
  example_en      TEXT,
  example_pt      TEXT
);
```

#### FSRS Tables

```sql
CREATE TABLE fsrs_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id),
  stability       FLOAT NOT NULL DEFAULT 0,
  difficulty      FLOAT NOT NULL DEFAULT 5,
  retrievability  FLOAT NOT NULL DEFAULT 1.0,
  due_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_review     TIMESTAMPTZ,
  review_count    INT NOT NULL DEFAULT 0,
  state           TEXT NOT NULL DEFAULT 'new'
                    CHECK (state IN ('new', 'learning', 'review', 'relearning')),
  UNIQUE (user_id, question_id)
);

-- Index for efficient due-card queries
CREATE INDEX fsrs_cards_due_idx ON fsrs_cards (user_id, due_date)
  WHERE state != 'new';
CREATE INDEX fsrs_cards_retrievability_idx ON fsrs_cards (user_id, retrievability);

CREATE TABLE review_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         UUID NOT NULL REFERENCES fsrs_cards(id),
  grade           SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 4),  -- 1=Again, 4=Easy
  response_time_ms INT,
  scheduled_days  FLOAT,
  elapsed_days    FLOAT,
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX review_log_user_idx ON review_log (user_id, reviewed_at DESC);
```

#### Study Sessions

```sql
CREATE TABLE study_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode                TEXT NOT NULL CHECK (
                        mode IN ('practice', 'exam_sim', 'tutor', 'vocabulary')
                      ),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at            TIMESTAMPTZ,
  domain_filter       TEXT,
  questions_answered  INT NOT NULL DEFAULT 0,
  correct_count       INT NOT NULL DEFAULT 0,
  xp_earned           INT NOT NULL DEFAULT 0,
  streak_maintained   BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE session_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,  -- e.g., 'question_answered', 'explanation_viewed', 'hint_used'
  payload     JSONB DEFAULT '{}',
  ts          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Gamification

```sql
CREATE TABLE achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name_en         TEXT NOT NULL,
  name_pt         TEXT NOT NULL,
  description_en  TEXT NOT NULL,
  description_pt  TEXT NOT NULL,
  icon            TEXT NOT NULL,
  criteria        JSONB NOT NULL,  -- machine-readable unlock conditions
  xp_reward       INT NOT NULL DEFAULT 0,
  rarity          TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE TABLE user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES achievements(id),
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE user_streaks (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak            INT NOT NULL DEFAULT 0,
  longest_streak            INT NOT NULL DEFAULT 0,
  last_study_date           DATE,
  streak_shields_available  INT NOT NULL DEFAULT 0
);

CREATE TABLE user_xp (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp        INT NOT NULL DEFAULT 0,
  level           INT NOT NULL DEFAULT 1,
  xp_to_next_level INT NOT NULL DEFAULT 100
);
```

#### AI Tables

```sql
CREATE TABLE tutor_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES study_sessions(id),
  messages    JSONB NOT NULL DEFAULT '[]',  -- [{role, content, ts, citations}]
  context     JSONB NOT NULL DEFAULT '{}',  -- {subtopic_id, domain, recent_performance}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_generated_content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt_type     TEXT NOT NULL,  -- 'explanation', 'tutor_response', 'quiz_generation'
  input_context   JSONB NOT NULL DEFAULT '{}',
  output_text     TEXT NOT NULL,
  language        TEXT NOT NULL CHECK (language IN ('en', 'pt', 'both')),
  model_used      TEXT NOT NULL,
  tokens_used     INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 9. RAG Pipeline

### 9.1 Pipeline Overview

The RAG pipeline is the backbone of miniMENTE's AI intelligence. Every AI-generated explanation and tutor response is grounded exclusively in the curated medical knowledge base — no external knowledge injection is permitted.

```
┌──────────────────────────────────────────────────────────────────┐
│                        RAG Pipeline                              │
│                                                                  │
│  User Query / Learning Context                                   │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────┐                                            │
│  │ Query Preprocessor│                                          │
│  │  • Language detect│  ──── EN or PT ────▶ locale-aware search │
│  │  • Medical NER    │  ──── Entities ────▶ term boosting       │
│  │  • Query expand   │  ──── 3 paraphrases (GPT-4o-mini)        │
│  │  • Domain classif.│  ──── AMC domain filter                  │
│  └─────────────────┘                                            │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────┐                       │
│  │       Hybrid Retrieval Layer         │                       │
│  │                                      │                       │
│  │  pgvector cosine  BM25 keyword       │                       │
│  │  (top 10)      +  (top 10)           │                       │
│  │        │              │              │                       │
│  │        └──────┬───────┘              │                       │
│  │               ▼                      │                       │
│  │    Reciprocal Rank Fusion            │                       │
│  │    (merged result set)               │                       │
│  └──────────────────────────────────────┘                       │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────┐                                            │
│  │   Reranking      │                                           │
│  │  BGE-Reranker-v2 │  ──── Cross-encoder scoring               │
│  │  Focus Mode      │  ──── Extract relevant sentences          │
│  │  Keep top 3–5    │                                           │
│  └─────────────────┘                                            │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────┐                        │
│  │      Context Assembly               │                        │
│  │  • Contrastive ICL                  │  correct + distractors │
│  │  • Session context (last 5 Q)       │  domain performance    │
│  │  • FSRS signal (low retrievability) │  target weak cards     │
│  └─────────────────────────────────────┘                        │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────┐                        │
│  │       Generation Layer              │                        │
│  │  GPT-4.1   ─── explanations, tutor  │                        │
│  │  GPT-4o-mini ─ question select, UI  │                        │
│  │                                     │                        │
│  │  System prompt enforcement:         │                        │
│  │  • Grounding-only (no invention)    │                        │
│  │  • Bilingual output (EN + PT)       │                        │
│  │  • Citation requirement             │                        │
│  └─────────────────────────────────────┘                        │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────┐                        │
│  │    Response Post-Processing         │                        │
│  │  • Source citation extraction       │                        │
│  │  • Bilingual alignment validation   │                        │
│  │  • Store → ai_generated_content     │                        │
│  └─────────────────────────────────────┘                        │
│         │                                                        │
│         ▼                                                        │
│  Output to UI (animated, citations highlighted)                  │
└──────────────────────────────────────────────────────────────────┘
```

### 9.2 Hybrid Retrieval Detail

#### pgvector Semantic Search

```sql
SELECT
  kc.id,
  kc.content_en,
  kc.content_pt,
  kc.source_ref,
  1 - (kc.embedding <=> query_embedding) AS cosine_similarity
FROM knowledge_chunks kc
WHERE kc.subtopic_id IN (
  SELECT id FROM subtopics WHERE topic_id IN (
    SELECT id FROM topics WHERE subject_id IN (
      SELECT id FROM subjects WHERE amc_domain = $domain_filter
    )
  )
)
ORDER BY kc.embedding <=> query_embedding
LIMIT 10;
```

#### BM25 Keyword Search

Uses `pg_trgm` and full-text search with `tsvector` for exact medical term matching (drug names, eponyms, test names).

```sql
SELECT
  id,
  content_en,
  content_pt,
  source_ref,
  ts_rank(to_tsvector('english', content_en), plainto_tsquery('english', $query)) AS bm25_rank
FROM knowledge_chunks
WHERE to_tsvector('english', content_en) @@ plainto_tsquery('english', $query)
ORDER BY bm25_rank DESC
LIMIT 10;
```

#### Reciprocal Rank Fusion

```typescript
// RRF score = Σ 1/(k + rank_i) for each result list
const RRF_K = 60;

function reciprocalRankFusion(
  vectorResults: RankedChunk[],
  bm25Results: RankedChunk[]
): RankedChunk[] {
  const scores = new Map<string, number>();

  vectorResults.forEach((chunk, rank) => {
    scores.set(chunk.id, (scores.get(chunk.id) ?? 0) + 1 / (RRF_K + rank + 1));
  });

  bm25Results.forEach((chunk, rank) => {
    scores.set(chunk.id, (scores.get(chunk.id) ?? 0) + 1 / (RRF_K + rank + 1));
  });

  return Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => allChunks.find(c => c.id === id)!);
}
```

### 9.3 Contrastive In-Context Learning (ICL)

Rather than simply providing relevant facts, the context assembly step includes:
- **Correct reasoning path:** How to arrive at the right answer
- **Common distractor explanations:** Why each wrong answer is wrong
- **Domain-specific pitfalls:** Common AMC candidate errors in this subtopic

This significantly improves explanation quality and mirrors how experienced clinicians teach.

### 9.4 System Prompt Contract

```
You are a medical education expert specializing in AMC CAT preparation.

STRICT RULES:
1. ONLY use information from the provided context passages.
2. If the context does not contain enough information, say so explicitly.
3. NEVER invent drug doses, diagnostic criteria, or clinical facts.
4. Always cite the source passage(s) you used.
5. Provide your response in BOTH English and Portuguese.
6. Structure: key concept → explanation → why distractors are wrong → clinical pearl.
```

---

## 10. FSRS-5 Spaced Repetition Engine

### 10.1 Algorithm Overview

FSRS-5 (Free Spaced Repetition Scheduler v5) is a state-of-the-art SRS algorithm based on the **DSR (Difficulty, Stability, Retrievability)** model. It achieves 20–30% fewer reviews than SM-2 (Anki default) for the same target retention.

### 10.2 Mathematical Model

#### Retrievability Function

```
R(t, S) = (1 + F × t/S)^C

where:
  F = 19/81 ≈ 0.2346
  C = -0.5
  t = elapsed time since last review (days)
  S = current stability (days to reach 90% retention)
```

#### Interval Calculation

```
I = (S/F) × (r_d^(1/C) - 1)

where:
  r_d = desired retention (default 0.9)
  I = next review interval (days)
```

#### Example

A card with Stability = 10 days and target retention = 0.9:
```
I = (10 / 0.2346) × (0.9^(-2) - 1)
I = 42.6 × (1.2346 - 1)
I = 42.6 × 0.2346
I ≈ 10.0 days
```

### 10.3 FSRS-5 Parameters

The algorithm uses 19 learnable parameters (w0–w18):

| Parameter Group | Parameters | Role |
|----------------|-----------|------|
| Initial stability (new cards) | w0–w3 | Stability after first review (per grade) |
| Initial difficulty | w4–w5 | Difficulty after first review |
| Recall stability | w6–w8 | Stability increase on successful recall |
| Forget stability | w9–w10 | Stability after forgetting |
| Difficulty update | w11–w14 | How grade shifts difficulty |
| Stability decay | w15–w16 | Decay shape constants |
| Short-term memory | w17–w18 | Same-day re-learning modifiers |

Default parameters are pre-trained on the FSRS open dataset. Personalized optimization becomes available after 1,000+ reviews (gradient descent on the user's own review history).

### 10.4 Card States and Transitions

```
      [New Card]
           │
     First Review
      /   |   |   \
  Again Hard Good Easy
     │    │    │    │
     └────┴────┴────┘
           │
      [Learning]
     (short intervals: hours)
           │
     Consolidated
           │
      [Review]
     (days/weeks/months)
           │
    Forgot (Again)
           │
     [Relearning]
           │
     Re-consolidated
           │
      [Review] ◀──────────────
```

### 10.5 Grade Semantics

| Grade | Key | Meaning | Typical Next Interval |
|-------|-----|---------|----------------------|
| 1 — Again | `R` | Completely forgot | Minutes (learning step) |
| 2 — Hard | `H` | Recalled with difficulty | < current interval |
| 3 — Good | `G` | Recalled with effort | ~current interval |
| 4 — Easy | `E` | Recalled immediately | > current interval × 2 |

### 10.6 Weak Areas Mode

Cards with retrievability < 0.7 are surfaced in the "Weak Areas Drill" mode, regardless of their scheduled due date. This proactively addresses knowledge gaps before they become forgetting events.

```typescript
const weakCards = await supabase
  .from('fsrs_cards')
  .select('*, questions(*)')
  .eq('user_id', userId)
  .lt('retrievability', 0.7)
  .order('retrievability', { ascending: true })
  .limit(20);
```

### 10.7 FSRS Scheduler Edge Function

The daily scheduler (pg_cron, 02:00 UTC) recomputes retrievability for all active cards:

```typescript
// Pseudocode for FSRS scheduler
for each active card:
  elapsed = now - last_review  (days)
  new_retrievability = fsrs_retrievability(elapsed, card.stability)
  UPDATE fsrs_cards SET retrievability = new_retrievability WHERE id = card.id
```

---

## 11. AI Integration Layer

### 11.1 Model Assignment Strategy

| Task | Model | Rationale |
|------|-------|-----------|
| Explanation generation | GPT-4.1 | High fidelity, minimal hallucination |
| Tutor mode responses | GPT-4.1 | Reasoning depth, citation accuracy |
| Question query expansion | GPT-4o-mini | 3 paraphrases, fast and cheap |
| Question selection logic | GPT-4o-mini | Simple classification, low cost |
| UI interaction responses | GPT-4o-mini | Latency-sensitive, low complexity |
| Admin question generation | GPT-4.1 | Accuracy critical |

### 11.2 Token Budget Guidelines

| Task | Max Input Tokens | Max Output Tokens |
|------|-----------------|------------------|
| Explanation (practice) | 3,000 | 800 |
| Explanation (tutor deep) | 6,000 | 1,500 |
| Tutor conversation turn | 4,000 | 600 |
| Query expansion | 200 | 150 |
| Question generation (admin) | 8,000 | 2,000 |

### 11.3 Grounding Enforcement

To prevent hallucination of clinical facts, ALL generation prompts use the following structural contract:

```typescript
const GROUNDING_SYSTEM_PROMPT = `
You are a medical education assistant for AMC exam preparation.

RULES (strictly enforced):
- Answer ONLY using the provided <context> passages.
- If context is insufficient, respond: "The provided sources do not cover this topic."
- Cite source_ref for every clinical claim using [Source: {ref}] notation.
- Never invent drug doses, diagnostic criteria, lab values, or guidelines.
- Do not use external training knowledge when it contradicts the context.
- Always respond in both English and Portuguese.
`;
```

### 11.4 Rate Limiting and Cost Controls

| Limit | Value | Enforcement |
|-------|-------|------------|
| Explanations per user/day | 50 | Vercel KV counter |
| Tutor turns per session | 30 | Session state check |
| Admin question generation | 100/hour | Edge Function rate limiter |
| Total daily token budget | Monitored | OpenAI usage dashboard alert |

---

## 12. MCP Integration

### 12.1 Overview

miniMENTE integrates the `paolodalprato/notebooklm-mcp-structured` MCP server to power the Tutor Mode. This provides citation-aware, source-constrained answers that mirror the NotebookLM experience within the study platform.

### 12.2 MCP Architecture

```
miniMENTE Tutor Session
        │
        ▼
User asks clinical question
        │
        ▼
┌───────────────────────────────────────┐
│   MCP Client                          │
│   (notebooklm-mcp-structured)         │
│                                       │
│   Tool: ask_question                  │
│   Prompt structure:                   │
│   • Citation-aware                    │
│   • Source-constrained                │
│   • Confidence scoring                │
└───────────────────────────────────────┘
        │
        ▼
RAG corpus (Supabase pgvector)
        │
        ▼
Grounded response
(NO external knowledge injection)
        │
        ▼
Response to UI:
• Answer text (EN + PT)
• Source citations (highlighted)
• Confidence score
• Source references
```

### 12.3 MCP Tools Used

| Tool | Purpose | Frequency |
|------|---------|----------|
| `ask_question` | Primary tutoring interaction — get grounded answer | Every tutor turn |
| `reset_session` | Start a new study session (clear context window) | Session start |
| `list_sessions` | Show session history to user | Dashboard |
| `search_notebooks` | Domain-specific knowledge search | Supplementary lookup |

### 12.4 Tutor Mode Flow

```typescript
// Tutor turn execution
async function executeTutorTurn(
  question: string,
  conversationId: string,
  userId: string
): Promise<TutorResponse> {
  // 1. Load conversation history
  const conversation = await loadConversation(conversationId);

  // 2. Build MCP request with citation requirements
  const mcpRequest = {
    tool: 'ask_question',
    input: {
      question,
      require_citations: true,
      source_constraint: 'corpus_only',
      language: 'both',
      context: conversation.context,
    },
  };

  // 3. Invoke MCP client
  const mcpResponse = await mcpClient.invoke(mcpRequest);

  // 4. Post-process
  const processed = extractCitations(mcpResponse);

  // 5. Persist
  await appendToConversation(conversationId, {
    role: 'assistant',
    content: processed.text,
    citations: processed.citations,
    confidence: processed.confidence,
    ts: new Date().toISOString(),
  });

  return processed;
}
```

### 12.5 Teaching Protocol (Tutor Mode)

The tutor follows a Socratic teaching sequence:
1. **Explain concept** — grounded in RAG corpus, with citations
2. **Worked example** — walk through a sample question step-by-step
3. **Second example** — guided with scaffolding questions
4. **User practice** — user attempts similar question independently
5. **Targeted feedback** — explanation of errors using RAG-grounded content

---

## 13. Learning Modes

### 13.1 Mode Overview

| Mode | FSRS? | AI? | Timer? | Feedback |
|------|-------|-----|--------|---------|
| Practice | Yes | Explanations | No | Immediate |
| Exam Simulation | No | No | Yes (3.5h) | After submit |
| Tutor | No | Full MCP tutor | No | Conversational |
| Vocabulary | Light | Bilingual help | No | Immediate |
| Weak Areas Drill | Yes (R<0.7) | Explanations | No | Immediate |

### 13.2 Practice Mode

The default daily study mode. Driven entirely by FSRS scheduling.

```
Session Start
     │
     ▼
Load due cards (FSRS due_date <= now())
Apply domain filter (optional)
Interleave new cards per daily_question_goal
     │
     ▼
For each question:
  • Display stem + options (+ media if present)
  • User selects answer
  • Reveal correct answer + key concept
  • Show FSRS grade buttons (Again/Hard/Good/Easy)
  • User grades self
  • FSRS card updated
  • XP awarded
     │
     ▼
Session Summary:
  • Accuracy rate
  • XP earned
  • Streak status
  • Next session forecast (FSRS)
```

### 13.3 Exam Simulation Mode

Full-fidelity AMC CAT simulation.

```
Configuration:
  • Select domains (or full exam)
  • Confirm 150 questions / 3.5 hours

During Exam:
  • No feedback (AMC-accurate)
  • No FSRS grading
  • Timer visible
  • Mark for review functionality
  • Navigation between questions

Post-Submission:
  • IRT-scored result (3PL model)
  • Performance breakdown by domain
  • Time analysis per question
  • FSRS batch-update based on answers
  • Detailed explanations unlocked
```

### 13.4 Vocabulary Mode

Duolingo-style bilingual term drills.

```
Drill Types (rotating):
  • EN term → PT translation
  • PT term → EN translation
  • Definition → term (EN or PT)
  • Multiple choice (4 options)
  • Fill-in-the-blank example sentence

Mechanics:
  • 3 hearts (lose on wrong answer)
  • Earn XP per correct streak
  • FSRS-light scheduling per term
  • Phonetic guide for EN terms
```

### 13.5 Weak Areas Drill

Targets cards where `retrievability < 0.7`. Prevents the "forgetting cliff" before exam day.

- Surfaced separately from regular FSRS queue
- Prioritized by lowest retrievability first
- Full explanation available immediately (not deferred)
- Flagged visually as "at risk" cards

---

## 14. Gamification Engine

### 14.1 XP System

| Action | XP Reward |
|--------|----------|
| Answer easy question correctly | +10 |
| Answer hard question correctly | +25 |
| Answer very hard question correctly (b > 1.5) | +40 |
| Complete daily goal | +50 |
| Maintain streak | +streak_multiplier × base_xp |
| Unlock achievement | achievement.xp_reward |
| Complete exam simulation | +100 |
| Perfect session (100% accuracy) | +75 |

#### Streak Multipliers

| Streak Length | Multiplier |
|--------------|-----------|
| 1–6 days | 1.0× |
| 7–13 days | 1.25× |
| 14–29 days | 1.5× |
| 30–59 days | 1.75× |
| 60+ days | 2.0× |

### 14.2 Mastery Levels

Six levels per AMC domain, unlocked by total correct answers in that domain:

| Level | Title | Threshold |
|-------|-------|----------|
| 1 | Novice | 0 |
| 2 | Intern | 50 correct |
| 3 | Resident | 150 correct |
| 4 | Registrar | 350 correct |
| 5 | Specialist | 700 correct |
| 6 | Fellow | 1,200 correct |

### 14.3 Achievement System

60+ achievements across 4 rarity tiers:

| Rarity | Examples |
|--------|---------|
| Common | First answer, 3-day streak, complete a domain session |
| Rare | 30-day streak, all domains studied, 100 cards mastered |
| Epic | 500-day streak, 1,000 correct answers, perfect exam sim |
| Legendary | Fellow in any domain, 2,000 correct answers, 100-day streak |

Achievement unlock triggers a full-screen Lottie animation and XP award.

### 14.4 Streak Shields

Streak shields protect a user's streak on a missed day:
- Earned by: completing bonus goals, achieving milestones
- Maximum held: 2 shields
- Auto-consumed on the first missed day

### 14.5 Leaderboard

| Leaderboard Type | Scope | Reset |
|-----------------|-------|-------|
| Global weekly | All users | Every Monday |
| Global monthly | All users | First of month |
| Domain weekly | Per AMC domain | Every Monday |

Ranking metric: XP earned in the period (not total XP, to keep competitive for newcomers).

### 14.6 "Next Action Always Visible" Principle

The UI must never leave the user without a clear, actionable next step. Implementation:

- Dashboard always shows: "Continue studying → X cards due"
- After session end: "Start next session" or "Take a break (resume tomorrow)"
- After achievement unlock: "View achievement" or "Continue studying"
- Empty state handling: If no cards due, show vocabulary drill or exam simulation CTA

---

## 15. Internationalization (i18n)

### 15.1 Architecture

Built with `next-intl` using locale-based routing:

```
/en/dashboard     — English
/pt/dashboard     — Portuguese
```

Default locale detection: browser `Accept-Language` header, overridable in user settings (`language_pref`).

### 15.2 Translation Architecture

```
messages/
├── en/
│   ├── common.json       — Shared UI strings
│   ├── study.json        — Study mode labels
│   ├── gamification.json — Achievement names, level titles
│   └── errors.json       — Error messages
└── pt/
    ├── common.json
    ├── study.json
    ├── gamification.json
    └── errors.json
```

### 15.3 Content Language Strategy

| Content Type | Strategy |
|-------------|---------|
| Question stems | Both EN and PT stored in DB, served by locale |
| Explanations | Both EN and PT generated simultaneously by GPT-4.1 |
| Knowledge chunks | Both EN and PT stored; embedding generated for both |
| Achievement names | Both in DB (name_en, name_pt) |
| Vocabulary terms | Both in DB; term_en/term_pt are the learning targets |

### 15.4 Bilingual Quality Assurance

- Explanations generated in both languages in a single GPT-4.1 call (reduces translation drift)
- Bilingual alignment validation in post-processing step
- Human review required before publishing any content (see Phase 1 pipeline)

### 15.5 Medical Terminology Handling

Medical terminology is intentionally kept in Latin/English in PT translations when that is standard clinical practice (e.g., "atrial fibrillation" remains "fibrilação atrial" not translated incorrectly). The vocabulary module specifically teaches EN medical terms to PT-speaking candidates.

---

## 16. Authentication and Authorization

### 16.1 Auth Flow

```
User visits /en/login
     │
     ▼
Supabase Auth
  ├── Email/Password
  └── Google OAuth
     │
     ▼
JWT issued (access_token + refresh_token)
     │
     ▼
Next.js middleware validates JWT
     │
     ▼
User redirected to /dashboard
     │
     ▼
All subsequent API calls include Authorization: Bearer {token}
     │
     ▼
Supabase RLS policies evaluated against auth.uid() on every query
```

### 16.2 JWT Claims

Custom claims injected at auth time:

```json
{
  "sub": "user-uuid",
  "role": "authenticated",
  "app_metadata": {
    "role": "user",          // or "admin", "content_reviewer"
    "language_pref": "pt"
  }
}
```

### 16.3 Role-Based Access

| Role | Permissions |
|------|------------|
| `user` | Own data only (RLS), read published content |
| `content_reviewer` | Read all content, approve questions |
| `admin` | Full access: publish questions, manage content, analytics |

### 16.4 Row Level Security Summary

All user tables enforce:
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` restricted to `auth.uid() = user_id`
- Content tables: `SELECT` requires `auth.role() = 'authenticated'` and `published = true`
- Admin operations: require `app_metadata.role = 'admin'` JWT claim

---

## 17. Content Ingestion Pipeline

### 17.1 Three-Phase Content Strategy

```
Phase 1: Manual (AMC question books)
Phase 2: AI-Assisted (GPT-4.1 generation + human validation)
Phase 3: Automated Enrichment (explanations, translations, media)
```

### 17.2 Phase 1 — Manual Ingestion

```
AMC Question Books (Vol 1 & 2)
         │
         ▼
Structured JSON extraction
(manual by content team)
         │
         ▼
JSON schema validation
         │
         ▼
Human medical review
(doctor validation of clinical accuracy)
         │
         ▼
IRT parameter estimation
(based on candidate response data)
         │
         ▼
Publish (published = true)
```

#### Ingestion JSON Schema

```json
{
  "subtopic_slug": "atrial-fibrillation",
  "stem_en": "A 68-year-old woman presents with palpitations...",
  "stem_pt": "Uma mulher de 68 anos apresenta palpitações...",
  "options": [
    { "label": "A", "text_en": "...", "text_pt": "...", "is_correct": false },
    { "label": "B", "text_en": "...", "text_pt": "...", "is_correct": true },
    ...
  ],
  "explanation_en": "...",
  "explanation_pt": "...",
  "key_concept_en": "Rate control is first-line for AF...",
  "reasoning_steps": [...],
  "references": [{ "title": "AMC Question Book Vol 1", "page": 42 }],
  "media_type": "ecg",
  "media_url": "ecg-af-001.png"
}
```

### 17.3 Phase 2 — AI-Assisted Generation

```
Knowledge Chunks (RAG corpus)
         │
         ▼
GPT-4.1 question generation prompt:
"Generate a clinical scenario question for AMC CAT
 based ONLY on this knowledge passage. Include 5 options
 with one correct answer and four plausible distractors."
         │
         ▼
Human validation gate
(content reviewer approval required)
         │
         ▼
IRT parameter estimation
(difficulty, discrimination, pseudo-guessing)
         │
         ▼
Publish
```

### 17.4 Phase 3 — Automated Enrichment

```
Published question
         │
         ├──▶ Explanation generation
         │         RAG retrieval + GPT-4.1
         │         Bilingual (EN + PT simultaneously)
         │
         ├──▶ Knowledge chunk extraction
         │         Key concepts → knowledge_chunks
         │         OpenAI embed-chunk → embedding vector
         │
         └──▶ Media association
                   Link ECG/X-ray/CT to question
                   Supabase Storage upload
                   CDN URL stored in questions.media_url
```

### 17.5 Content Quality Gates

| Gate | Check | Enforcer |
|------|-------|---------|
| Medical accuracy | Doctor signs off | Human reviewer |
| Language parity | EN and PT present and aligned | Automated check |
| IRT parameters | All 3PL params estimated | Automated (after 50+ answers) |
| RAG grounding | Explanation cites knowledge_chunks | System prompt enforcement |
| No competitor IP | Passes legal review | Human reviewer |

---

## 18. Media and Storage Architecture

### 18.1 Storage Structure

```
Supabase Storage
├── medical-media/          (public, CDN-served)
│   ├── ecg/
│   │   └── {question_id}.{jpg|png}
│   ├── xray/
│   │   └── {question_id}.{jpg|png}
│   ├── ct/
│   │   └── {question_id}.{jpg|png|mp4}
│   └── photo/
│       └── {question_id}.{jpg|png}
└── user-avatars/           (private, user-scoped RLS)
    └── {user_id}.{jpg|png}
```

### 18.2 Image Delivery

- All `medical-media/` images served via Supabase CDN (global edge caching)
- Next.js `Image` component with `priority` flag for above-fold exam images
- WebP conversion at upload time for optimal compression
- Responsive srcset: 640w, 1024w, 1920w (medical images need high resolution)

### 18.3 Medical Image Accessibility

- Alt text required for all medical images (EN and PT)
- High-contrast mode supported via CSS filter
- Zoom functionality for ECGs and X-rays (Framer Motion pinch-to-zoom)

---

## 19. Realtime Architecture

### 19.1 Use Cases

| Event | Channel | Consumers |
|-------|---------|----------|
| XP earned | `user:{id}:xp` | XP bar animation |
| Streak updated | `user:{id}:streak` | Streak flame animation |
| Achievement unlocked | `user:{id}:achievement` | Achievement toast |
| Level up | `user:{id}:level` | Level-up modal |
| Session heartbeat | `session:{id}:events` | Session persistence |

### 19.2 Realtime Event Flow

```typescript
// Client-side subscription
const channel = supabase
  .channel(`user:${userId}:xp`)
  .on('broadcast', { event: 'xp_earned' }, ({ payload }) => {
    animateXpBar(payload.xp_delta, payload.new_total);
  })
  .on('broadcast', { event: 'level_up' }, ({ payload }) => {
    showLevelUpModal(payload.new_level);
  })
  .subscribe();

// Server-side broadcast (after XP award)
await supabase.channel(`user:${userId}:xp`).send({
  type: 'broadcast',
  event: 'xp_earned',
  payload: { xp_delta: 25, new_total: 1250 },
});
```

---

## 20. Scalability and Performance

### 20.1 Performance Targets

| Metric | Target | Strategy |
|--------|--------|---------|
| Page load (LCP) | < 2.5s | Next.js RSC, CDN |
| Vector search | < 100ms | HNSW index on pgvector |
| AI explanation | < 5s | GPT-4.1, streaming response |
| Tutor turn | < 3s | GPT-4o-mini for quick turns |
| FSRS scheduling | < 200ms | Pre-computed via pg_cron |

### 20.2 Database Optimization

#### Indexes

```sql
-- FSRS: efficient due-card lookup
CREATE INDEX fsrs_cards_due_idx ON fsrs_cards (user_id, due_date)
  WHERE state != 'new';

-- FSRS: weak areas drill
CREATE INDEX fsrs_cards_retrievability_idx ON fsrs_cards (user_id, retrievability);

-- Vector: HNSW for sub-100ms at scale
CREATE INDEX knowledge_chunks_embedding_idx
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Questions: domain filtering
CREATE INDEX questions_domain_idx ON questions (amc_domain, published);

-- Review log: user history
CREATE INDEX review_log_user_idx ON review_log (user_id, reviewed_at DESC);

-- BM25 full text
CREATE INDEX knowledge_chunks_fts_idx ON knowledge_chunks
  USING gin(to_tsvector('english', content_en));
```

#### Connection Pooling

Supabase provides PgBouncer connection pooling. Next.js API routes use connection pooling mode (transaction mode) to avoid connection exhaustion under load.

### 20.3 Caching Strategy

| Layer | Technology | TTL | What is cached |
|-------|-----------|-----|----------------|
| CDN | Vercel Edge / Supabase CDN | 24h+ | Medical images, static assets |
| API response | Vercel KV | 1h | Published questions (rarely change) |
| Session | Vercel KV | 24h | Rate limit counters |
| FSRS schedule | In-memory (Edge Function) | Session | Pre-fetched next 5 cards |

### 20.4 Scalability Architecture

```
Growth Tier: 0–1,000 users
  └── Single Supabase project, Vercel hobby → pro

Growth Tier: 1,000–10,000 users
  └── Supabase Pro + read replica for analytics
  └── Redis (Upstash) for hot question caching
  └── Vercel Pro for edge functions

Growth Tier: 10,000–100,000 users
  └── Supabase Business + dedicated connection pooler
  └── Separate analytics DB (ClickHouse or Supabase Analytics)
  └── Queue system (Inngest or Trigger.dev) for async AI generation
  └── CDN for vector index pre-warming
```

### 20.5 AI Cost Optimization

| Strategy | Saving |
|---------|--------|
| GPT-4o-mini for fast interactions | ~10× cheaper than GPT-4.1 |
| Cache explanations in ai_generated_content | Avoid re-generation |
| Batch embedding generation at ingestion | No per-query embedding cost |
| Rate limit per user per day | Prevent abuse |
| Streaming responses | Perceived performance improvement |

---

## 21. Security Architecture

### 21.1 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized data access | Supabase RLS on all tables |
| API key exposure | Keys in Vercel env (server-only), never in client bundle |
| Prompt injection (AI) | Strict system prompts, input sanitization |
| Content scraping | Rate limiting, auth required for all content |
| Medical misinformation | RAG grounding, human review gate |
| SQL injection | Parameterized queries via Supabase client |
| XSS | React default escaping + CSP headers |

### 21.2 API Security

```typescript
// All AI API routes enforce:
// 1. Authentication check
const user = await getSupabaseUser(request);
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

// 2. Rate limit check
const { success } = await rateLimit.limit(user.id);
if (!success) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });

// 3. Input sanitization
const sanitized = sanitizeInput(request.body);

// 4. AI call with grounding prompt
const response = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    { role: 'system', content: GROUNDING_SYSTEM_PROMPT },
    { role: 'user', content: buildGroundedPrompt(sanitized, context) },
  ],
});
```

### 21.3 Environment Variables

```
# Server-only (never in NEXT_PUBLIC_*)
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=...
MCP_SERVER_URL=...

# Client-safe (Supabase anon key is designed to be public with RLS)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 22. AMC Data Strategy and Legal Compliance

### 22.1 Content Source Hierarchy

| Priority | Source | Acquisition Method | Status |
|----------|--------|-------------------|--------|
| Primary | AMC Question Books Vol 1 & 2 | Purchase official license | Required |
| Secondary | Therapeutic Guidelines Australia | Subscription | Required |
| Secondary | MIMS Australia | Subscription | Required |
| Tertiary | Public domain medical textbooks | Direct download | Available |
| Tertiary | PubMed open-access papers | Free API | Available |
| Generated | AI-generated questions | From retrieved content | Requires human validation |

### 22.2 Legal Constraints

| Constraint | Details |
|------------|---------|
| No competitor scraping | Never scrape AMC Question Bank, PassMedicine, UWorld, etc. |
| License compliance | AMC Question Books used within purchased license scope |
| AI-generated content | Must be based on retrieved corpus content, not memorized training data |
| User data | GDPR and Australian Privacy Act compliant |
| Medical disclaimer | Platform is for study purposes; not a substitute for clinical judgment |

### 22.3 Content Validation Chain

```
Source material acquired (licensed)
         │
         ▼
Content team extracts and structures
         │
         ▼
Medical professional review
(doctor or registrar signs off)
         │
         ▼
Legal review (IP check, AMC guidelines compliance)
         │
         ▼
AI-assisted enrichment (explanations, bilingual)
         │
         ▼
Second review pass
         │
         ▼
Published to platform
```

---

## 23. Deployment Architecture

### 23.1 Infrastructure Diagram

```
                  ┌─────────────────────────────┐
                  │       Vercel (Global CDN)     │
                  │                              │
                  │  Next.js 15 App              │
                  │  ├── Edge Middleware (auth)  │
                  │  ├── Server Components       │
                  │  ├── API Route Handlers      │
                  │  └── Static Assets           │
                  └─────────────────┬────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────┐
          │ Supabase      │  │  OpenAI API  │  │  Vercel  │
          │ Cloud         │  │  GPT-4.1     │  │  KV      │
          │ ├── PostgreSQL│  │  GPT-4o-mini │  │ (Redis)  │
          │ ├── pgvector  │  │  embeddings  │  └──────────┘
          │ ├── Auth      │  └──────────────┘
          │ ├── Realtime  │
          │ ├── Storage   │
          │ └── Edge Fns  │
          └──────────────┘
```

### 23.2 Environment Configuration

| Environment | Purpose | Deployment |
|-------------|---------|-----------|
| `development` | Local dev | `pnpm dev` (localhost:3000) |
| `preview` | PR previews | Auto-deployed by Vercel on PR |
| `staging` | Pre-production testing | Manual deploy to staging branch |
| `production` | Live platform | Deploy from `main` branch |

### 23.3 CI/CD Pipeline

```
PR opened
     │
     ▼
GitHub Actions:
  • pnpm install
  • TypeScript typecheck (tsc --noEmit)
  • ESLint
  • Vitest unit tests
  • Playwright E2E (subset)
     │
     ▼
Vercel Preview Deployment (auto)
     │
     ▼
Reviewer approves PR
     │
     ▼
Merge to main
     │
     ▼
Vercel Production Deployment (auto)
     │
     ▼
Supabase migrations (manual gate for schema changes)
```

### 23.4 Database Migrations

Managed via Supabase CLI:

```bash
# Create new migration
supabase migration new add_fsrs_retrievability_index

# Apply to staging
supabase db push --db-url $STAGING_DB_URL

# Apply to production
supabase db push --db-url $PRODUCTION_DB_URL
```

Schema changes require: migration file + rollback script + review approval.

---

## 24. Phased Development Roadmap

### Phase 0 — Foundation (Weeks 1–2)

**Goal:** Working shell with auth, database, and design system

| Deliverable | Description |
|-------------|-------------|
| Next.js 15 + Supabase project init | App Router, TypeScript, Tailwind v4 |
| Supabase schema v1 | Users, subjects, topics, subtopics, questions |
| Auth flow | Supabase Auth, login/register UI |
| Design token system | Colors, typography, spacing (Tailwind config) |
| i18n scaffold | next-intl, EN/PT routing |
| Component library foundation | Button, Card, Modal primitives |

### Phase 1 — MVP Core (Weeks 3–8)

**Goal:** Functional study experience with 100 questions

| Deliverable | Description |
|-------------|-------------|
| 100 AMC questions (3 domains) | Cardiology, Respiratory, Neurology |
| FSRS engine (TypeScript port) | FSRS-5 with 19 parameters |
| Practice mode | FSRS scheduling, grading UI |
| Basic gamification | XP, streak, level |
| Question card component | Stem, options, media display |
| Submit-answer API | Grade, FSRS update, XP |
| Dashboard | Daily goal, streak, due cards |

### Phase 2 — AI Layer (Weeks 9–12)

**Goal:** RAG pipeline and bilingual explanations

| Deliverable | Description |
|-------------|-------------|
| Knowledge chunk ingestion | Supabase + embeddings pipeline |
| RAG pipeline | pgvector + BM25 + RRF |
| Explanation generation | GPT-4.1 + grounding prompt |
| MCP integration | notebooklm-mcp-structured setup |
| Tutor mode (basic) | Single-turn MCP interactions |
| Bilingual explanations | EN + PT simultaneous generation |
| ai_generated_content storage | Audit log for all AI outputs |

### Phase 3 — Engagement (Weeks 13–16)

**Goal:** Gamification and animation polish

| Deliverable | Description |
|-------------|-------------|
| Full gamification engine | Achievements, leaderboard, shields |
| Lottie achievement animations | 10+ unlock animations |
| Framer Motion polish | Page transitions, feedback animations |
| Streak flame animation | Idle pulse + level-up burst |
| Vocabulary mode | Bilingual drills, hearts system |
| Realtime XP/streak events | Supabase Realtime integration |

### Phase 4 — Content Scale (Weeks 17–24)

**Goal:** Full content coverage

| Deliverable | Description |
|-------------|-------------|
| 500+ questions | All 6 AMC domains |
| Medical media integration | ECGs, X-rays, clinical photos |
| Complete vocabulary bank | EN/PT medical terms |
| Exam simulation mode | 150q CAT, 3.5h timer, IRT scoring |
| Content admin panel | Question management, publish workflow |
| Phase 2 AI generation | GPT-4.1 question generation pipeline |

### Phase 5 — Intelligence (Weeks 25–28)

**Goal:** Advanced AI features and analytics

| Deliverable | Description |
|-------------|-------------|
| Full tutor mode | Multi-turn Socratic teaching with MCP |
| IRT analytics | Per-user ability estimation, difficulty calibration |
| FSRS personalized optimizer | Gradient descent on 1,000+ reviews |
| Weak areas drill | Low-retrievability card surfacing |
| Performance analytics dashboard | Domain breakdown, time analysis |
| Full leaderboard | Weekly/monthly, per domain |

---

## 25. Key Architectural Decisions

### ADR-1: Supabase as Primary Backend

**Decision:** Use Supabase (PostgreSQL + pgvector + Auth + Realtime) as the sole backend infrastructure.

**Rationale:**
- pgvector enables RAG pipeline without separate vector database (Pinecone, Weaviate)
- Built-in RLS eliminates custom authorization layer
- Realtime built-in for XP/streak events
- Edge Functions co-located with database for low-latency FSRS scheduling
- Unified storage for medical images

**Trade-offs:**
- Vendor lock-in mitigated by PostgreSQL portability
- Supabase pricing scales linearly — acceptable for growth trajectory

### ADR-2: FSRS-5 over SM-2

**Decision:** Implement FSRS-5 instead of the simpler SM-2 algorithm used by Anki.

**Rationale:**
- 20–30% fewer reviews for same retention target
- Personalized optimizer available after 1,000 reviews
- Explicit retrievability model — enables Weak Areas Drill
- Open-source algorithm with strong research backing

**Trade-offs:**
- More complex implementation (19 parameters vs SM-2's 2)
- Requires TypeScript port (no native library for Next.js) — mitigated by existing FSRS open-source implementations

### ADR-3: Hybrid RAG (pgvector + BM25)

**Decision:** Use hybrid retrieval combining pgvector cosine similarity and BM25 keyword search with Reciprocal Rank Fusion.

**Rationale:**
- Medical terminology (drug names, test names) benefits from exact keyword matching
- Semantic search alone misses exact-match critical terms
- RRF fusion is proven to outperform either method alone
- Entirely within Supabase — no external vector DB required

### ADR-4: GPT-4.1 + GPT-4o-mini Dual-Model Strategy

**Decision:** Use two distinct OpenAI models: GPT-4.1 for high-stakes generation (explanations, tutor), GPT-4o-mini for fast/cheap interactions (question selection, query expansion).

**Rationale:**
- GPT-4.1 provides significantly lower hallucination rates for clinical content
- GPT-4o-mini is ~10× cheaper and faster for tasks where accuracy is less critical
- Reduces per-session AI cost while maintaining quality where it matters

### ADR-5: MCP for Tutor Mode

**Decision:** Use `notebooklm-mcp-structured` MCP server for tutor mode rather than direct OpenAI API calls.

**Rationale:**
- MCP provides structured citation enforcement
- Source-constrained design matches NotebookLM's grounded interaction model
- Separation of concerns: tutoring logic in MCP, study logic in application

### ADR-6: next-intl over i18next

**Decision:** Use next-intl for internationalization.

**Rationale:**
- Native App Router support (RSC-compatible)
- Locale-based routing built-in
- TypeScript-first API
- Smaller bundle than i18next for the Next.js use case

---

## 26. Open Questions and Future Considerations

### 26.1 Open Technical Questions

| Question | Priority | Notes |
|----------|----------|-------|
| Should FSRS optimizer run client-side or server-side? | High | 1,000+ reviews threshold before optimizer activates |
| BGE-Reranker-v2 hosting strategy? | High | Self-hosted (Supabase Edge) vs API (Cohere) |
| IRT calibration data strategy for pilot questions? | Medium | 30 pilot questions need response data before calibration |
| Offline/PWA support for exam simulation? | Medium | High value for exam-day reliability |
| WebRTC voice tutor mode? | Low | Post-Phase 5 consideration |

### 26.2 Future Architectural Enhancements

| Enhancement | Trigger |
|-------------|---------|
| Separate analytics database (ClickHouse) | > 10,000 users, analytics queries slowing main DB |
| Async job queue (Inngest) | > 1,000 AI generation requests/day |
| Read replica for exam simulation | Peak load during peak exam season |
| Mobile native app (React Native) | User demand post-MVP validation |
| Collaborative study rooms | Community feature request |
| Exam day countdown mode | Feature parity with AMC official prep materials |

### 26.3 Monitoring and Observability (To Define)

- Application monitoring: Vercel Analytics + Sentry
- Database monitoring: Supabase Dashboard + pganalyze
- AI quality monitoring: Manual review of ai_generated_content samples
- User behavior analytics: PostHog or Mixpanel (privacy-compliant)
- Uptime monitoring: BetterStack or similar

---

## Appendix A — FSRS-5 TypeScript Interface

```typescript
interface FsrsCard {
  id: string;
  userId: string;
  questionId: string;
  stability: number;      // S: days to reach 90% retention
  difficulty: number;     // D: 1-10 scale
  retrievability: number; // R: probability of recall (0-1)
  dueDate: Date;
  lastReview: Date | null;
  reviewCount: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
}

type FsrsGrade = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy

interface FsrsScheduleResult {
  updatedCard: FsrsCard;
  nextInterval: number;   // days
  reviewEntry: ReviewLogEntry;
}

function scheduleCard(card: FsrsCard, grade: FsrsGrade): FsrsScheduleResult;
function computeRetrievability(card: FsrsCard, atDate?: Date): number;
function getDueCards(userId: string, domainFilter?: string): Promise<FsrsCard[]>;
function getWeakCards(userId: string, threshold?: number): Promise<FsrsCard[]>;
```

---

## Appendix B — RAG Query Interface

```typescript
interface RagQuery {
  query: string;
  language: 'en' | 'pt';
  domainFilter?: string;
  subtopicId?: string;
  sessionContext?: {
    recentQuestionIds: string[];
    domainAccuracy: number;
  };
  fsrsContext?: {
    lowRetrievabilitySubtopics: string[];
  };
}

interface RagResult {
  passages: {
    id: string;
    content: string;
    sourceRef: string;
    relevanceScore: number;
  }[];
  generatedExplanation: {
    en: string;
    pt: string;
  };
  citations: {
    ref: string;
    passageId: string;
  }[];
  confidenceScore: number;
}

async function executeRagPipeline(query: RagQuery): Promise<RagResult>;
```

---

## Appendix C — Gamification Event Taxonomy

```typescript
type XpEvent =
  | { type: 'question_correct'; difficulty: 'easy' | 'medium' | 'hard'; xp: 10 | 25 | 40 }
  | { type: 'daily_goal_complete'; xp: 50 }
  | { type: 'streak_maintained'; streak: number; xp: number }
  | { type: 'achievement_unlocked'; achievementId: string; xp: number }
  | { type: 'exam_sim_complete'; xp: 100 }
  | { type: 'perfect_session'; xp: 75 };

type AchievementCriteria =
  | { type: 'streak_days'; threshold: number }
  | { type: 'correct_answers'; domain?: string; threshold: number }
  | { type: 'mastery_level'; domain: string; level: number }
  | { type: 'exam_sim_score'; threshold: number }
  | { type: 'cards_mastered'; threshold: number };
```

---

*Document maintained by the miniMENTE engineering team. Last updated: Phase 0 planning.*
*For questions, contact the architecture lead or refer to the active stories in `docs/stories/`.*
