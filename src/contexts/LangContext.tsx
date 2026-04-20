"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "@/lib/copy";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load preference from user_profiles on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("user_profiles")
        .select("language_pref")
        .eq("user_id", user.id)
        .single()
        .then(({ data }: { data: { language_pref: string } | null }) => {
          if (data?.language_pref === "pt") setLangState("pt");
        })
        .catch(() => {});
    });
  }, []);

  function setLang(newLang: Lang) {
    setLangState(newLang);
    // Persist to DB (fire-and-forget)
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("user_profiles")
        .update({ language_pref: newLang })
        .eq("user_id", user.id)
        .then(() => {})
        .catch(() => {});
    });
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
