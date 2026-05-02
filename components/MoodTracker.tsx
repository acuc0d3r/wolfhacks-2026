"use client";

import { useEffect, useState } from "react";

const MOODS = [
  { value: 1, emoji: "😰", label: "Really struggling" },
  { value: 2, emoji: "😟", label: "Not great" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Pretty good" },
  { value: 5, emoji: "😊", label: "Doing well" },
];

interface MoodEntry { date: string; value: number; label: string }

export default function MoodTracker() {
  const [today, setToday] = useState<number | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [saved, setSaved] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("conditionx_mood");
      if (!raw) return;
      const entries: MoodEntry[] = JSON.parse(raw);
      setHistory(entries);
      const todayEntry = entries.find((e) => e.date === todayKey);
      if (todayEntry) setToday(todayEntry.value);
    } catch {
      // ignore corrupt storage
    }
  }, [todayKey]);

  function select(mood: typeof MOODS[0]) {
    setToday(mood.value);
    const newEntry: MoodEntry = { date: todayKey, value: mood.value, label: mood.label };
    const updated = [newEntry, ...history.filter((e) => e.date !== todayKey)].slice(0, 7);
    setHistory(updated);
    localStorage.setItem("conditionx_mood", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-1">How are you feeling today?</h3>
      <p className="text-slate-400 text-sm mb-4">Isolation can be tough. Check in with yourself daily.</p>

      <div className="flex gap-2 justify-between mb-4">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => select(mood)}
            title={mood.label}
            className={`flex-1 flex flex-col items-center py-3 rounded-xl text-2xl transition-colors ${
              today === mood.value
                ? "bg-cyan-500/20 ring-2 ring-cyan-400"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {mood.emoji}
            <span className="text-xs text-slate-400 mt-1 hidden sm:block">{mood.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {saved && (
        <p className="text-cyan-400 text-sm text-center mb-3">Saved ✓</p>
      )}

      {/* Last 7 days mini history */}
      {history.length > 1 && (
        <div className="mt-4">
          <p className="text-slate-500 text-xs mb-2">Last 7 days</p>
          <div className="flex gap-2">
            {history.slice(0, 7).reverse().map((e) => {
              const mood = MOODS.find((m) => m.value === e.value);
              return (
                <div key={e.date} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{mood?.emoji}</span>
                  <span className="text-xs text-slate-500">{e.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
