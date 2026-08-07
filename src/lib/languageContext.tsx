import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Globe } from "lucide-react";

export type LanguageMode = "bilingual" | "english" | "tamil";

interface LanguageContextType {
  langMode: LanguageMode;
  setLangMode: (mode: LanguageMode) => void;
  t: (tamil: string, english: string, format?: "parentheses" | "stacked" | "inline") => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "unikorn360_lang_mode";

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [langMode, setLangModeState] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "english" || saved === "tamil" || saved === "bilingual") {
        return saved;
      }
    } catch (e) {
      console.error("Failed to read language mode from storage", e);
    }
    return "bilingual";
  });

  const setLangMode = (mode: LanguageMode) => {
    setLangModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.error("Failed to save language mode to storage", e);
    }
  };

  const t = (tamil: string, english: string, format: "parentheses" | "stacked" | "inline" = "parentheses"): string => {
    if (langMode === "english") return english;
    if (langMode === "tamil") return tamil;
    if (format === "stacked") return `${tamil}\n(${english})`;
    if (format === "inline") return `${tamil} / ${english}`;
    return `${tamil} (${english})`;
  };

  return (
    <LanguageContext.Provider value={{ langMode, setLangMode, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageSelectorButton: React.FC<{ variant?: "dark" | "light"; compact?: boolean }> = ({ variant = "dark", compact = false }) => {
  const { langMode, setLangMode } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const options: { id: LanguageMode; label: string; badge: string }[] = [
    { id: "bilingual", label: "தமிழ் + English", badge: "Primary Default" },
    { id: "english", label: "English Only", badge: "EN" },
    { id: "tamil", label: "தமிழ் மட்டும்", badge: "TA" }
  ];

  const currentOption = options.find((o) => o.id === langMode) || options[0];

  const bgClasses =
    variant === "dark"
      ? "bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400"
      : "bg-slate-100 border-slate-300 text-slate-800 hover:border-indigo-500";

  const dropdownBg =
    variant === "dark"
      ? "bg-slate-900 border-slate-700 text-slate-200"
      : "bg-white border-slate-200 text-slate-800 shadow-xl";

  return (
    <div className="relative inline-block text-left z-30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${bgClasses}`}
        title="Change Language Mode (மொழி தேர்வு)"
      >
        <Globe className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        {!compact && <span className="hidden sm:inline text-[10px] text-slate-400 uppercase font-black">🌐</span>}
        <span className="font-bold text-[11px]">{currentOption.label}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 mt-1.5 w-48 rounded-xl border shadow-2xl z-50 p-1.5 space-y-1 ${dropdownBg}`}
          >
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/40 mb-1">
              Select Language / மொழி
            </div>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setLangMode(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg font-bold transition text-left cursor-pointer ${
                  langMode === opt.id
                    ? "bg-amber-500/20 text-amber-400 font-black border border-amber-500/40"
                    : "hover:bg-slate-800/60"
                }`}
              >
                <span>{opt.label}</span>
                {langMode === opt.id && <span className="text-[10px] text-amber-400 font-extrabold">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
