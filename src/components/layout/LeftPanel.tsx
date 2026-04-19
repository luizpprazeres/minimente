import { cn } from "@/lib/utils";

interface LeftPanelProps {
  children?: React.ReactNode;
  className?: string;
}

export function LeftPanel({ children, className }: LeftPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto border-r border-neutral-200 bg-neutral-50",
        className
      )}
    >
      {children ?? (
        <div className="p-4 space-y-2">
          {/* Skeleton placeholder for DomainNavigator (Story 1.3) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-neutral-200 animate-pulse" />
          ))}
        </div>
      )}
    </aside>
  );
}
