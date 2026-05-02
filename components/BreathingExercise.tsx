"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "inhale" | "hold" | "exhale";

const PHASES: { phase: Phase; label: string; seconds: number }[] = [
  { phase: "inhale", label: "Breathe in",  seconds: 4 },
  { phase: "hold",   label: "Hold",        seconds: 4 },
  { phase: "exhale", label: "Breathe out", seconds: 6 },
];

const SCALE: Record<Phase, string> = {
  idle:   "scale-75 opacity-60",
  inhale: "scale-100 opacity-100",
  hold:   "scale-100 opacity-100",
  exhale: "scale-75 opacity-60",
};

const COLOR: Record<Phase, string> = {
  idle:   "bg-slate-600",
  inhale: "bg-cyan-500",
  hold:   "bg-indigo-500",
  exhale: "bg-teal-500",
};

export default function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = running ? PHASES[phaseIdx] : { phase: "idle" as Phase, label: "Box Breathing", seconds: 0 };

  useEffect(() => {
    if (!running) return;

    const { seconds } = PHASES[phaseIdx];
    setCountdown(seconds);

    let remaining = seconds;
    const tick = () => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        setPhaseIdx((i) => (i + 1) % PHASES.length);
      }
    };
    timerRef.current = setTimeout(tick, 1000);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, phaseIdx]);

  function toggle() {
    if (running) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setRunning(false);
      setPhaseIdx(0);
      setCountdown(0);
    } else {
      setRunning(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Animated circle */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <div
          className={`absolute w-40 h-40 rounded-full transition-all duration-1000 ease-in-out ${COLOR[current.phase]} ${SCALE[current.phase]}`}
        />
        <div className="relative z-10 text-center">
          <p className="text-white font-semibold text-sm">{current.label}</p>
          {running && countdown > 0 && (
            <p className="text-white/80 text-2xl font-bold">{countdown}</p>
          )}
        </div>
      </div>

      <button
        onClick={toggle}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
          running
            ? "bg-slate-600 hover:bg-slate-500 text-white"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
        }`}
      >
        {running ? "Stop" : "Start"}
      </button>

      <p className="text-slate-400 text-xs text-center max-w-xs">
        4-4-6 box breathing — inhale for 4 seconds, hold for 4, exhale for 6. Repeat for 2–5 minutes to calm your nervous system.
      </p>
    </div>
  );
}
