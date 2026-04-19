import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout";
import { DomainNavigator } from "@/components/navigation/DomainNavigator";
import { PerformancePanel } from "@/components/dashboard/PerformancePanel";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get header stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [{ data: xpData }, { data: streakData }] = await Promise.all([
    user
      ? db.from("user_xp").select("total_xp").eq("user_id", user.id).single()
      : Promise.resolve({ data: null }),
    user
      ? db.from("user_streaks").select("current_streak").eq("user_id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const leftPanel = user ? (
    <Suspense
      fallback={
        <div className="p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-neutral-200 animate-pulse" />
          ))}
        </div>
      }
    >
      <DomainNavigator userId={user.id} />
    </Suspense>
  ) : null;

  const rightPanel = user ? (
    <Suspense
      fallback={
        <div className="p-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-200 animate-pulse" />
          ))}
        </div>
      }
    >
      <PerformancePanel userId={user.id} />
    </Suspense>
  ) : null;

  return (
    <AppShell
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      headerProps={{
        streak: streakData?.current_streak ?? 0,
        xp: xpData?.total_xp ?? 0,
      }}
    >
      {children}
    </AppShell>
  );
}
