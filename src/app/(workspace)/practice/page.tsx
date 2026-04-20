import Link from "next/link";
import { BookOpen, Zap, Brain } from "lucide-react";

export const metadata = { title: "Practice" };

const MODES = [
  {
    href: "/practice/session",
    icon: BookOpen,
    title: "Spaced Repetition",
    titlePt: "Repetição Espaçada",
    description: "Review cards due today — optimised by FSRS algorithm",
    descriptionPt: "Revise os cards com vencimento hoje — optimizado pelo FSRS",
    color: "bg-cinnamon-50 border-cinnamon-200 hover:border-cinnamon-400 hover:bg-cinnamon-100",
    iconColor: "text-cinnamon-500",
    badge: null,
  },
  {
    href: "/practice/session?mode=exam",
    icon: Zap,
    title: "Exam Simulation",
    titlePt: "Simulado",
    description: "150 questions in real exam format, timed",
    descriptionPt: "150 questões no formato real da prova, com tempo",
    color: "bg-neutral-50 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100",
    iconColor: "text-neutral-600",
    badge: "Coming soon",
  },
  {
    href: "/practice/session?mode=tutor",
    icon: Brain,
    title: "Tutor Mode",
    titlePt: "Modo Tutor",
    description: "Answer and deeply understand each question",
    descriptionPt: "Responda e entenda cada questão em profundidade",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100",
    iconColor: "text-blue-600",
    badge: null,
  },
] as const;

export default function PracticePage() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-800">
          How do you want to study today?
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Choose your study mode and get started.
        </p>
      </div>

      {/* R3 fix: responsive grid (1 col mobile, 3 cols tablet+) */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        {MODES.map(({ href, icon: Icon, title, titlePt, description, descriptionPt, color, iconColor, badge }) => (
          <Link
            key={href}
            href={href}
            className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 sm:p-5 transition-all ${color}`}
          >
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-800">{title}</p>
              <p className="text-xs text-neutral-400">{titlePt}</p>
              <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
            </div>
            {badge && (
              <span className="shrink-0 text-xs font-medium bg-neutral-200 text-neutral-500 rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
