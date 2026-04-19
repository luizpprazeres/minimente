"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./Header";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  /** Pass streak/xp/avatarUrl for header stats */
  headerProps?: {
    streak?: number;
    xp?: number;
    avatarUrl?: string | null;
  };
  className?: string;
}

export function AppShell({
  children,
  leftPanel,
  rightPanel,
  headerProps,
  className,
}: AppShellProps) {
  return (
    <div className={cn("flex h-screen flex-col overflow-hidden bg-neutral-100", className)}>
      {/* Header */}
      <Header {...headerProps} className="shrink-0 z-20" />

      {/* Main workspace — 3-panel grid on desktop, single column on mobile */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — hidden on mobile */}
        <div className="hidden md:flex w-[280px] shrink-0 overflow-hidden">
          <LeftPanel>{leftPanel}</LeftPanel>
        </div>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== "undefined" ? window.location.pathname : "main"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right panel — hidden on mobile and medium screens */}
        <div className="hidden lg:flex w-[320px] shrink-0 overflow-hidden">
          <RightPanel>{rightPanel}</RightPanel>
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden shrink-0 z-20">
        <MobileNav />
      </div>
    </div>
  );
}
