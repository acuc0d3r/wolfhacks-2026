"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import VoiceInput from "@/components/VoiceInput";
import TranslateButton, { LANGUAGES } from "@/components/TranslateButton";

const QRCodeDisplay = dynamic(() => import("@/components/QRCodeDisplay"), { ssr: false });

interface TriageResult {
  urgency: "EMERGENCY" | "URGENT" | "MONITOR" | "SELF_CARE";
  headline: string;
  timeframe: string;
  recommendation: string;
  warningSignsToWatch: string[];
  mentalHealthNote: string | null;
  doctorSummary: string;
}

interface DisplayResult {
  headline: string;
  timeframe: string;
  recommendation: string;
  warningSignsToWatch: string[];
  mentalHealthNote: string | null;
}

const URGENCY_STYLE: Record<TriageResult["urgency"], { bg: string; border: string; badge: string; label: string }> = {
  EMERGENCY: { bg: "bg-red-950",    border: "border-red-500",   badge: "bg-red-500 text-white",         label: "🚨 Emergency" },
  URGENT:    { bg: "bg-orange-950", border: "border-orange-500", badge: "bg-orange-500 text-white",      label: "⚠️ Urgent" },
  MONITOR:   { bg: "bg-yellow-950", border: "border-yellow-500", badge: "bg-yellow-500 text-slate-900",  label: "👁 Monitor" },
  SELF_CARE: { bg: "bg-green-950",  border: "border-green-500",  badge: "bg-green-500 text-white",       label: "✅ Self-Care" },
};

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [display, setDisplay] = useState<DisplayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setDisplay(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
      setDisplay({
        headline: data.headline,
        timeframe: data.timeframe,
        recommendation: data.recommendation,
        warningSignsToWatch: data.warningSignsToWatch,
        mentalHealthNote: data.mentalHealthNote,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleTranslated(translations: string[]) {
    if (!result) return;
    const warningCount = result.warningSignsToWatch.length;
    setDisplay({
      headline: translations[0],
      timeframe: translations[1],
      recommendation: translations[2],
      warningSignsToWatch: translations.slice(3, 3 + warningCount),
      mentalHealthNote: result.mentalHealthNote ? translations[3 + warningCount] : null,
    });
  }

  function getTranslatableTexts(): string[] {
    if (!result) return [];
    return [
      result.headline,
      result.timeframe,
      result.recommendation,
      ...result.warningSignsToWatch,
      ...(result.mentalHealthNote ? [result.mentalHealthNote] : []),
    ];
  }

  function reset() {
    setResult(null);
    setDisplay(null);
    setSymptoms("");
    setError("");
  }

  const style = result ? URGENCY_STYLE[result.urgency] : null;

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Back
        </Link>
        <span className="font-bold">Symptom Triage</span>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
        {!result ? (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Describe your symptoms</h1>
              <p className="text-slate-400 text-sm">
                Tell us what you&apos;re experiencing — onset, severity, and any other symptoms.
                You can type or speak in any language.
              </p>
            </div>

            {/* Language selector */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                Response language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. I've had a fever of 38.9°C since yesterday morning, with a dry cough, fatigue, and some shortness of breath when I climb stairs..."
                rows={6}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
              <div className="flex justify-between items-center">
                <VoiceInput onTranscript={(t) => setSymptoms((prev) => prev ? `${prev} ${t}` : t)} />
                <span className="text-slate-500 text-xs">{symptoms.length} chars</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!symptoms.trim() || loading}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-4 rounded-xl transition-colors"
            >
              {loading ? "Analyzing symptoms…" : "Get Triage Advice"}
            </button>

            <p className="text-slate-500 text-xs text-center">
              This is AI-assisted triage guidance, not a medical diagnosis. In a life-threatening emergency, call 911.
            </p>
          </form>
        ) : (
          display && (
            <div className="flex flex-col gap-6">
              {/* Translate button */}
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">Your triage result</p>
                <TranslateButton
                  texts={getTranslatableTexts()}
                  onTranslated={handleTranslated}
                />
              </div>

              {/* Urgency card */}
              <div className={`rounded-2xl border p-6 ${style!.bg} ${style!.border}`}>
                <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full mb-4 ${style!.badge}`}>
                  {style!.label}
                </span>
                <h2 className="text-2xl font-bold mb-1">{display.headline}</h2>
                <p className="text-slate-300 font-medium mb-4">{display.timeframe}</p>
                <p className="text-slate-300 leading-relaxed">{display.recommendation}</p>
              </div>

              {/* Warning signs */}
              {display.warningSignsToWatch.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>⚠️</span> Watch for these warning signs
                  </h3>
                  <ul className="space-y-2">
                    {display.warningSignsToWatch.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-slate-500 mt-0.5">•</span> {sign}
                      </li>
                    ))}
                  </ul>
                  <p className="text-slate-500 text-xs mt-3">If any of these appear, escalate your care immediately.</p>
                </div>
              )}

              {/* Mental health note */}
              {display.mentalHealthNote && (
                <div className="bg-indigo-950 border border-indigo-700 rounded-2xl p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💙</span> A note on your wellbeing
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{display.mentalHealthNote}</p>
                  <Link
                    href="/mental-health"
                    className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                  >
                    Visit Mental Health Support →
                  </Link>
                </div>
              )}

              {/* QR Code */}
              <QRCodeDisplay doctorSummary={result.doctorSummary} />

              {/* AI transparency note */}
              <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4">
                <p className="text-slate-400 text-xs leading-relaxed">
                  <span className="text-slate-300 font-semibold">About this assessment: </span>
                  This guidance is generated by AI and is meant to help you decide what to do next — it is not a diagnosis.
                  AI systems can make mistakes and may not fully account for your personal medical history, cultural context,
                  or individual circumstances. If something feels wrong, trust your instincts and seek care.
                  No information you enter is stored or shared.
                </p>
              </div>

              <button
                onClick={reset}
                className="text-slate-400 hover:text-white text-sm text-center transition-colors py-2"
              >
                ← Check different symptoms
              </button>
            </div>
          )
        )}
      </div>
    </main>
  );
}
