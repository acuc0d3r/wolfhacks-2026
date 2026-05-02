"use client";

import { useState } from "react";
import Link from "next/link";
import TranslateButton from "@/components/TranslateButton";

const DEFAULT_TEXTS = [
  // [0] hero description
  "Healthcare resources are strained. Get instant AI-powered triage — describe your symptoms by voice or text and receive a clear action plan. Your doctor gets a scan-ready QR summary so they can skip the intake questions.",
  // [1-3] feature descriptions
  "Speak your symptoms or type them — no forms to fill out",
  "AI tells you exactly what to do and how urgently",
  "Show the QR at the clinic — no repeated intake questions",
  // [4] equity paragraph
  "Brampton is one of Canada's most diverse cities. This tool is designed to serve everyone equally — newcomers, seniors, youth, and residents who may face barriers to traditional healthcare access. Describe your symptoms in any language and receive guidance back in that language.",
  // [5-7] equity card descriptions
  "Your symptoms are never saved or shared. Privacy is a right, not a feature.",
  "Type or speak in English, Hindi, Punjabi, French, Tagalog, or any other language.",
  "No insurance, no OHIP card, no registration required to use this tool.",
  // [8-9] button labels
  "Check My Symptoms",
  "Mental Health Support",
];

export default function Home() {
  const [texts, setTexts] = useState(DEFAULT_TEXTS);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500 pulse-ring" />
        <span className="font-bold text-lg tracking-tight">ConditionX Response</span>
        <div className="ml-auto">
          <TranslateButton texts={DEFAULT_TEXTS} onTranslated={setTexts} />
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-block bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
          Health Emergency Active
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 max-w-2xl">
          Brampton is facing{" "}
          <span className="text-cyan-400">Condition X</span>
        </h1>
        <p className="text-slate-300 text-lg max-w-xl mb-10 leading-relaxed">
          {texts[0]}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link
            href="/triage"
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-6 rounded-xl text-center transition-colors"
          >
            {texts[8]}
          </Link>
          <Link
            href="/mental-health"
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl text-center transition-colors"
          >
            {texts[9]}
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-slate-700 px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-2">🎙️</div>
            <h3 className="font-semibold mb-1">Voice or Text</h3>
            <p className="text-slate-400 text-sm">{texts[1]}</p>
          </div>
          <div>
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Instant Triage</h3>
            <p className="text-slate-400 text-sm">{texts[2]}</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">QR for Your Doctor</h3>
            <p className="text-slate-400 text-sm">{texts[3]}</p>
          </div>
        </div>
      </section>

      {/* Equity section */}
      <section className="border-t border-slate-700 px-6 py-10 bg-slate-800/40">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤝</span>
            <h2 className="font-bold text-lg">Built for all of Brampton</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-5">{texts[4]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-cyan-400 mb-1">No data stored</p>
              <p className="text-slate-400">{texts[5]}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-cyan-400 mb-1">Multilingual</p>
              <p className="text-slate-400">{texts[6]}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-cyan-400 mb-1">Free, always</p>
              <p className="text-slate-400">{texts[7]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brampton 2040 alignment */}
      <section className="border-t border-slate-700 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-semibold">Brampton 2040 Vision Alignment</p>
          <div className="flex flex-wrap gap-2">
            {["Health & Well-Being", "Social Inclusion & Equity", "Community-Based Living", "Technology & Resilience"].map((pillar) => (
              <span key={pillar} className="bg-slate-800 border border-slate-600 text-slate-300 text-xs px-3 py-1 rounded-full">
                {pillar}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center text-slate-500 text-xs py-4 border-t border-slate-800">
        WolfHacks 2026 · Operation Code Red · Not a substitute for professional medical advice
      </footer>
    </main>
  );
}
