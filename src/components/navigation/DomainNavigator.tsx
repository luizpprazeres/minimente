import Link from "next/link";
import { BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DomainItem } from "./DomainItem";
import type { Subject, MasteryLevel } from "@/types/database";

interface DomainMasteryRow {
  domain: string;
  mastery_level: MasteryLevel;
  accuracy_percentage: number;
  questions_answered: number;
}

interface DomainNavigatorProps {
  userId: string;
}

export async function DomainNavigator({ userId }: DomainNavigatorProps) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [{ data: subjects }, { data: mastery }] = await Promise.all([
    db.from("subjects").select("*").order("sort_order"),
    db
      .from("user_domain_mastery")
      .select("domain, mastery_level, accuracy_percentage, questions_answered")
      .eq("user_id", userId),
  ]);

  const masteryMap: Record<string, DomainMasteryRow> = {};
  (mastery ?? []).forEach((m: DomainMasteryRow) => {
    masteryMap[m.domain] = m;
  });

  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-4 text-sm text-neutral-500 text-center">
        <p>No domains found</p>
      </div>
    );
  }

  return (
    <nav aria-label="Domain navigator" className="space-y-1 p-3">
      {/* Error Notebook link */}
      <Link
        href="/error-notebook"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
      >
        <BookMarked className="h-4 w-4 text-cinnamon-500 shrink-0" />
        <span>Error Notebook</span>
      </Link>

      <div className="my-1 border-t border-neutral-100" />

      {(subjects as Subject[]).map((subject) => {
        const m = masteryMap[subject.amc_domain];
        return (
          <DomainItem
            key={subject.id}
            subject={subject}
            mastery={(m?.mastery_level ?? "novice") as MasteryLevel}
            accuracy={m ? Math.round(m.accuracy_percentage) : 0}
            questionCount={0}
          />
        );
      })}
    </nav>
  );
}
