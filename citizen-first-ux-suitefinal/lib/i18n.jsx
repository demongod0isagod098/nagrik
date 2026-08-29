"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Languages } from "lucide-react";

const STORAGE_KEY = "nagrik.lang";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

/**
 * Site-wide English / Hindi language state.
 *
 * Translation is done with inline pairs — `t("English copy", "हिंदी कॉपी")` —
 * rather than a central key registry, so a string and its translation always
 * live together at the point of use.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // Restore the visitor's previous choice once mounted (never during SSR).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Returns `t(en, hi)`. Falls back to the English copy when a Hindi string
 * has not been supplied, so a missing translation degrades instead of blanking.
 */
export function useT() {
  const { lang } = useLanguage();
  return (en, hi) => (lang === "hi" && hi ? hi : en);
}

/**
 * English / Hindi dropdown. A native `<select>` keeps it keyboard- and
 * screen-reader-accessible for free; the icon and caret are decorative overlays.
 */
export function LanguageToggle({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <label
      className={`relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 ${className}`}
    >
      <Languages className="h-4 w-4 flex-none text-slate-400" aria-hidden="true" />
      <span className="sr-only">Language / भाषा</span>
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-4 font-bold text-slate-700 outline-none"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
      <span
        className="pointer-events-none absolute right-3 text-xs text-slate-400"
        aria-hidden="true"
      >
        ▾
      </span>
    </label>
  );
}
