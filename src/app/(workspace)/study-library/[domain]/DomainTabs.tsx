"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, Trophy, Map, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainTabsProps {
  panorama: string;
  highYield: string;
  guia: string;
}

const TABS = [
  { id: "panorama", label: "Panorama", icon: BookOpen },
  { id: "highyield", label: "High-Yield", icon: Trophy },
  { id: "guia", label: "Guia Estratégico", icon: Map },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DomainTabs({ panorama, highYield, guia }: DomainTabsProps) {
  const [active, setActive] = useState<TabId>("panorama");
  const contentRef = useRef<HTMLDivElement>(null);

  const content: Record<TabId, string> = {
    panorama,
    highyield: highYield,
    guia,
  };

  // Scroll to top when tab changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  // Animate tab change with a subtle fade using CSS
  const [visible, setVisible] = useState(true);
  function handleTab(id: TabId) {
    if (id === active) return;
    setVisible(false);
    setTimeout(() => {
      setActive(id);
      setVisible(true);
    }, 150);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-neutral-200 bg-white shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-cinnamon-50 text-cinnamon-700 border border-cinnamon-200"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <MarkdownRenderer>{content[active]}</MarkdownRenderer>
        </div>
      </div>
    </div>
  );
}

// ── Markdown renderer styled for study content ──

function MarkdownRenderer({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-neutral-900 mb-1 leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-neutral-800 mt-8 mb-3 pb-2 border-b border-neutral-200 leading-snug">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold text-cinnamon-700 mt-5 mb-2 leading-snug">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm text-neutral-700 leading-relaxed mb-3">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-neutral-600">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 space-y-1.5 ml-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 space-y-1.5 ml-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-sm text-neutral-700">
            <ChevronRight className="h-3.5 w-3.5 text-cinnamon-400 shrink-0 mt-0.5" />
            <span>{children}</span>
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-cinnamon-300 bg-cinnamon-50 pl-4 pr-3 py-2 my-3 rounded-r-lg text-sm text-neutral-700 italic">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <pre className="bg-neutral-900 rounded-xl p-4 my-4 overflow-x-auto">
                <code className="text-xs text-neutral-100 font-mono leading-relaxed whitespace-pre">
                  {children}
                </code>
              </pre>
            );
          }
          return (
            <code className="bg-neutral-100 text-cinnamon-700 rounded px-1.5 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200 shadow-sm">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-cinnamon-50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-cinnamon-700 border-b border-cinnamon-200 whitespace-nowrap">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-neutral-700 border-b border-neutral-100 text-xs">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="my-6 border-neutral-200" />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
