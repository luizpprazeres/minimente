import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueCardsCountProps {
  count: number;
}

export function DueCardsCount({ count }: DueCardsCountProps) {
  const urgency =
    count === 0 ? "none" : count < 5 ? "low" : count < 20 ? "medium" : "high";

  const colors = {
    none: "text-neutral-400",
    low: "text-success",
    medium: "text-warning",
    high: "text-error",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Clock className={cn("h-4 w-4", colors[urgency])} />
        <span className="text-sm text-neutral-700">Due today</span>
      </div>
      <span className={cn("text-lg font-semibold", colors[urgency])}>{count}</span>
    </div>
  );
}
