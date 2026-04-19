import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streak: number;
  longest: number;
}

export function StreakDisplay({ streak, longest }: StreakDisplayProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Flame className={cn("h-4 w-4", streak > 0 ? "text-orange-400" : "text-neutral-300")} />
        <div>
          <p className="text-sm font-medium text-neutral-700">{streak} day streak</p>
          <p className="text-xs text-neutral-400">Best: {longest} days</p>
        </div>
      </div>
      {streak >= 7 && (
        <span className="text-xs font-semibold text-orange-500 bg-orange-50 rounded-full px-2 py-0.5">
          🔥 Hot!
        </span>
      )}
    </div>
  );
}
