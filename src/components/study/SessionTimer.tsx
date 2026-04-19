"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionTimerProps {
  mode?: "up" | "down";
  limitSeconds?: number;
  className?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SessionTimer({ mode = "up", limitSeconds, className }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const display =
    mode === "down" && limitSeconds != null
      ? formatTime(Math.max(0, limitSeconds - elapsed))
      : formatTime(elapsed);

  const isWarning = mode === "down" && limitSeconds != null && limitSeconds - elapsed < 60;

  return (
    <div className={cn("flex items-center gap-1 text-sm", isWarning ? "text-error font-semibold" : "text-neutral-500", className)}>
      <Clock className="h-3.5 w-3.5" />
      <span>{display}</span>
    </div>
  );
}
