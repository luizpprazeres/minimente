"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Lightbulb, Target, Loader2 } from "lucide-react";

// ── Types ──

interface InsightData {
  summary: string;
  errorPatterns: string[];
  recommendations: string[];
  studyTip: string;
  strongDomains: string[];
  weakDomains: string[];
}

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  grade: number;
}

interface InsightPanelProps {
  userId: string;
  answers: AnswerRecord[];
  lang?: "en" | "pt";
}

// ── Translations ──

const copy = {
  en: {
    title: "AI Session Analysis",
    subtitle: "Powered by your question bank",
    loading: "Analysing your session…",
    summary: "Session Summary",
    patterns: "Error Patterns",
    recommendations: "Recommendations",
    tip: "Study Tip",
    strong: "Strong Areas",
    weak: "Areas to Focus",
    error: "Couldn't generate insights. Try again after your next session.",
  },
  pt: {
    title: "Análise da Sessão por IA",
    subtitle: "Com base no seu banco de questões",
    loading: "Analisando sua sessão…",
    summary: "Resumo da Sessão",
    patterns: "Padrões de Erro",
    recommendations: "Recomendações",
    tip: "Dica de Estudo",
    strong: "Pontos Fortes",
    weak: "Áreas para Focar",
    error: "Não foi possível gerar insights. Tente novamente após a próxima sessão.",
  },
} as const;

// ── Component ──

export function InsightPanel({ userId, answers, lang = "en" }: InsightPanelProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const t = copy[lang];

  useEffect(() => {
    if (!userId || answers.length === 0) return;
    setLoading(true);
    setError(false);

    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, answers, lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(true);
        else setInsights(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId, answers, lang]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl mx-auto rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-cinnamon-50 to-white">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-cinnamon-500 flex items-center justify-center">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800">{t.title}</p>
          <p className="text-xs text-neutral-400">{t.subtitle}</p>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 py-8 text-neutral-400"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t.loading}</span>
            </motion.div>
          )}

          {/* Error */}
          {error && !loading && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-neutral-400 text-center py-6"
            >
              {t.error}
            </motion.p>
          )}

          {/* Insights */}
          {insights && !loading && (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {/* Summary */}
              <Section icon={<Target className="h-4 w-4" />} title={t.summary}>
                <p className="text-sm text-neutral-700 leading-relaxed">{insights.summary}</p>
              </Section>

              {/* Strong / Weak domains */}
              {(insights.strongDomains.length > 0 || insights.weakDomains.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {insights.strongDomains.length > 0 && (
                    <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">{t.strong}</span>
                      </div>
                      {insights.strongDomains.map((d) => (
                        <p key={d} className="text-xs text-green-600 capitalize">
                          {d.replace(/_/g, " ")}
                        </p>
                      ))}
                    </div>
                  )}
                  {insights.weakDomains.length > 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs font-medium text-red-600">{t.weak}</span>
                      </div>
                      {insights.weakDomains.map((d) => (
                        <p key={d} className="text-xs text-red-500 capitalize">
                          {d.replace(/_/g, " ")}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error patterns */}
              {insights.errorPatterns.length > 0 && (
                <Section title={t.patterns}>
                  <ul className="space-y-1.5">
                    {insights.errorPatterns.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                        <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cinnamon-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <Section title={t.recommendations}>
                  <ul className="space-y-1.5">
                    {insights.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                        <span className="text-cinnamon-500 font-bold mt-0.5 flex-shrink-0">
                          {i + 1}.
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Study tip */}
              {insights.studyTip && (
                <div className="flex items-start gap-3 rounded-xl bg-cinnamon-50 border border-cinnamon-100 px-4 py-3">
                  <Lightbulb className="h-4 w-4 text-cinnamon-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-cinnamon-600 mb-0.5">{t.tip}</p>
                    <p className="text-sm text-cinnamon-700">{insights.studyTip}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Sub-component ──

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-neutral-400">{icon}</span>}
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  );
}
