/**
 * miniMENTE — Bilingual Copy
 * All user-facing strings in PT-BR and EN.
 */

export type Lang = "en" | "pt";

// ── Auth ──────────────────────────────────────────────────────────────────

export const authCopy = {
  tagline: {
    en: "Focus your mind. Master any exam.",
    pt: "Foque sua mente. Domine qualquer prova.",
  },
  login: {
    title: { en: "Welcome back", pt: "Bem-vindo de volta" },
    emailLabel: { en: "Email", pt: "E-mail" },
    emailPlaceholder: { en: "you@example.com", pt: "voce@exemplo.com" },
    passwordLabel: { en: "Password", pt: "Senha" },
    passwordPlaceholder: { en: "••••••••", pt: "••••••••" },
    forgotLink: { en: "Forgot password?", pt: "Esqueceu a senha?" },
    submitBtn: { en: "Sign in", pt: "Entrar" },
    loadingBtn: { en: "Signing in…", pt: "Entrando…" },
    divider: { en: "or", pt: "ou" },
    googleBtn: { en: "Continue with Google", pt: "Continuar com Google" },
    footerText: { en: "No account yet?", pt: "Ainda não tem conta?" },
    footerLink: { en: "Sign up", pt: "Crie agora" },
    errInvalid: {
      en: "Invalid email or password",
      pt: "E-mail ou senha inválidos",
    },
  },
  signup: {
    title: { en: "Create your free account", pt: "Crie sua conta grátis" },
    submitBtn: { en: "Create account", pt: "Criar conta" },
    loadingBtn: { en: "Creating account…", pt: "Criando conta…" },
    successMsg: {
      en: "Check your email to confirm your account.",
      pt: "Confira seu e-mail para confirmar o cadastro.",
    },
    footerText: { en: "Already have an account?", pt: "Já tem conta?" },
    footerLink: { en: "Sign in", pt: "Entre aqui" },
    errInUse: {
      en: "This email is already in use",
      pt: "Este e-mail já está em uso",
    },
  },
  reset: {
    title: { en: "Reset your password", pt: "Recuperar senha" },
    desc: {
      en: "Enter your email and we'll send you a reset link.",
      pt: "Insira seu e-mail e enviaremos um link para redefinir sua senha.",
    },
    submitBtn: { en: "Send reset link", pt: "Enviar link de recuperação" },
    loadingBtn: { en: "Sending…", pt: "Enviando…" },
    successMsg: {
      en: "Link sent! Check your inbox.",
      pt: "Link enviado! Verifique sua caixa de entrada.",
    },
    backLink: { en: "Back to sign in", pt: "Voltar para o login" },
  },
  errGeneric: {
    en: "Something went wrong. Please try again.",
    pt: "Algo deu errado. Tente novamente.",
  },
  validationEmail: {
    en: "Enter a valid email address",
    pt: "Insira um e-mail válido",
  },
  validationPassword: {
    en: "Password must be at least 8 characters",
    pt: "A senha deve ter ao menos 8 caracteres",
  },
};

// ── Onboarding ────────────────────────────────────────────────────────────

export const onboardingCopy = {
  title: {
    en: "Let's personalize your experience",
    pt: "Vamos personalizar sua experiência",
  },
  subtitle: {
    en: "Answer 2 quick questions to get you started right.",
    pt: "Responda 2 perguntinhas para começarmos do jeito certo.",
  },
  langLabel: {
    en: "What's your preferred language?",
    pt: "Qual idioma você prefere?",
  },
  goalLabel: {
    en: "How many questions per day?",
    pt: "Quantas questões por dia?",
  },
  goals: [
    {
      value: 10,
      label: { en: "10 questions · ~10 min", pt: "10 questões · ~10 min" },
      badge: { en: "Light", pt: "Leve" },
    },
    {
      value: 20,
      label: { en: "20 questions · ~20 min", pt: "20 questões · ~20 min" },
      badge: { en: "Moderate", pt: "Moderado" },
      recommended: true,
    },
    {
      value: 40,
      label: { en: "40 questions · ~40 min", pt: "40 questões · ~40 min" },
      badge: { en: "Intensive", pt: "Intensivo" },
    },
  ],
  submitBtn: { en: "Let's go →", pt: "Começar agora →" },
  loadingBtn: { en: "Saving…", pt: "Salvando…" },
};

// ── Dashboard ─────────────────────────────────────────────────────────────

export const dashboardCopy = {
  welcomeTitle: { en: "Ready to study today?", pt: "Pronto para estudar hoje?" },
  welcomeDesc: {
    en: "Your personalized session is ready. Pick up where you left off.",
    pt: "Sua sessão personalizada está pronta. Continue de onde parou.",
  },
  startCta: { en: "Start session", pt: "Começar sessão" },
};

// ── Practice ─────────────────────────────────────────────────────────────

export const practiceCopy = {
  title: { en: "How do you want to study today?", pt: "Como quer estudar hoje?" },
  subtitle: {
    en: "Choose your study mode and get started.",
    pt: "Escolha o modo de estudo e comece agora.",
  },
  modes: [
    {
      title: { en: "Spaced Repetition", pt: "Repetição Espaçada" },
      desc: {
        en: "Review cards due today — optimised by FSRS algorithm",
        pt: "Revise os cards com vencimento hoje — optimizado pelo algoritmo FSRS",
      },
    },
    {
      title: { en: "Exam Simulation", pt: "Simulado" },
      desc: {
        en: "150 questions in real exam format, timed",
        pt: "150 questões no formato real da prova, com tempo",
      },
    },
    {
      title: { en: "Tutor Mode", pt: "Modo Tutor" },
      desc: {
        en: "Answer and deeply understand each question",
        pt: "Responda e entenda cada questão em profundidade",
      },
    },
  ],
};

// ── Session ────────────────────────────────────────────────────────────────

export const sessionCopy = {
  loadError: {
    en: "Failed to load session",
    pt: "Erro ao carregar a sessão",
  },
  tryAgain: { en: "Please try again", pt: "Tente novamente" },
  progress: {
    question: { en: "Q", pt: "Q" },
    of: { en: "of", pt: "de" },
  },
  nextBtn: { en: "Next question", pt: "Próxima questão" },
  summary: {
    title: { en: "Session complete!", pt: "Sessão concluída!" },
    streakKept: { en: "Streak maintained", pt: "Sequência mantida" },
    questions: { en: "Questions answered", pt: "Questões respondidas" },
    accuracy: { en: "Accuracy", pt: "Acertos" },
    xp: { en: "XP earned", pt: "XP ganho" },
    restartBtn: { en: "Keep studying", pt: "Estudar mais" },
    dashboardBtn: { en: "View my progress", pt: "Ver meu progresso" },
  },
};

// ── Navigation ────────────────────────────────────────────────────────────

export const navCopy = {
  mobile: [
    { en: "Study", pt: "Estudar" },
    { en: "Domains", pt: "Domínios" },
    { en: "Progress", pt: "Progresso" },
    { en: "Vocab", pt: "Vocab" },
    { en: "Profile", pt: "Perfil" },
  ],
};

// ── Performance Panel ────────────────────────────────────────────────────

export const perfCopy = {
  panelTitle: { en: "PERFORMANCE", pt: "DESEMPENHO" },
  dueToday: { en: "Due today", pt: "Vence hoje" },
  dailyGoal: { en: "Daily goal", pt: "Meta diária" },
  goalReached: { en: "Goal reached! 🎉", pt: "Meta atingida! 🎉" },
  streak: (n: number) => ({
    en: `${n} day streak`,
    pt: `${n} ${n === 1 ? "dia" : "dias"} seguidos`,
  }),
  bestStreak: (n: number) => ({
    en: `Best: ${n} days`,
    pt: `Recorde: ${n} dias`,
  }),
  hot: { en: "🔥 Hot!", pt: "🔥 Em chamas!" },
  weakestArea: { en: "Weakest area", pt: "Área mais fraca" },
  startSession: { en: "Start Session", pt: "Iniciar Sessão" },
  noDomains: { en: "No domains found", pt: "Nenhum domínio encontrado" },
  studyDomain: { en: "Study this domain", pt: "Estudar este domínio" },
  masteryLabels: {
    novice: { en: "Novice", pt: "Iniciante" },
    beginner: { en: "Beginner", pt: "Básico" },
    intermediate: { en: "Intermediate", pt: "Intermediário" },
    advanced: { en: "Advanced", pt: "Avançado" },
    fellow: { en: "Fellow", pt: "Especialista" },
  },
};

// ── SEO / Metadata ────────────────────────────────────────────────────────

export const metaCopy = {
  siteTitle: {
    en: "miniMENTE — Focus your mind. Master any exam.",
    pt: "miniMENTE — Foque sua mente. Domine qualquer prova.",
  },
  siteDesc: {
    en: "Study platform with spaced repetition and intelligent tutoring. Prepare for AMC, licensing exams, public competitions, and more.",
    pt: "Plataforma de estudos com repetição espaçada e tutor inteligente. Prepare-se para o AMC, concursos públicos, vestibulares e muito mais.",
  },
  keywords: [
    "AMC",
    "Australian Medical Council",
    "MCQ",
    "spaced repetition",
    "study platform",
    "concurso público",
    "vestibular",
    "USMLE",
    "Revalida",
  ],
};

// ── Placeholder pages ─────────────────────────────────────────────────────

export const placeholderCopy = {
  progress: {
    title: { en: "Progress", pt: "Progresso" },
    coming: {
      en: "Your stats and insights are coming soon.",
      pt: "Suas estatísticas e insights estão chegando em breve.",
    },
  },
  vocab: {
    title: { en: "Vocabulary", pt: "Vocabulário" },
    coming: {
      en: "Flashcard vocabulary review is coming soon.",
      pt: "Revisão de vocabulário em flashcards está chegando em breve.",
    },
  },
  profile: {
    title: { en: "Profile", pt: "Perfil" },
    coming: {
      en: "Profile settings are coming soon.",
      pt: "Configurações de perfil estão chegando em breve.",
    },
  },
};

// ── Helper ────────────────────────────────────────────────────────────────

/** Pick the right language string from a bilingual record. */
export function c(record: { en: string; pt: string }, lang: Lang): string {
  return record[lang] ?? record.en;
}
