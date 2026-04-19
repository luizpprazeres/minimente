import Link from "next/link";
import { BookOpen, Zap, Brain } from "lucide-react";

export const metadata = { title: "Practice" };

const MODES = [
  {
    href: "/practice/session",
    icon: BookOpen,
    title: "Spaced Repetition",
    description: "FSRS-powered review of due cards",
    color: "bg-cinnamon-50 border-cinnamon-200 hover:border-cinnamon-400",
    iconColor: "text-cinnamon-500",
  },
  {
    href: "/practice/session?mode=exam",
    icon: Zap,
    title: "Exam Simulation",
    description: "Timed 150-question AMC format",
    color: "bg-neutral-50 border-neutral-200 hover:border-neutral-400",
    iconColor: "text-neutral-600",
  },
  {
    href: "/practice/session?mode=tutor",
    icon: Brain,
    title: "Tutor Mode",
    description: "Immediate feedback with AI explanations",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconColor: "text-blue-600",
  },
] as const;

export default function PracticePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-800">Study Session</h1>
        <p className="mt-1 text-sm text-neutral-500">Choose your study mode</p>
      </div>

      <div className="grid gap-3">
        {MODES.map(({ href, icon: Icon, title, description, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 rounded-2xl border-2 p-5 transition-all ${color}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <p className="font-semibold text-neutral-800">{title}</p>
              <p className="text-sm text-neutral-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
