"use client";

import { useEffect, useState } from "react";

export interface HealthProfile {
  conditions: string[];
  conditionsOther: string;
  medications: string;
  allergies: string;
}

const COMMON_CONDITIONS = [
  "Diabetes",
  "Asthma",
  "High blood pressure",
  "Heart disease",
  "Kidney disease",
  "Cancer (active treatment)",
  "Immunocompromised",
  "Pregnant",
];

const STORAGE_KEY = "conditionx_health_profile";

export function getHealthProfile(): HealthProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveHealthProfile(p: HealthProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export default function OnboardingGate() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionsOther, setConditionsOther] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  useEffect(() => {
    if (!getHealthProfile()) setShow(true);
  }, []);

  function toggleCondition(c: string) {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function finish() {
    saveHealthProfile({ conditions, conditionsOther, medications, allergies });
    setShow(false);
  }

  function skip() {
    saveHealthProfile({ conditions: [], conditionsOther: "", medications: "", allergies: "" });
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Progress */}
        <div className="flex gap-1 p-5 pb-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? "bg-cyan-500" : "bg-slate-700"}`} />
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          {step === 0 && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1">Welcome to ConditionX Response</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  To give you the most accurate triage advice, we&apos;d like to know a bit about your health.
                  This stays on your device — it&apos;s never sent anywhere.
                </p>
              </div>
              <div>
                <p className="text-slate-300 text-sm font-medium mb-3">Do you have any of these conditions?</p>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCondition(c)}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                        conditions.includes(c)
                          ? "bg-cyan-500/10 border-cyan-500 text-cyan-300"
                          : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {conditions.includes(c) ? "✓ " : ""}{c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={conditionsOther}
                  onChange={(e) => setConditionsOther(e.target.value)}
                  placeholder="Other conditions (optional)"
                  className="mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={skip} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Skip setup</button>
                <button onClick={() => setStep(1)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1">Current Medications</h2>
                <p className="text-slate-400 text-sm">List any medications you currently take regularly.</p>
              </div>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Metformin 500mg, Ventolin inhaler, Lisinopril 10mg…"
                rows={4}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back</button>
                <button onClick={() => setStep(2)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1">Allergies</h2>
                <p className="text-slate-400 text-sm">List any known allergies, especially to medications.</p>
              </div>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, sulfa drugs, latex, peanuts…"
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back</button>
                <button onClick={finish} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Save & Continue →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
