# miniMENTE — Design System & UI Specification

**Version:** 1.0.0
**Last Updated:** 2026-04-18
**Project:** miniMENTE — AI-Powered AMC Exam Preparation Platform
**Status:** Canonical Reference Document

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing System](#4-spacing-system)
5. [Border Radius](#5-border-radius)
6. [Shadow System](#6-shadow-system)
7. [Animation System](#7-animation-system)
8. [Layout System](#8-layout-system)
9. [Component Specifications](#9-component-specifications)
10. [Dark Mode](#10-dark-mode)
11. [Accessibility](#11-accessibility)
12. [UI States Reference](#12-ui-states-reference)
13. [Visual References & Inspiration](#13-visual-references--inspiration)
14. [Implementation Notes](#14-implementation-notes)

---

## 1. Brand Identity

### 1.1 Concept: CINNAMON

miniMENTE's brand is built around the metaphor of **cinnamon** — one of the world's most treasured spices. This is not a decorative choice; it is a functional metaphor that shapes every design decision.

| Cinnamon Quality | Design Translation |
|---|---|
| Stimulates mental alertness | High-contrast, energetic UI states; clear visual hierarchy |
| Creates warmth and comfort | Warm-toned color palette; no cold grays |
| Premium and aromatic | Serif display type; generous whitespace; quality shadows |
| Evokes focus and clarity | Single-workspace layout; minimal navigation |
| Spice that enhances everything | A platform that enhances study, not replaces it |

### 1.2 Brand Voice

- **Knowledgeable, not condescending** — speaks like a senior registrar, not a textbook
- **Warm, not casual** — premium without being sterile
- **Direct, not terse** — clear feedback, actionable insights
- **Confident, not arrogant** — earns trust through accuracy

### 1.3 Target Audience

International Medical Graduates (IMGs) preparing for the Australian Medical Council (AMC) Computer Adaptive Test (CAT) and Clinical Examination. These are professionals who:

- Bring significant medical knowledge but need Australian-context calibration
- Study in short, intense bursts alongside clinical work
- Respond to evidence-based, measurable progress
- Value tools that respect their intelligence and time

---

## 2. Color System

### 2.1 Primary Palette — Cinnamon

The primary palette drives all brand interactions, primary actions, and key UI accents. It is based on real cinnamon bark tones extracted from warm brown-red hues.

```css
--cinnamon-50:  #FDF7F4;   /* near white, page background */
--cinnamon-100: #F9EDE6;   /* warm surface, card backgrounds */
--cinnamon-200: #F0D3C4;   /* borders, dividers, subtle separators */
--cinnamon-300: #E4B49A;   /* muted accents, disabled states */
--cinnamon-400: #D48B69;   /* secondary interactions, hover states */
--cinnamon-500: #C45C2E;   /* PRIMARY — main brand color, primary CTA */
--cinnamon-600: #A84A22;   /* pressed/active states for primary actions */
--cinnamon-700: #8B3A18;   /* dark accents, strong emphasis */
--cinnamon-800: #6D2C12;   /* very dark accents */
--cinnamon-900: #4A1C0A;   /* deep premium, near-black cinnamon */
```

**Primary Action Color:** `--cinnamon-500` (#C45C2E)
**Use on white/light backgrounds only.** Text on Cinnamon-500 must be white (#FFFFFF). Verify 4.5:1 contrast.

**Visual Scale:**

```
50  ████░ near white        (backgrounds, page surfaces)
100 ████░ warm off-white    (card surfaces, panels)
200 ████░ light warm        (borders, dividers)
300 ████░ soft warm         (muted accents)
400 ████░ medium warm       (secondary UI)
500 ████░ BRAND PRIMARY     (buttons, links, focus)
600 ████░ medium dark       (pressed states)
700 ████░ dark              (strong text accents)
800 ████░ very dark         (decorative darks)
900 ████░ near black        (premium dark surfaces)
```

---

### 2.2 Neutral Palette — Warm Neutrals

**Critical rule: miniMENTE uses NO cold grays.** All neutrals carry warm undertones consistent with the cinnamon brand. Pure #808080 or #F5F5F5 are forbidden.

```css
--neutral-50:  #FDFAF8;   /* warmest white, alternative backgrounds */
--neutral-100: #F5F0EB;   /* warm light gray, secondary surfaces */
--neutral-200: #EDE5DC;   /* warm border color */
--neutral-300: #D4C9BC;   /* placeholder text, muted borders */
--neutral-400: #AFA399;   /* disabled text, secondary labels */
--neutral-500: #8A7D73;   /* body text (secondary) */
--neutral-600: #6B6059;   /* body text (primary secondary) */
--neutral-700: #4D4540;   /* heading text (medium weight) */
--neutral-800: #302A26;   /* heading text (strong) */
--neutral-900: #1A140F;   /* primary text, near-black */
```

**Primary Text Color:** `--neutral-900` (#1A140F) on light backgrounds.

---

### 2.3 Semantic Colors

Semantic colors communicate status, feedback, and system state. All are calibrated for medical context — trustworthy, clinical, unambiguous.

#### Success
```css
--success:       #4A7C59;   /* medical green — trustworthy, not bright */
--success-light: #D4EDDA;   /* success backgrounds, correct answer tints */
```
Evokes clinical accuracy. Muted enough to not be alarming. Use for: correct answers, passing states, completed milestones.

#### Error
```css
--error:       #C0392B;   /* urgent, clinical red — not aggressive */
--error-light: #FDECEA;   /* error backgrounds, incorrect answer tints */
```
Use for: incorrect answers, validation failures, critical system errors. Never use for warnings or informational states.

#### Warning
```css
--warning:       #D4A017;   /* amber — caution, not danger */
--warning-light: #FFF3CD;   /* warning backgrounds */
```
Use for: due/overdue cards, performance declining, non-critical issues.

#### Info
```css
--info:       #2E6DA4;   /* medical blue — authority, information */
--info-light: #D0E8F7;   /* info backgrounds */
```
Use for: hints, explanations, tutor responses, informational tooltips.

---

### 2.4 Domain Colors — AMC Clinical Domains

Each of the six AMC domains has a designated color. These are used in:
- Domain navigator dots
- Radial progress charts
- Question card header accents
- Filter chips and badges
- Statistics breakdowns

| Domain | Color | Hex | Rationale |
|---|---|---|---|
| Adult Medicine | Clinical Blue | `#2E6DA4` | Authority, internal medicine tradition |
| Adult Surgery | Surgical Green | `#1B7A4E` | Surgical scrubs, operating theatre |
| Women's Health | Warm Purple | `#8E44AD` | Reproductive medicine tradition |
| Child Health | Warm Orange | `#E67E22` | Warmth, pediatric care energy |
| Mental Health | Muted Blue-Gray | `#5D6D7E` | Calm, non-stigmatizing, professional |
| Population Health | Teal | `#16A085` | Public health, epidemiology, global |

```css
--domain-adult-medicine:   #2E6DA4;
--domain-adult-surgery:    #1B7A4E;
--domain-womens-health:    #8E44AD;
--domain-child-health:     #E67E22;
--domain-mental-health:    #5D6D7E;
--domain-population-health: #16A085;
```

**Domain Light Variants** (for backgrounds, tints): Append `-light` and use 15% opacity of the base color on white. Example: `rgba(46, 109, 164, 0.12)` for Adult Medicine tint.

---

### 2.5 Color Usage Rules

1. **Background hierarchy:** Page → `cinnamon-50`, Panel → `cinnamon-100`, Card → `#FFFFFF`
2. **Never use primary Cinnamon on Cinnamon backgrounds** without sufficient contrast verification
3. **Domain colors are decorative accents only** — never use as primary text or on small elements without contrast check
4. **Success/Error/Warning are functional** — do not repurpose them for decorative use
5. **Warm neutrals everywhere** — replace any imported cold gray with the nearest neutral equivalent

---

## 3. Typography System

### 3.1 Font Families

miniMENTE uses a two-family system: serif for display hierarchy, sans-serif for reading.

```css
--font-display: 'Lora', 'Playfair Display', Georgia, serif;
--font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-ui:      'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### Lora / Playfair Display (Display)
- Role: Major headings, hero text, dashboard titles
- Personality: Premium academic, scholarly, trustworthy
- Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Fallback order: Lora → Playfair Display → Georgia

#### Inter (Body + UI)
- Role: All body text, labels, buttons, navigation, data
- Personality: Medical-grade legibility, neutral, authoritative
- Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Note: Single family for body + UI reduces cognitive load and load time

#### JetBrains Mono (Monospace)
- Role: Formulas, drug codes, lab values, technical references
- When to use: Inline code, structured data tables, dosage references
- Weight: 400 only for normal use

---

### 3.2 Type Scale

All sizes are in pixels. Line heights are expressed as unitless multipliers when used in CSS (`line-height: 1.167` for 56px from 48px).

#### Display Scale (Lora / Playfair Display)

| Token | Size | Line Height | Weight | Use Case |
|---|---|---|---|---|
| `display-xl` | 48px | 56px (1.17) | Bold 700 | Hero headings, onboarding screens |
| `display-lg` | 36px | 44px (1.22) | SemiBold 600 | Section headings, dashboard titles |
| `display-md` | 30px | 38px (1.27) | Medium 500 | Card headings, modal titles |

#### Heading Scale (Inter)

| Token | Size | Line Height | Weight | Use Case |
|---|---|---|---|---|
| `heading-xl` | 24px | 32px (1.33) | SemiBold 600 | Panel headings, major section titles |
| `heading-lg` | 20px | 28px (1.40) | SemiBold 600 | Card titles, drawer headings |
| `heading-md` | 18px | 26px (1.44) | Medium 500 | Sub-section headings |
| `heading-sm` | 16px | 24px (1.50) | Medium 500 | List headings, form section titles |

#### Body Scale (Inter)

| Token | Size | Line Height | Weight | Use Case |
|---|---|---|---|---|
| `body-lg` | 16px | 26px (1.63) | Regular 400 | Question stems, primary reading text |
| `body-md` | 14px | 22px (1.57) | Regular 400 | Explanations, supporting content |
| `body-sm` | 13px | 20px (1.54) | Regular 400 | Metadata, timestamps, secondary info |

#### Label/Caption Scale (Inter)

| Token | Size | Line Height | Weight | Style | Use Case |
|---|---|---|---|---|---|
| `caption` | 12px | 18px (1.50) | Regular 400 | Normal | Labels, tooltips, helper text |
| `overline` | 11px | 16px (1.45) | Medium 500 | UPPERCASE | Category labels, domain tags |

---

### 3.3 Typography Rules

1. **Question stems always use `body-lg`** — readability is non-negotiable at this size
2. **Domain labels use `overline`** — uppercase reinforces category distinction
3. **Never use display fonts below 24px** — Lora/Playfair lose legibility at small sizes
4. **Maximum line length (measure): 72 characters** for body text — approximately 680px at 16px Inter
5. **Minimum contrast:** 4.5:1 for all body text; 3:1 for large text (18px+ bold or 24px+)
6. **Never use font-weight below 400** for body text
7. **Letter spacing for overline:** `letter-spacing: 0.08em` — improves legibility at small caps

---

## 4. Spacing System

miniMENTE uses an **8px base grid**. All spacing values are multiples or sub-multiples of 8px.

```css
--space-1:  4px;    /* micro spacing: icon gaps, tight padding */
--space-2:  8px;    /* base unit: small component internal padding */
--space-3:  12px;   /* 1.5x: compact elements, badge padding */
--space-4:  16px;   /* 2x: standard padding, card inner spacing */
--space-5:  20px;   /* 2.5x: medium gaps */
--space-6:  24px;   /* 3x: card padding, section gaps */
--space-8:  32px;   /* 4x: major component separation */
--space-10: 40px;   /* 5x: section margins */
--space-12: 48px;   /* 6x: large section padding */
--space-16: 64px;   /* 8x: layout-level spacing */
--space-20: 80px;   /* 10x: hero sections */
--space-24: 96px;   /* 12x: page-level vertical rhythm */
```

### 4.1 Spacing Application Guidelines

| Context | Token | Value |
|---|---|---|
| Icon to label gap | `space-1` or `space-2` | 4–8px |
| Button internal padding (v) | `space-2` | 8px |
| Button internal padding (h) | `space-4` | 16px |
| Card internal padding | `space-6` | 24px |
| Card to card gap (grid) | `space-4` to `space-6` | 16–24px |
| Section vertical margin | `space-8` to `space-12` | 32–48px |
| Panel padding | `space-6` | 24px |
| Form field gap | `space-4` | 16px |
| List item gap | `space-3` | 12px |
| Navigation item padding | `space-3` `space-4` | 12px 16px |

---

## 5. Border Radius

Radius values follow a warm, soft aesthetic — no sharp 2px corners, no excessive pill shapes on rectangular elements.

```css
--radius-sm:   6px;      /* tags, badges, small chips */
--radius-md:   10px;     /* buttons, inputs, small cards */
--radius-lg:   14px;     /* cards, panels, content areas */
--radius-xl:   20px;     /* modals, drawers, large panels */
--radius-2xl:  28px;     /* floating elements, tooltips, popups */
--radius-full: 9999px;   /* pills, avatars, toggle switches */
```

### 5.1 Radius Application

| Component | Radius |
|---|---|
| Answer option buttons | `radius-md` (10px) |
| Question card | `radius-lg` (14px) |
| Primary action button | `radius-md` (10px) |
| Tag / badge | `radius-sm` (6px) |
| Domain pill | `radius-full` |
| Avatar | `radius-full` |
| Modal / dialog | `radius-xl` (20px) |
| Tooltip | `radius-2xl` (28px) |
| Input field | `radius-md` (10px) |
| Navigation panel | `radius-lg` (14px) on floating variant |
| Progress bar track | `radius-full` |

---

## 6. Shadow System

All shadows use warm-toned rgba values. The shadow color `rgba(100, 50, 20, x)` approximates a dark cinnamon that casts naturally over warm surfaces without the cold blue tint common in design systems.

```css
--shadow-xs:   0 1px 2px rgba(100, 50, 20, 0.04);
--shadow-sm:   0 2px 8px rgba(100, 50, 20, 0.06);
--shadow-md:   0 4px 16px rgba(100, 50, 20, 0.08);
--shadow-lg:   0 8px 32px rgba(100, 50, 20, 0.10);
--shadow-xl:   0 16px 48px rgba(100, 50, 20, 0.14);
--shadow-glow-cinnamon: 0 0 20px rgba(196, 92, 46, 0.25);
```

### 6.1 Shadow Application

| Component | Shadow | Notes |
|---|---|---|
| Navigation bar | `shadow-sm` | Subtle separation from content |
| Card (resting) | `shadow-sm` | |
| Card (hover) | `shadow-md` | Lifts on hover |
| Card (active/focused) | `shadow-md` + `shadow-glow-cinnamon` | Focus state for question cards |
| Modal | `shadow-xl` | Maximum depth for overlay elements |
| Floating panel | `shadow-lg` | Side panels when floating |
| Tooltip | `shadow-md` | |
| Dropdown menu | `shadow-lg` | |
| Primary button (hover) | `shadow-sm` + Cinnamon glow | |
| Avatar | `shadow-xs` | |
| Input (focus) | `shadow-glow-cinnamon` at 15% | Subtle focus indication |

### 6.2 Shadow Rules

1. **Never stack shadows** — one shadow per element
2. **Glow-cinnamon is for emphasis only** — primary buttons, focused question cards, streak highlights
3. **Dark mode shadows:** Reduce opacity by 50% and shift base color to `rgba(0,0,0,x)` — warm surfaces absorb warm shadows; dark surfaces need neutral shadows

---

## 7. Animation System

### 7.1 Core Principles

miniMENTE's interface must feel **alive**. Animations serve two purposes:

1. **Feedback** — Confirm user actions immediately
2. **Delight** — Make studying feel rewarding, not punitive

**Non-negotiable animation rules:**

- Every interactive element has a state transition animation
- Feedback animations fire within 50ms of user action (perceived latency)
- Spring physics for organic, non-mechanical feel
- All non-essential animations respect `prefers-reduced-motion`
- No animation loops unless the user has triggered a reward state

### 7.2 Spring Physics Configuration

```javascript
// Default spring — used for card entries, panel slides, toggles
const defaultSpring = {
  stiffness: 300,
  damping: 30,
  mass: 1
};

// Bouncy spring — used for success states, achievements
const bouncySpring = {
  stiffness: 400,
  damping: 20,
  mass: 0.8
};

// Gentle spring — used for expanding content, accordions
const gentleSpring = {
  stiffness: 200,
  damping: 35,
  mass: 1
};
```

---

### 7.3 Core Study Animations

#### 1. Question Card Entry
Signals a fresh question — clear, directional, energetic.

```
Direction: slide-in from right + opacity fade
Duration: 350ms
Easing: spring (stiffness: 300, damping: 30)
Transform: translateX(40px) → translateX(0)
Opacity: 0 → 1
Trigger: new question loaded
```

#### 2. Correct Answer Pulse
Positive reinforcement — satisfying, not overwhelming.

```
Effect: green border glow + checkmark bounce
Duration: 400ms
Phase 1 (0–200ms): border-color → success, box-shadow → success glow
Phase 2 (0–400ms): checkmark icon scale 0 → 1.2 → 1 (spring bounce)
Background: transitions to success-light (150ms)
Sound: optional tick (user preference)
```

#### 3. Wrong Answer Shake
Kinetic error feedback — clear without being punitive.

```
Effect: horizontal shake × 3 iterations + red fade
Duration: 300ms
Keyframes:
  0%   translateX(0)
  15%  translateX(-6px)
  30%  translateX(6px)
  45%  translateX(-4px)
  60%  translateX(4px)
  75%  translateX(-2px)
  90%  translateX(2px)
  100% translateX(0)
Border/background: transitions to error-light
Easing: ease-in-out
```

#### 4. Explanation Accordion Expand
Content reveal — smooth, readable, not jarring.

```
Effect: height 0 → auto + content fade-in
Duration: 250ms
Easing: ease-out (cubic-bezier(0, 0, 0.2, 1))
Height: animated via max-height or layout animation
Content opacity: 0 → 1, delayed 50ms after expand starts
Trigger: answer submitted
```

#### 5. Streak Flame
Ambient energy indicator — subtle continuous life.

```css
@keyframes flicker {
  0%, 100% { transform: scaleY(1) rotate(-1deg); opacity: 1; }
  25%       { transform: scaleY(1.05) rotate(1deg); opacity: 0.95; }
  50%       { transform: scaleY(0.97) rotate(-0.5deg); opacity: 1; }
  75%       { transform: scaleY(1.02) rotate(0.5deg); opacity: 0.98; }
}
/* Duration: varies 2s–3s, animation-timing-function: ease-in-out, infinite */
/* Only active when streak >= 1 */
```

#### 6. XP Counter Animation
Number increment — satisfying reward signal.

```
Effect: number increments from previous value to new value
Duration: 600ms
Easing: ease-out-expo (cubic-bezier(0.19, 1, 0.22, 1))
Implementation: requestAnimationFrame counter with lerp
Optional: "+{amount}" float animation above counter, 400ms, then fade
```

#### 7. Achievement Unlock
High-reward moment — maximum celebration, appropriate duration.

```
Phase 1 (0–200ms): card scales from 0.8 → 1.05 + fade in
Phase 2 (200–500ms): particle burst (8–12 particles, domain color)
Phase 3 (300–800ms): card settles to scale(1) via spring
Total duration: 800ms
Particle spread: radial, 60px radius
Particle animation: translateY(-40px) + opacity 1 → 0
Sound: optional achievement chime (user preference)
```

#### 8. Progress Bar Fill
Progress tracking — purposeful, not decorative.

```
Effect: width animates from previous % to new %
Duration: 500ms
Easing: ease-out (cubic-bezier(0, 0, 0.2, 1))
Color: domain color for domain bars, Cinnamon-500 for overall
Shine sweep: optional 1px white streak sweeps right on completion
```

---

### 7.4 Highlight and Annotation Effects

These effects appear in the explanation panel and vocabulary system.

#### Text Highlight Sweep
```
Effect: background-color wipe from left to right
Duration: 400ms
Easing: ease-out
Implementation: clip-path or background-size animation
Colors: uses semantic or domain color at 30% opacity
```

#### Underline Draw
```
Effect: SVG stroke-dashoffset animation (right to left)
Duration: 300ms
Easing: ease-out
Trigger: annotation mode active
```

#### Bullet Note Appear
```
Effect: each bullet point fades in + translates up
Duration per item: 200ms
Stagger: 100ms between items
Transform: translateY(8px) → translateY(0)
Opacity: 0 → 1
```

#### Color Marker
```
Effect: translucent background sweeps from left
Duration: 350ms
Easing: ease-in-out
Implementation: background gradient animation, left → right
```

---

### 7.5 Microinteractions

These animations apply universally across all interactive elements.

| Element | Interaction | Animation | Duration |
|---|---|---|---|
| Button | Hover | `scale(1.02)` + `shadow-md` | 150ms ease-out |
| Button | Press | `scale(0.98)` | 100ms ease-in |
| Card | Hover | `translateY(-2px)` + `shadow-md` | 200ms ease-out |
| Card | Press | `translateY(0)` + `shadow-sm` | 100ms ease-in |
| Input | Focus | border-color + `shadow-glow-cinnamon` (15%) | 200ms ease-out |
| Toggle | Switch | spring-animated thumb slide | 250ms spring |
| Checkbox | Check | checkmark draw (stroke animation) | 200ms ease-out |
| Radio | Select | scale fill + ripple | 200ms ease-out |
| Icon button | Hover | `scale(1.1)` | 150ms ease-out |
| Link | Hover | color shift + underline grow | 150ms ease-out |
| Answer option | Hover | background fill + border color | 150ms ease-out |
| Answer option | Select | border weight increase + background tint | 200ms spring |

---

### 7.6 Page and View Transitions

| Transition | Animation | Duration |
|---|---|---|
| Study session start | fade + `scale(0.95 → 1)` from center | 400ms ease-out |
| Domain/topic change | horizontal slide (300px right → center) | 350ms spring |
| Modal open | `scale(0.95 → 1)` + opacity 0 → 1 | 250ms ease-out |
| Modal close | `scale(1 → 0.95)` + opacity 1 → 0 | 200ms ease-in |
| Notification toast | slide from top + gravity settle (spring) | 350ms spring |
| Toast dismiss | slide back up + fade | 250ms ease-in |
| Panel collapse | width + opacity animate to 0 | 300ms ease-in-out |
| Panel expand | width + opacity animate from 0 | 300ms ease-out |
| Bottom sheet open | translateY(100% → 0) + spring settle | 400ms spring |
| Bottom sheet close | translateY(0 → 100%) | 300ms ease-in |

---

### 7.7 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all non-essential animations */
  .card-entry,
  .streak-flame,
  .achievement-burst,
  .xp-counter,
  .highlight-sweep,
  .underline-draw {
    animation: none !important;
    transition: none !important;
  }

  /* Preserve functional feedback (instant state changes) */
  .answer-correct { background-color: var(--success-light); }
  .answer-wrong   { background-color: var(--error-light); }
  .modal          { opacity: 1; transform: none; }
}
```

Essential feedback (correct/incorrect state) remains visible in reduced motion mode — only the animation is removed, the end state is preserved.

---

## 8. Layout System

### 8.1 Workspace Philosophy

miniMENTE uses a **single-workspace paradigm** inspired by tools like Notion, Linear, and granola.ai. The interface avoids page navigation in favor of a persistent, stateful workspace where all study activities occur in context.

**Core principle:** The user should never feel "lost" or "navigated away from study." The workspace is always present.

---

### 8.2 Desktop Layout (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER (64px height)                                                 │
│  ┌────────────┐  Session: Adult Medicine — Cardiology   🔥 7  XP 840 │
│  │ miniMENTE  │                                          [▪▪▪] Avatar │
│  └────────────┘                                                       │
├────────────────┬─────────────────────────────────┬───────────────────┤
│  LEFT PANEL    │  CENTER STUDY AREA               │  RIGHT PANEL      │
│  (280px fixed) │  (fluid, max 720px centered)    │  (320px fixed)    │
│                │                                  │                   │
│  ┌──────────┐  │  ┌──────────────────────────┐   │  ┌─────────────┐  │
│  │ DOMAINS  │  │  │   QUESTION CARD          │   │  │ PERFORMANCE │  │
│  │ ▸ Adult  │  │  │                          │   │  │ ──────────  │  │
│  │   Med ●  │  │  │  Domain: Adult Medicine  │   │  │ ○ 68% Today │  │
│  │ ▸ Surgery│  │  │  Topic: Cardiology       │   │  │             │  │
│  │ ▸ Women  │  │  │                          │   │  │ DUE CARDS   │  │
│  │ ▸ Child  │  │  │  Q: A 58-year-old male   │   │  │ Today: 24   │  │
│  │ ▸ Mental │  │  │  presents with...        │   │  │ Overdue: 3  │  │
│  │ ▸ Pop Hlt│  │  │                          │   │  │             │  │
│  └──────────┘  │  │  ○ A. Aortic stenosis    │   │  │ TODAY GOAL  │  │
│                │  │  ○ B. Mitral regurg.     │   │  │ ▓▓▓▓▓░ 78%  │  │
│  ┌──────────┐  │  │  ○ C. Hypertrophic..    │   │  │             │  │
│  │ TOPICS   │  │  │  ○ D. Pulmonary HT      │   │  │ AI INSIGHT  │  │
│  │ ▾ Cardio │  │  │  ○ E. Cardiac tampon.   │   │  │ "Weakest:   │  │
│  │   · ECG  │  │  │                          │   │  │ Arrhythmia" │  │
│  │   · HF   │  │  └──────────────────────────┘   │  │             │  │
│  │   · IHD  │  │                                  │  │ STREAK      │  │
│  └──────────┘  │  ┌──[ NAVIGATION BAR ]──────┐   │  │ 🔥 7 days   │  │
│                │  │  ← Prev  [▓▓▓░░] 3/5  →  │   │  └─────────────┘  │
│  ┌──────────┐  │  └──────────────────────────┘   │                   │
│  │ VOCAB    │  │                                  │                   │
│  │ Quick    │  │                                  │                   │
│  │ Access   │  │                                  │                   │
│  └──────────┘  │                                  │                   │
└────────────────┴─────────────────────────────────┴───────────────────┘
```

#### Header Specifications
- Height: 64px
- Background: `#FFFFFF` + `shadow-sm`
- Content: Logo (left) | Session context (center) | Streak + XP + Avatar (right)
- Logo: miniMENTE wordmark, Lora Bold, Cinnamon-500
- Session context: `overline` domain tag + `heading-sm` topic name
- Streak: flame icon + number, `body-sm`
- XP: lightning icon + number, `body-sm`
- Avatar: 36px, `radius-full`

#### Left Panel Specifications
- Width: 280px (fixed)
- Background: `cinnamon-50`
- Padding: `space-4` (16px)
- Border-right: 1px solid `cinnamon-200`
- Collapsible: slides to 64px icon-only mode
- Sections: Domains Navigator, Topics Tree, Vocabulary Quick Access
- Navigation items: `radius-md`, hover state `cinnamon-100` background

#### Center Study Area Specifications
- Flex: 1 (takes remaining space)
- Background: `cinnamon-50`
- Content max-width: 720px, horizontally centered
- Padding: `space-8` (32px) top/bottom, `space-6` (24px) left/right
- Modes: Question Card | Tutor Chat | Flashcard | Summary View

#### Right Panel Specifications
- Width: 320px (fixed)
- Background: `#FFFFFF`
- Padding: `space-4` (16px)
- Border-left: 1px solid `cinnamon-200`
- Collapsible: slides to hidden (< 1280px defaults to collapsed)
- Sections: Performance Overview, Due Cards, Today's Goal, AI Insight, Streak

---

### 8.3 Mobile Layout (< 768px)

On mobile, the three-panel layout collapses to a single-column view with a persistent bottom navigation bar.

```
┌─────────────────────────────┐
│  HEADER (56px)               │
│  ← miniMENTE        🔥7 XP  │
├─────────────────────────────┤
│                              │
│  ┌─────────────────────────┐ │
│  │   QUESTION CARD          │ │
│  │                          │ │
│  │  Adult Medicine          │ │
│  │  Cardiology              │ │
│  │                          │ │
│  │  A 58-year-old male...   │ │
│  │                          │ │
│  │  ○ A. Aortic stenosis    │ │
│  │  ○ B. Mitral regurg.     │ │
│  │  ○ C. Hypertrophic..     │ │
│  │  ○ D. Pulmonary HT       │ │
│  │  ○ E. Cardiac tampon.    │ │
│  │                          │ │
│  └─────────────────────────┘ │
│                              │
│  ← swipe →  [▓▓░░░] 2/5     │
│                              │
├─────────────────────────────┤
│ BOTTOM NAV (64px)            │
│ 📚Study  🗂️Dom  📊Prog  📝Vocab  👤Profile │
└─────────────────────────────┘
```

#### Mobile-Specific Rules
- Single column layout, all content stacked
- Bottom navigation: 5 tabs, 64px height, `cinnamon-50` background + `shadow-lg` upward
- Active tab: Cinnamon-500 icon + label color
- Swipe left/right to navigate questions
- Domain navigator and performance panel become **bottom sheets**
- Bottom sheets: slide up from bottom, `radius-xl` top corners, handle indicator at top center
- Header height: 56px on mobile
- Question card padding: `space-4` (16px)
- Font size: maintain `body-lg` (16px) minimum — never reduce question stem size

#### Bottom Navigation Tabs

| Tab | Icon | Label |
|---|---|---|
| Study | book-open | Study |
| Domains | grid | Domains |
| Progress | bar-chart-2 | Progress |
| Vocabulary | type | Vocab |
| Profile | user | Profile |

---

### 8.4 Tablet Layout (768px – 1023px)

- Left panel: hidden by default, accessible via hamburger/slide-in
- Center study area: full width with `space-8` padding
- Right panel: hidden, accessible as bottom sheet triggered by stats icon in header
- Header: same as desktop at 64px

---

### 8.5 Grid and Content Widths

| Context | Max Width | Notes |
|---|---|---|
| Question card | 720px | Reading-optimized measure |
| Explanation text | 640px | Slightly narrower for comfort |
| Modal / dialog | 560px | Standard dialog width |
| Wide modal | 720px | For complex settings/review |
| Full-width panel content | 100% | Dashboard charts, domain grids |
| Form fields | 480px | Input field maximum |

---

## 9. Component Specifications

### 9.1 Question Card

The question card is the primary interaction surface of miniMENTE. Every design decision prioritizes clarity, focus, and feedback.

```
┌─────────────────────────────────────────────────────────────────────┐
│  [DOMAIN TAG]  Adult Medicine     [TOPIC]  Cardiology · Q.3/24      │
│─────────────────────────────────────────────────────────────────────│
│                                                                      │
│  A 58-year-old male with a history of hypertension presents to      │
│  the emergency department with sudden onset of severe chest pain    │
│  radiating to the jaw. ECG shows ST elevation in leads V1–V4.       │
│  Which is the most appropriate immediate management?                │
│                                                                      │
│─────────────────────────────────────────────────────────────────────│
│  A  ○  Administer aspirin 300mg and arrange urgent PCI              │
│  B  ○  Commence heparin infusion and arrange CT coronary angio      │
│  C  ○  Administer thrombolytics and transfer to cardiac unit        │
│  D  ○  Obtain troponin and repeat ECG in 6 hours                    │
│  E  ○  Administer GTN spray and observe for 30 minutes              │
│                                                                      │
│─────────────────────────────────────────────────────────────────────│
│  [ Confirm Answer ]                           [ Skip this question ]│
└─────────────────────────────────────────────────────────────────────┘
```

#### Structural Specifications
- Max width: 720px, horizontally centered in study area
- Background: `#FFFFFF`
- Shadow: `shadow-md`
- Border radius: `radius-lg` (14px)
- Padding: `space-6` (24px) all sides

#### Header Row
- Domain tag: `overline` style, domain color, `radius-sm` background tint
- Topic: `body-sm`, neutral-500
- Progress: `body-sm`, neutral-400 (e.g., "Q.3/24")

#### Question Stem
- Typography: `body-lg` (16px, Inter Regular, 26px line-height)
- Color: `neutral-900`
- Max display: 4 lines before scroll; `max-height: 144px; overflow-y: auto`
- Padding: `space-4` top and bottom from dividers

#### Answer Options
- Full-width buttons, left-aligned text
- Height: minimum 48px (touch target)
- Label circle: 28px diameter, `radius-full`, contains letter A–E
- Label typography: `body-sm` Medium, centered in circle
- Option text: `body-md` (14px)
- State: See section 12.1 (Answer Option States)
- Keyboard: Press A, B, C, D, or E to select; Enter to confirm; Space/Arrow keys to navigate

#### Action Row
- Two buttons: primary "Confirm Answer" (Cinnamon-500) and ghost "Skip" (Neutral-500 text)
- Only visible when an option is selected (Confirm) or always visible (Skip)
- On mobile: stacked, full-width

---

### 9.2 Explanation Panel

Revealed after answer submission. Accordion below the question card.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✓  CORRECT   Answer A — Aspirin 300mg + urgent PCI             ↑  │
│─────────────────────────────────────────────────────────────────────│
│                                                                      │
│  KEY CONCEPT                                                         │
│  STEMI Management — The Time-to-Balloon Doctrine                    │
│                                                                      │
│  FULL EXPLANATION                                                    │
│  ST-elevation myocardial infarction (STEMI) requires immediate      │
│  reperfusion therapy. Primary PCI is the gold standard with a       │
│  door-to-balloon time target of < 90 minutes...                     │
│                                                                      │
│  WHY THE OTHERS ARE WRONG                                            │
│  B. CT coronary angiography is not appropriate in the acute         │
│     STEMI setting — it delays reperfusion...                        │
│  C. Thrombolytics are second-line when PCI is unavailable within    │
│     120 minutes...                                                  │
│                                                                      │
│  REFERENCES                                                          │
│  · AMC MCQ Handbook, Section 4.2                                    │
│  · NHFA/CSANZ ACS Guidelines 2023                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Specifications
- Appended below the question card (not replacing it)
- Opens on answer submission, can be manually collapsed/expanded
- Header row: Verdict icon + color + Answer letter + Option text + collapse toggle
- Background: `success-light` (#D4EDDA) for correct, `error-light` (#FDECEA) for incorrect
- Border-left: 4px solid `success` or `error` color
- Border radius: `radius-lg` on bottom; 0 radius on top (joins to question card)

#### Section Structure
1. **Key Concept** — `heading-sm` header, `body-md` content, `cinnamon-100` background tint
2. **Full Explanation** — `heading-sm` header, `body-md` content, plain background
3. **Why the Others Are Wrong** — `heading-sm` header, bulleted list, `error-light` tint per item
4. **References** — `caption` typography, `neutral-300` bullets, linked if available

#### Animation
- Expand: height 0 → content height, 250ms ease-out
- Content fades in 50ms after height expansion starts
- Section headers stagger-appear 100ms apart after panel opens

---

### 9.3 Performance Dashboard (Right Panel)

```
┌─────────────────────────────────┐
│  PERFORMANCE OVERVIEW            │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐           │
│  │ 68%│ │ 45%│ │ 82%│           │
│  │ ◯  │ │ ◯  │ │ ◯  │           │
│  │ AM │ │ AS │ │ WH │           │
│  └────┘ └────┘ └────┘           │
│  ┌────┐ ┌────┐ ┌────┐           │
│  │ 71%│ │ 38%│ │ 55%│           │
│  │ ◯  │ │ ◯  │ │ ◯  │           │
│  │ CH │ │ MH │ │ PH │           │
│  └────┘ └────┘ └────┘           │
│                                  │
│  DUE CARDS                       │
│  Today     ██████ 24             │
│  Overdue   ██     3              │
│  New       ████████████ 40       │
│                                  │
│  TODAY'S GOAL                    │
│  [▓▓▓▓▓▓▓░░░]  78%  (39/50 Qs) │
│                                  │
│  AI INSIGHT                      │
│  "Your weakest area this week    │
│   is Cardiac Arrhythmia.         │
│   Suggested: 10 focused Qs"      │
│  [ Start Focused Session ]       │
│                                  │
│  STREAK                          │
│  🔥 7-day streak                 │
│  ████████████████ Best: 21 days  │
│                                  │
└─────────────────────────────────┘
```

#### Domain Radial Progress Charts
- Size: 56px diameter SVG circles
- Stroke width: 5px
- Background stroke: `neutral-200`
- Progress stroke: domain color
- Animation: stroke-dashoffset on load, 500ms ease-out
- Center text: `caption` (12px), percentage value
- Label below: `overline`, 2-letter abbreviation

#### FSRS Card Counts
- Three rows: Today / Overdue / New
- Mini horizontal bar: width proportional to count, max 100%
- Today bar: `cinnamon-500`
- Overdue bar: `error`
- New bar: `info`

#### AI Insight
- Card: `cinnamon-100` background, `radius-lg`
- Text: `body-sm` in italics, neutral-700
- CTA button: Cinnamon-500, `radius-md`, `body-sm`
- Refreshes after each study session

---

### 9.4 Domain Navigator (Left Panel)

```
DOMAINS
▾ Adult Medicine        ●  68%
  ▾ Cardiology                72%
    · Ischaemic HD            81%
    · Heart Failure           64%
    · Arrhythmia              43% ← Weak
    · Valvular Disease        75%
  ▸ Respiratory               65%
  ▸ Gastroenterology          71%
▸ Adult Surgery          ●  45%
▸ Women's Health         ●  82%
▸ Child Health           ●  71%
▸ Mental Health          ●  38%
▸ Population Health      ●  55%
```

#### Specifications
- Tree structure: 3 levels (Domain > Topic > Subtopic)
- Expand/collapse: animated with 200ms height transition
- Domain level: `heading-sm`, domain color dot (10px circle), percentage `body-sm`
- Topic level: `body-md`, indented `space-4`, percentage `body-sm`
- Subtopic level: `body-sm`, indented `space-8`, percentage `caption`
- Active item: `cinnamon-100` background, left border `cinnamon-500` 3px
- Hover: `cinnamon-50` background transition 150ms

#### Weak Area Indicator
- Items below 50% accuracy: append small downward arrow icon in `warning` color
- Items below 30%: append `error` color indicator
- Tooltip on hover: "Average accuracy: X% — Suggest review"

---

### 9.5 Navigation Controls

```
┌──────────────────────────────────────────────────────────────┐
│  ←  Previous            [▓▓▓░░░░]  3 of 20           Next  → │
└──────────────────────────────────────────────────────────────┘
```

- Height: 56px
- Position: below question card, above footer
- Progress bar: `cinnamon-500` fill, `cinnamon-200` track, `radius-full`
- Counter: `body-sm`, neutral-500, centered
- Arrows: icon buttons, `radius-md`, hover scale(1.05)
- Keyboard: ← → arrow keys; Page Up/Down

---

### 9.6 Buttons

#### Primary Button
- Background: `cinnamon-500`
- Text: white, `body-md` SemiBold
- Padding: `space-2` (8px) vertical, `space-5` (20px) horizontal
- Radius: `radius-md` (10px)
- Shadow: `shadow-sm`
- Hover: `cinnamon-600`, `shadow-md`, `scale(1.02)`
- Pressed: `cinnamon-600`, `scale(0.98)`
- Focus: 2px `cinnamon-500` outline, 2px offset

#### Secondary Button (Outlined)
- Background: transparent
- Border: 1.5px solid `cinnamon-500`
- Text: `cinnamon-500`, `body-md` SemiBold
- Same dimensions as primary
- Hover: `cinnamon-50` background, border `cinnamon-600`

#### Ghost Button
- Background: transparent, no border
- Text: `neutral-600`, `body-md` Regular
- Hover: `neutral-100` background
- Used for: Skip, Cancel, secondary destructive actions

#### Destructive Button
- Background: `error`
- Text: white
- Hover: darken 10%
- Use sparingly: reset progress, delete content

#### Icon Button
- Size: 36px × 36px (touch-safe)
- Background: transparent
- Icon size: 18px
- Hover: `neutral-100` background, `scale(1.1)`
- Active: `neutral-200`, `scale(0.95)`

---

### 9.7 Input Fields

```
┌─ Label ────────────────────────────┐
│  Placeholder or value text...   [icon] │
└────────────────────────────────────┘
  Helper text or error message
```

- Height: 48px
- Border: 1.5px solid `neutral-200`
- Background: `#FFFFFF`
- Radius: `radius-md` (10px)
- Padding: `space-3` (12px) vertical, `space-4` (16px) horizontal
- Label: `caption`, `neutral-700`, `space-1` above field
- Placeholder: `neutral-400`
- Helper text: `caption`, `neutral-500`
- Focus: border `cinnamon-500`, `shadow-glow-cinnamon` at 15% opacity
- Error: border `error`, helper text in `error` color
- Success: border `success`, optional checkmark icon right

---

### 9.8 Tags and Badges

| Variant | Background | Text | Use |
|---|---|---|---|
| Domain | domain color at 12% | domain color | Question domain label |
| Difficulty | neutral-100 | neutral-700 | Easy/Medium/Hard |
| Status | semantic-light | semantic color | Correct/Incorrect/Skipped |
| New | info-light | info | New flashcard |
| Due | warning-light | warning | Due for review |
| Overdue | error-light | error | Overdue review |

- Padding: `space-1` (4px) vertical, `space-3` (12px) horizontal
- Radius: `radius-sm` (6px)
- Typography: `overline` or `caption` SemiBold

---

## 10. Dark Mode

### 10.1 Philosophy

miniMENTE's dark mode preserves the warmth of the cinnamon brand. It is a **warm dark mode** — the opposite of cold gray-on-black interfaces. Studying at night should feel like a candlelit library, not a fluorescent office.

**Rule:** No surface in dark mode uses a neutral below warm-brown undertone.

### 10.2 Dark Mode Color Mapping

```css
/* Dark mode via CSS class on <html>: .theme-dark */

/* Backgrounds */
--bg-page:     #1A140F;  /* neutral-900 */
--bg-surface:  #302A26;  /* neutral-800 */
--bg-elevated: #4D4540;  /* neutral-700 */
--bg-card:     #302A26;

/* Text */
--text-primary:   #FDFAF8;  /* neutral-50 */
--text-secondary: #D4C9BC;  /* neutral-300 */
--text-muted:     #8A7D73;  /* neutral-500 */

/* Primary brand — shifted for contrast on dark */
--cinnamon-primary:     #D48B69;  /* cinnamon-400 */
--cinnamon-primary-hover: #E4B49A;  /* cinnamon-300 */

/* Borders */
--border-subtle:  rgba(212, 201, 188, 0.12);  /* neutral-300 at low opacity */
--border-default: rgba(212, 201, 188, 0.20);

/* Semantic colors — slightly lighter for dark context */
--success-dark:  #5A9E6F;
--error-dark:    #D45247;
--warning-dark:  #E6B82A;
--info-dark:     #4A8FC4;
```

### 10.3 Dark Mode Shadow Adjustments

```css
.theme-dark {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.20);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.30);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.40);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.50);
}
```

### 10.4 Dark Mode Toggle

- Accessible in: Profile menu → Appearance
- System preference respected by default: `prefers-color-scheme: dark`
- Toggle persists in `localStorage`
- Icon button in header (sun/moon) for quick access
- Transition on toggle: 300ms color transition on all CSS variables (page-level `transition: background-color 300ms, color 300ms`)

---

## 11. Accessibility

### 11.1 Standard

All miniMENTE interfaces must meet **WCAG 2.1 AA** at minimum. Critical paths (question answering, navigation, settings) are held to **AAA** where achievable.

### 11.2 Color Contrast Requirements

| Text Size | Minimum Ratio | Target |
|---|---|---|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 | 4.5:1 |
| UI components and states | 3:1 | 4.5:1 |
| Decorative elements | None | — |

**Critical pairs to verify:**
- `cinnamon-500` on white: must be ≥ 4.5:1 — verify (#C45C2E on #FFFFFF = ~4.6:1, borderline — verify with tool)
- `neutral-900` on `cinnamon-50`: must pass — (#1A140F on #FDF7F4 = high contrast, passes)
- Domain colors on white backgrounds: all must pass 3:1 for UI components
- `neutral-400` on white (placeholder text): must pass 4.5:1 — (#AFA399 on #FFFFFF ~2.9:1, FAILS — use `neutral-500` minimum for placeholder text)

**Note on Cinnamon-500:** If contrast tool fails at exact 4.5:1, use `cinnamon-600` (#A84A22) for text and interactive elements on white. Reserve `cinnamon-500` for backgrounds/decorative use where text is white on it (white on cinnamon-500 passes).

### 11.3 Focus Indicators

All interactive elements must have visible focus styles:

```css
:focus-visible {
  outline: 2px solid var(--cinnamon-500);
  outline-offset: 2px;
  border-radius: inherit;
}
```

Never use `outline: none` without a custom replacement. Focus indicators must be visible in both light and dark mode.

### 11.4 Keyboard Navigation

| Context | Keys |
|---|---|
| Answer selection | A / B / C / D / E |
| Confirm answer | Enter |
| Skip question | S |
| Previous question | ← or Page Up |
| Next question | → or Page Down |
| Toggle explanation | E |
| Open domain navigator | D |
| Open performance panel | P |
| Full keyboard nav | Tab / Shift+Tab |
| Close modal | Escape |
| Toggle dark mode | Alt+D |

All keyboard shortcuts must be documented in a discoverable keyboard shortcut overlay (`?` key).

### 11.5 Screen Reader Requirements

- All images have meaningful `alt` text or `aria-hidden="true"` if decorative
- Icons used as interactive elements have `aria-label`
- Domain radial progress uses `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Answer option selection announces: "Selected: option [A]. [Option text]." on selection
- Answer feedback announces: "Correct" or "Incorrect. The correct answer is [X]." on submission
- Streak flame icon: `aria-label="Study streak: 7 days"` or `aria-hidden` if count is adjacent text
- Live regions (`aria-live="polite"`) for XP gains and toast notifications

### 11.6 Motion and Vestibular

```css
@media (prefers-reduced-motion: reduce) {
  /* All transitions and animations set to instant (0ms) or none */
  /* except color transitions for state changes — these remain */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* Re-enable essential color transitions */
  .answer-option, button, input, .theme-transition {
    transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease !important;
  }
}
```

### 11.7 Touch Targets

- All touch targets: minimum 44×44px (Apple HIG) / 48×48dp (Material)
- Answer option buttons: minimum 48px height (specified)
- Icon buttons: 36px rendered with 48px touch target via padding
- Spacing between adjacent targets: minimum 8px

### 11.8 Text Scaling

- All layouts tested at 200% browser text zoom
- No text clipping or overflow on zoom
- Minimum font size: 12px (`caption`) — no exceptions
- Em/rem units throughout (never px for font-size in CSS — use rem, with 1rem = 16px base)

---

## 12. UI States Reference

Every interactive component must implement all applicable states. This section defines the visual properties for each state.

### 12.1 Answer Option States

```
DEFAULT:
  Background: white
  Border: 1.5px solid neutral-200
  Label circle: neutral-100 bg, neutral-700 text
  Option text: neutral-900
  Shadow: none

HOVER:
  Background: cinnamon-50
  Border: 1.5px solid cinnamon-300
  Label circle: cinnamon-100 bg, cinnamon-700 text
  Transition: 150ms ease-out

FOCUS (keyboard):
  Same as hover + 2px cinnamon-500 outline, 2px offset

SELECTED (before submission):
  Background: cinnamon-100
  Border: 2px solid cinnamon-500
  Label circle: cinnamon-500 bg, white text
  Option text: cinnamon-900 (or neutral-900)
  Shadow: shadow-sm

CORRECT (after submission):
  Background: success-light (#D4EDDA)
  Border: 2px solid success (#4A7C59)
  Label circle: success bg, white text
  Icon: checkmark appears right
  Animation: pulse (border glow + checkmark bounce)

INCORRECT — Selected Wrong:
  Background: error-light (#FDECEA)
  Border: 2px solid error (#C0392B)
  Label circle: error bg, white text
  Icon: X appears right
  Animation: shake 3x

INCORRECT — Correct Answer Reveal:
  Background: success-light
  Border: 2px solid success
  Label circle: success bg, white text
  Icon: checkmark
  Note: only the actually correct option gets this state

DISABLED:
  Background: neutral-50
  Border: 1px solid neutral-200
  Text: neutral-300
  Cursor: not-allowed
  No hover effects

LOADING:
  Shimmer skeleton animation on content areas
  Skeleton color: neutral-200 animated to neutral-100
```

---

### 12.2 Button States

```
PRIMARY:
  Default:  bg cinnamon-500, text white, shadow-sm
  Hover:    bg cinnamon-600, shadow-md, scale(1.02)
  Focus:    cinnamon-500 outline 2px, offset 2px
  Active:   bg cinnamon-600, scale(0.98), shadow-xs
  Disabled: bg neutral-200, text neutral-400, no shadow, cursor not-allowed
  Loading:  bg cinnamon-500/80, spinner icon replaces text, no interaction

SECONDARY (Outlined):
  Default:  transparent bg, cinnamon-500 border + text
  Hover:    cinnamon-50 bg, cinnamon-600 border + text
  Focus:    cinnamon-500 outline 2px, offset 2px
  Active:   cinnamon-100 bg, cinnamon-600 border + text
  Disabled: transparent bg, neutral-200 border, neutral-400 text

GHOST:
  Default:  transparent bg, neutral-600 text
  Hover:    neutral-100 bg
  Focus:    cinnamon-500 outline 2px, offset 2px
  Active:   neutral-200 bg
  Disabled: neutral-300 text, no hover
```

---

### 12.3 Input Field States

```
DEFAULT:
  Border: 1.5px solid neutral-200
  Background: white
  Text: neutral-900
  Placeholder: neutral-400 (verify contrast — see 11.2)

HOVER:
  Border: 1.5px solid neutral-300

FOCUS:
  Border: 1.5px solid cinnamon-500
  Shadow: 0 0 0 3px rgba(196, 92, 46, 0.15)
  Transition: 200ms ease-out

FILLED / ACTIVE:
  Border: 1.5px solid neutral-300
  Text: neutral-900

DISABLED:
  Background: neutral-50
  Border: 1px solid neutral-100
  Text: neutral-400
  Cursor: not-allowed

ERROR:
  Border: 1.5px solid error
  Shadow: 0 0 0 3px rgba(192, 57, 43, 0.12)
  Helper text: error color

SUCCESS:
  Border: 1.5px solid success
  Icon: checkmark right
  Helper text: success color

LOADING:
  Spinner icon in right position
  Input disabled during loading
```

---

### 12.4 Card States

```
DEFAULT:
  Shadow: shadow-sm
  Transform: none
  Background: white
  Border: 1px solid cinnamon-200 (optional, for definition on similar backgrounds)

HOVER:
  Shadow: shadow-md
  Transform: translateY(-2px)
  Transition: 200ms ease-out

FOCUSED (keyboard):
  Shadow: shadow-md + shadow-glow-cinnamon
  Outline: 2px cinnamon-500, offset 2px

ACTIVE (pressed):
  Shadow: shadow-xs
  Transform: translateY(0)
  Transition: 100ms ease-in

LOADING:
  Shimmer skeleton replaces content
  Skeleton: neutral-200 → neutral-100 animated sweep, 1.5s infinite

EMPTY:
  Dashed border: 1.5px dashed neutral-200
  Content: centered icon + message
  Background: neutral-50

ERROR:
  Border-left: 3px solid error
  Background: error-light
  Icon: error icon in header
```

---

### 12.5 Navigation Item States

```
DEFAULT:
  Background: transparent
  Text: neutral-700
  Icon: neutral-500

HOVER:
  Background: cinnamon-50
  Text: neutral-900
  Icon: cinnamon-500
  Transition: 150ms ease-out

ACTIVE (current page/section):
  Background: cinnamon-100
  Border-left: 3px solid cinnamon-500
  Text: cinnamon-700
  Icon: cinnamon-500

FOCUS:
  cinnamon-500 outline 2px, offset 2px inside
```

---

## 13. Visual References & Inspiration

### 13.1 granola.ai
**What to borrow:**
- Single-workspace paradigm — no multi-page navigation
- Card-based sessions and content organization
- Dual-scope "chat + structured content" interaction model
- Folder/hierarchy organization in left panel
- Clean session state in header

**miniMENTE adaptation:** The "card-based sessions" become study sessions. The folder hierarchy becomes the domain/topic tree. The dual-scope chat becomes the question card + AI tutor panel.

### 13.2 polvera.ai
**What to borrow:**
- Premium AI workspace aesthetic — generous whitespace, minimal chrome
- Typography-forward design (large, readable, confident text)
- Subtle warm color application
- Clean surface hierarchy

**miniMENTE adaptation:** Apply the same restraint — let the question content breathe. Do not over-decorate. Premium feel comes from quality of type and space, not from decorative elements.

### 13.3 qbankly.app
**What to borrow:**
- Unified multi-modal study interface — questions, flashcards, notes in one context
- Minimal navigation (avoid multi-page app feel)
- IRT analytics dashboard prominent — performance data is first-class, not buried in a settings page
- Domain-level breakdown visible during study, not just in a separate "stats" view

**miniMENTE adaptation:** The IRT analytics become the FSRS performance metrics in the right panel. Domain breakdowns are always visible as radial charts, not hidden behind tabs. Study modes (question practice, flashcard review, AI tutoring) exist in the same workspace, switchable via a mode selector at the top of the center area.

---

## 14. Implementation Notes

### 14.1 CSS Architecture

Use CSS custom properties (variables) for all design tokens. This enables:
- Dark mode via class swap on `<html>` or `<body>`
- Theme customization per user
- Consistent token usage across components

```css
/* tokens.css — import first in every component */
:root {
  /* Colors */
  --cinnamon-500: #C45C2E;
  /* ... all tokens ... */

  /* Semantic mappings (light mode defaults) */
  --color-primary: var(--cinnamon-500);
  --color-background: var(--cinnamon-50);
  --color-surface: #FFFFFF;
  --color-text-primary: var(--neutral-900);
  --color-text-secondary: var(--neutral-600);
  --color-border: var(--cinnamon-200);
}

.theme-dark {
  --color-background: var(--neutral-900);
  --color-surface: var(--neutral-800);
  --color-primary: var(--cinnamon-400);
  --color-text-primary: var(--neutral-50);
  --color-text-secondary: var(--neutral-300);
  --color-border: rgba(212, 201, 188, 0.20);
}
```

### 14.2 Font Loading Strategy

```html
<!-- In <head> — preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load Inter first (body), then Lora (display) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

Use `font-display: swap` to prevent FOIT (Flash of Invisible Text).

### 14.3 Animation Implementation

For spring physics, use one of:
- **Framer Motion** (React): `useSpring`, `motion.div` with spring transition
- **React Spring**: explicit spring configuration
- **CSS Spring** (limited): `transition: all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)` approximates bounce spring

For the streak flame: pure CSS `@keyframes` with `animation-play-state: running/paused` controlled by streak count.

For XP counter: `requestAnimationFrame` with linear interpolation between old and new values, then ease-out applied to the progress.

### 14.4 Responsive Breakpoints

```css
/* Mobile first */
/* Default: < 768px (mobile) */

@media (min-width: 768px)  { /* tablet */ }
@media (min-width: 1024px) { /* desktop — panels appear */ }
@media (min-width: 1280px) { /* wide desktop — right panel default open */ }
@media (min-width: 1536px) { /* ultra-wide — increased max-widths */ }
```

### 14.5 Performance Considerations

- **Lazy-load fonts:** Only load display fonts (Lora) on pages that use display-level headings
- **Animate with transform/opacity only:** Never animate `width`, `height`, `margin`, or `padding` — these force layout
- **Hardware acceleration:** Apply `will-change: transform` to cards that animate on hover — remove after animation
- **Skeleton screens:** Show skeletons immediately on data fetch — never show blank white areas
- **Image optimization:** AMC question images (if any) must be WebP, max 800px wide, lazy-loaded

### 14.6 Component File Naming Convention

```
components/
├── study/
│   ├── QuestionCard.tsx
│   ├── ExplanationPanel.tsx
│   ├── NavigationControls.tsx
│   └── AnswerOption.tsx
├── dashboard/
│   ├── PerformancePanel.tsx
│   ├── DomainRadialChart.tsx
│   ├── StreakTracker.tsx
│   └── AIInsight.tsx
├── navigation/
│   ├── DomainNavigator.tsx
│   ├── TopicsTree.tsx
│   └── WorkspaceHeader.tsx
├── primitives/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Tag.tsx
│   └── ProgressBar.tsx
└── layout/
    ├── WorkspaceLayout.tsx
    ├── LeftPanel.tsx
    ├── CenterArea.tsx
    └── RightPanel.tsx
```

### 14.7 Design Token Export

Design tokens should be maintained in a single source of truth and exported to:
- CSS custom properties (`tokens.css`)
- JavaScript/TypeScript constants (`tokens.ts`) for use in Framer Motion, inline styles, and tests
- If Tailwind is used: `tailwind.config.js` extending the default theme with all custom tokens

```typescript
// tokens.ts
export const colors = {
  cinnamon: {
    50:  '#FDF7F4',
    100: '#F9EDE6',
    // ...
    500: '#C45C2E',
    // ...
  },
  neutral: {
    50: '#FDFAF8',
    // ...
  },
  semantic: {
    success: '#4A7C59',
    error:   '#C0392B',
    warning: '#D4A017',
    info:    '#2E6DA4',
  },
  domain: {
    adultMedicine:    '#2E6DA4',
    adultSurgery:     '#1B7A4E',
    womensHealth:     '#8E44AD',
    childHealth:      '#E67E22',
    mentalHealth:     '#5D6D7E',
    populationHealth: '#16A085',
  },
} as const;
```

---

*This document is the canonical design reference for miniMENTE. All implementation decisions that deviate from this specification require explicit design review. When in doubt, refer to the core brand principle: warmth, clarity, and premium academic quality — like cinnamon.*

---

**Document maintained by:** Design System Team
**Next review:** On major feature addition or brand evolution
**Version history:** Tracked in git alongside the codebase
