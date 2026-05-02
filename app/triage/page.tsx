"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import VoiceInput from "@/components/VoiceInput";
import TranslateButton, { LANGUAGES } from "@/components/TranslateButton";
import { getHealthProfile } from "@/components/OnboardingGate";

const BioLocker = dynamic(() => import("@/components/BioLocker"), { ssr: false });

interface TriageResult {
  urgency: "EMERGENCY" | "URGENT" | "MONITOR" | "SELF_CARE";
  headline: string;
  timeframe: string;
  recommendation: string;
  warningSignsToWatch: string[];
  otcRecommendations: string[];
  mentalHealthNote: string | null;
  doctorSummary: string;
}

interface DisplayResult {
  headline: string;
  timeframe: string;
  recommendation: string;
  warningSignsToWatch: string[];
  otcRecommendations: string[];
  mentalHealthNote: string | null;
}

const URGENCY_STYLE: Record<TriageResult["urgency"], { bg: string; border: string; badge: string; label: string }> = {
  EMERGENCY: { bg: "bg-red-950",    border: "border-red-500",   badge: "bg-red-500 text-white",        label: "🚨 Emergency" },
  URGENT:    { bg: "bg-orange-950", border: "border-orange-500", badge: "bg-orange-500 text-white",     label: "⚠️ Urgent" },
  MONITOR:   { bg: "bg-yellow-950", border: "border-yellow-500", badge: "bg-yellow-500 text-slate-900", label: "👁 Monitor" },
  SELF_CARE: { bg: "bg-green-950",  border: "border-green-500",  badge: "bg-green-500 text-white",      label: "✅ Self-Care" },
};

const CLINIC_LINK: Record<string, string> = {
  EMERGENCY: "/clinics?filter=emergency",
  URGENT:    "/clinics?filter=urgent",
  MONITOR:   "/clinics?filter=walkin",
  SELF_CARE: "/clinics",
};

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [display, setDisplay] = useState<DisplayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reported, setReported] = useState(false);
  const [profileSummary, setProfileSummary] = useState("");

  useEffect(() => {
    const p = getHealthProfile();
    if (!p) return;
    const parts = [
      ...(p.conditions.length ? [`Conditions: ${[...p.conditions, p.conditionsOther].filter(Boolean).join(", ")}`] : []),
      ...(p.medications ? [`Meds: ${p.medications}`] : []),
      ...(p.allergies ? [`Allergies: ${p.allergies}`] : []),
    ];
    if (parts.length) setProfileSummary(parts.join(" · "));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setDisplay(null);
    setReported(false);

    const healthProfile = getHealthProfile();

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, language, healthProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
      setDisplay({
        headline: data.headline,
        timeframe: data.timeframe,
        recommendation: data.recommendation,
        warningSignsToWatch: data.warningSignsToWatch,
        otcRecommendations: data.otcRecommendations ?? [],
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
    const wc = result.warningSignsToWatch.length;
    const oc = (result.otcRecommendations ?? []).length;
    setDisplay({
      headline: translations[0],
      timeframe: translations[1],
      recommendation: translations[2],
      warningSignsToWatch: translations.slice(3, 3 + wc),
      otcRecommendations: translations.slice(3 + wc, 3 + wc + oc),
      mentalHealthNote: result.mentalHealthNote ? translations[3 + wc + oc] : null,
    });
  }

  function getTranslatableTexts(): string[] {
    if (!result) return [];
    return [
      result.headline,
      result.timeframe,
      result.recommendation,
      ...result.warningSignsToWatch,
      ...(result.otcRecommendations ?? []),
      ...(result.mentalHealthNote ? [result.mentalHealthNote] : []),
    ];
  }

  function reset() {
    setResult(null);
    setDisplay(null);
    setSymptoms("");
    setError("");
    setReported(false);
  }

  const style = result ? URGENCY_STYLE[result.urgency] : null;

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Back</Link>
        <span className="font-bold">Symptom Triage</span>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
        {!result ? (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Describe your symptoms</h1>
              <p className="text-slate-400 text-sm">Tell us what you&apos;re experiencing — onset, severity, and any other symptoms. You can type or speak in any language.</p>
            </div>

            {/* Health profile banner */}
            {profileSummary && (
              <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 shrink-0">👤</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs leading-relaxed">{profileSummary}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Your health profile will be used to personalise this triage.</p>
                </div>
                <Link href="/" className="text-slate-500 hover:text-slate-300 text-xs shrink-0 transition-colors">Edit</Link>
              </div>
            )}

            {/* Language selector */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Response language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
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
              AI-assisted triage guidance only — not a medical diagnosis. In a life-threatening emergency, call 911.
            </p>
          </form>
        ) : (
          display && (
            <div className="flex flex-col gap-6">
              {/* Translate */}
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">Your triage result</p>
                <TranslateButton texts={getTranslatableTexts()} onTranslated={handleTranslated} />
              </div>

              {/* Urgency card */}
              <div className={`rounded-2xl border p-6 ${style!.bg} ${style!.border}`}>
                <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full mb-4 ${style!.badge}`}>{style!.label}</span>
                <h2 className="text-2xl font-bold mb-1">{display.headline}</h2>
                <p className="text-slate-300 font-medium mb-4">{display.timeframe}</p>
                <p className="text-slate-300 leading-relaxed">{display.recommendation}</p>
              </div>

              {/* Warning signs */}
              {display.warningSignsToWatch.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><span>⚠️</span> Watch for these warning signs</h3>
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

              {/* OTC recommendations */}
              {display.otcRecommendations.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><span>💊</span> Over-the-counter remedies</h3>
                  <ul className="space-y-2">
                    {display.otcRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-cyan-400 mt-0.5 shrink-0">•</span> {rec}
                      </li>
                    ))}
                  </ul>
                  <p className="text-slate-500 text-xs mt-3">Available at most pharmacies. Read labels carefully and check with a pharmacist if unsure.</p>
                </div>
              )}

              {/* Mental health note */}
              {display.mentalHealthNote && (
                <div className="bg-indigo-950 border border-indigo-700 rounded-2xl p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><span>💙</span> A note on your wellbeing</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{display.mentalHealthNote}</p>
                  <Link href="/mental-health" className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                    Visit Mental Health Support →
                  </Link>
                </div>
              )}

              {/* Find a clinic */}
              <Link
                href={CLINIC_LINK[result.urgency]}
                className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl p-5 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-sm">Find a clinic near you</p>
                  <p className="text-slate-400 text-xs mt-0.5">Brampton care sites matched to your urgency level with live wait times</p>
                </div>
                <span className="text-slate-400 group-hover:text-white text-lg ml-4">→</span>
              </Link>

              {/* Bio-Locker QR */}
              <BioLocker doctorSummary={result.doctorSummary} />

              {/* Anonymous report */}
              <div className="bg-slate-800 border border-slate-600 rounded-2xl p-5">
                {!reported ? (
                  <>
                    <h3 className="font-semibold text-sm mb-1">Help track Condition X in Brampton</h3>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                      Anonymously share your urgency level with Peel Public Health. No personal information included — only your triage outcome and the date.
                    </p>
                    <button
                      onClick={() => setReported(true)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      Share anonymously
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-sm text-green-400">Report submitted</p>
                      <p className="text-slate-400 text-xs">Your anonymized data helps Brampton track and respond to Condition X.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI transparency */}
              <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4">
                <p className="text-slate-400 text-xs leading-relaxed">
                  <span className="text-slate-300 font-semibold">About this assessment: </span>
                  AI-generated guidance to help you decide what to do next — not a diagnosis. AI can make mistakes and may not account for your full medical history. If something feels wrong, trust your instincts and seek care. No information you enter is stored or shared.
                </p>
              </div>

              <button onClick={reset} className="text-slate-400 hover:text-white text-sm text-center transition-colors py-2">
                ← Check different symptoms
              </button>
            </div>
          )
        )}
      </div>
    </main>
  );
}
