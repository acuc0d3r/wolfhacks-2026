"use client";

import { useState } from "react";

export const LANGUAGES = [
  { code: "en",  label: "English" },
  { code: "hi",  label: "हिन्दी (Hindi)" },
  { code: "pa",  label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "fr",  label: "Français" },
  { code: "tl",  label: "Tagalog" },
  { code: "ur",  label: "اردو (Urdu)" },
  { code: "es",  label: "Español" },
  { code: "ta",  label: "தமிழ் (Tamil)" },
  { code: "pt",  label: "Português" },
  { code: "zh",  label: "中文 (Chinese)" },
];

interface Props {
  texts: string[];
  onTranslated: (translations: string[]) => void;
}

export default function TranslateButton({ texts, onTranslated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState("en");

  async function translate(langCode: string) {
    setOpen(false);
    setActive(langCode);
    if (langCode === "en") {
      onTranslated(texts);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, langCode }),
      });
      const data = await res.json();
      onTranslated(data.translations ?? texts);
    } catch {
      onTranslated(texts);
    } finally {
      setLoading(false);
    }
  }

  const activeLabel = LANGUAGES.find(l => l.code === active)?.label ?? "English";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm px-3 py-1.5 rounded-lg transition-colors"
      >
        <span>🌐</span>
        <span>{loading ? "Translating…" : activeLabel}</span>
        <span className="text-slate-400 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-slate-800 border border-slate-600 rounded-xl shadow-xl py-1 min-w-44 max-h-72 overflow-y-auto">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => translate(l.code)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-700 ${
                  active === l.code ? "text-cyan-400 font-medium" : "text-slate-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
