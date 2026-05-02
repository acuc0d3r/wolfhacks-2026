"use client";

import { useState } from "react";
import Link from "next/link";
import TranslateButton from "@/components/TranslateButton";

const DEFAULT_TEXTS = [
  // [0] hero description
  "Healthcare resources are strained. Get instant AI-powered triage — describe your symptoms by voice or text and receive a clear action plan. Your doctor gets a scan-ready QR summary so they can skip the intake questions.",
  // [1-3] feature titles
  "Voice or Text",
  "Instant Triage",
  "QR for Your Doctor",
  // [4-6] feature descriptions
  "Speak your symptoms or type them — no forms to fill out",
  "AI tells you exactly what to do and how urgently",
  "Show the QR at the clinic — no repeated intake questions",
  // [7] equity section title
  "Built for all of Brampton",
  // [8] equity paragraph
  "Brampton is one of Canada's most diverse cities. This tool is designed to serve everyone equally — newcomers, seniors, youth, and residents who may face barriers to traditional healthcare access. Describe your symptoms in any language and receive guidance back in that language.",
  // [9-11] equity card titles
  "No data stored",
  "Multilingual",
  "Free, always",
  // [12-14] equity card descriptions
  "Your symptoms are never saved or shared. Privacy is a right, not a feature.",
  "Type or speak in English, Hindi, Punjabi, French, Tagalog, or any other language.",
  "No insurance, no OHIP card, no registration required to use this tool.",
  // [15-16] button labels
  "Check My Symptoms",
  "Mental Health Support",
  // [17] h1 prefix
  "Brampton is facing",
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
          {texts[17]}{" "}
          <span className="text-cyan-400">Condition X</span>
        </h1>
        <p className="text-slate-300 text-lg max-w-xl mb-10 leading-relaxed">
          {texts[0]}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/triage" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-6 rounded-xl text-center transition-colors">
            {texts[15]}
          </Link>
          <Link href="/mental-health" className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl text-center transition-colors">
            {texts[16]}
          </Link>
        </div>
        <div className="flex gap-3 mt-2">
          <Link href="/outbreak" className="flex-1 border border-orange-500/40 hover:bg-orange-500/10 text-orange-400 text-sm font-medium py-2.5 px-4 rounded-xl text-center transition-colors">
            🦠 Outbreak Status
          </Link>
          <Link href="/clinics" className="flex-1 border border-slate-600 hover:bg-slate-800 text-slate-300 text-sm font-medium py-2.5 px-4 rounded-xl text-center transition-colors">
            🏥 Find a Clinic
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-slate-700 px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-2">🎙️</div>
            <h3 className="font-semibold mb-1">{texts[1]}</h3>
            <p className="text-slate-400 text-sm">{texts[4]}</p>
          </div>
          <div>
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">{texts[2]}</h3>
            <p className="text-slate-400 text-sm">{texts[5]}</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">{texts[3]}</h3>
            <p className="text-slate-400 text-sm">{texts[6]}</p>
          </div>
        </div>
      </section>

      {/* Equity section */}
      <section className="border-t border-slate-700 px-6 py-10 bg-slate-800/40">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤝</span>
            <h2 className="font-bold text-lg">{texts[7]}</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-5">{texts[8]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-cyan-400 mb-1">{texts[9]}</p>
              <p className="text-slate-400">{texts[12]}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-cyan-400 mb-1">{texts[10]}</p>
              <p className="text-slate-400">{texts[13]}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-cyan-400 mb-1">{texts[11]}</p>
              <p className="text-slate-400">{texts[14]}</p>
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
