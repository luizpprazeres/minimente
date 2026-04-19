import { cn } from "@/lib/utils";

interface RightPanelProps {
  children?: React.ReactNode;
  className?: string;
}

export function RightPanel({ children, className }: RightPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto border-l border-neutral-200 bg-neutral-50",
        className
      )}
    >
      {children ?? (
        <div className="p-4 space-y-3">
          {/* Skeleton placeholder for PerformancePanel (Story 1.3) */}
          <div className="h-6 w-3/4 rounded bg-neutral-200 animate-pulse" />
          <div className="h-16 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="h-10 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="h-10 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="h-24 rounded-xl bg-cinnamon-100 animate-pulse" />
        </div>
      )}
    </aside>
  );
}
