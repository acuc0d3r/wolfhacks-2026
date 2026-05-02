"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BreathingExercise from "@/components/BreathingExercise";
import MoodTracker from "@/components/MoodTracker";
import TranslateButton from "@/components/TranslateButton";
import BioLocker from "@/components/BioLocker";

const CRISIS_RESOURCES = [
  {
    name: "Distress Centre Peel",
    desc: "24/7 crisis support for Brampton & Peel Region",
    phone: "905-278-7208",
    href: "tel:9052787208",
  },
  {
    name: "Crisis Services Canada",
    desc: "National 24/7 crisis line",
    phone: "1-833-456-4566",
    href: "tel:18334564566",
  },
  {
    name: "Kids Help Phone",
    desc: "Youth under 20 — call, text, or chat 24/7",
    phone: "1-800-668-6868",
    href: "tel:18006686868",
  },
  {
    name: "Crisis Text Line",
    desc: "Text HOME to 741741 — free, 24/7",
    phone: "741741",
    href: "sms:741741?body=HOME",
  },
];

const COMMUNITY_RESOURCES = [
  {
    name: "211 Ontario",
    desc: "Free, multilingual helpline — connects you to local health and social services in your language",
    phone: "2-1-1",
    href: "tel:211",
    tag: "Multilingual",
  },
  {
    name: "Punjabi Community Health Services",
    desc: "Culturally sensitive mental health support for Brampton's South Asian community",
    phone: "905-790-0808",
    href: "tel:9057900808",
    tag: "South Asian",
  },
  {
    name: "Black Youth Helpline",
    desc: "Mental health support for Black youth and families",
    phone: "1-833-294-8650",
    href: "tel:18332948650",
    tag: "Black Community",
  },
  {
    name: "Assaulted Women's Helpline",
    desc: "24/7 crisis support available in 154 languages",
    phone: "1-866-863-0511",
    href: "tel:18668630511",
    tag: "Multilingual",
  },
  {
    name: "Canadian Centre for Victims of Torture",
    desc: "Mental health support for survivors and newcomers experiencing trauma",
    phone: "416-363-1066",
    href: "tel:4163631066",
    tag: "Newcomers",
  },
];

const TAG_COLORS: Record<string, string> = {
  "Multilingual":    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "South Asian":     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Black Community": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Newcomers":       "bg-green-500/10 text-green-400 border-green-500/20",
};

const DEFAULT_TIPS = [
  "Stick to a daily routine — wake up and sleep at the same time",
  "Move your body for 10 minutes a day, even just stretching or walking indoors",
  "Stay connected: one video call or message to a friend each day",
  "Limit news to twice daily — constant updates increase anxiety",
  "Do one small task each morning to build a sense of accomplishment",
  "Go outside briefly if safe and permitted — natural light regulates mood",
];

const PORTABLE_CLINIC = {
  name: "Algoma University — Portable Clinic (Demo)",
  address: "1 University Ave W, Sault Ste. Marie, ON (fictional)",
  hours: "Mon–Fri 10:00–16:00",
  phone: "705-555-0199",
  note: "This is a fictional demo clinic for app demonstration purposes.",
};

const MOOD_STRATEGIES: Record<number, string[]> = {
  1: [
    "If you're in immediate danger call emergency services right away.",
    "Contact a 24/7 crisis line (e.g., Crisis Services Canada: 1-833-456-4566).",
    "Grounding: name five things you can see, four you can touch, three you can hear.",
    "If possible, reach out to a trusted person and let them know you need support.",
  ],
  2: [
    "Try a short breathing exercise (see Guided Breathing above).",
    "Send a quick message to a friend or family member — you don't need to explain everything.",
    "Break tasks into very small steps and do one immediately (make tea, open a window).",
  ],
  3: [
    "Keep a simple routine and do one thing that usually helps you feel steady.",
    "Short movement: 10 minutes of walking or stretching can improve mood.",
    "Plan a small social contact (a quick call or message to someone you trust).",
  ],
  4: [
    "Continue routines that work and try a gratitude practice (one thing you're glad for).",
    "Offer support to someone else — helping can boost your mood.",
    "Keep up with light exercise and sleep hygiene to sustain gains.",
  ],
  5: [
    "Maintain healthy routines and check in with supports regularly.",
    "Reflect on what helps you stay well and try to schedule it into your week.",
    "Consider volunteering or peer-support roles if you're able — it reinforces wellbeing.",
  ],
};

export default function MentalHealthPage() {
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [todayMood, setTodayMood] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("conditionx_mood");
      if (!raw) return;
      const entries = JSON.parse(raw);
      const todayKey = new Date().toISOString().slice(0, 10);
      const todayEntry = entries.find((e: any) => e.date === todayKey);
      if (todayEntry) setTodayMood(todayEntry.value);
    } catch {
      // ignore corrupt storage
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Back
        </Link>
        <span className="font-bold">Mental Health Support</span>
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-10">
        {/* Hero */}
        <div>
          <h1 className="text-2xl font-bold mb-2">You&apos;re not alone</h1>
          <p className="text-slate-400 leading-relaxed">
            Isolation during a health emergency is hard — especially when your usual community
            and cultural support may be out of reach. Feeling anxious, lonely, or overwhelmed
            is a completely normal response. Here are tools and resources for everyone in Brampton.
          </p>
        </div>

        {/* Mood tracker */}
        <MoodTracker />

        {/* Breathing exercise */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-1">Guided Breathing</h2>
          <p className="text-slate-400 text-sm mb-4">
            Box breathing activates your parasympathetic nervous system, reducing anxiety within minutes.
          </p>
          <BreathingExercise />
        </div>

        {/* Portable clinic demo + Bio-Locker */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Portable Clinic — Algoma University (Demo)</h2>
            <span className="text-xs text-slate-400">Demo</span>
          </div>
          <p className="text-slate-400 text-sm mb-2">{PORTABLE_CLINIC.address} • {PORTABLE_CLINIC.hours}</p>
          <p className="text-slate-400 text-sm mb-4">{PORTABLE_CLINIC.note}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-300 font-medium mb-1">Services</p>
              <ul className="text-slate-400 text-sm list-disc ml-4">
                <li>Walk-in triage and basic clinical support</li>
                <li>Mental health check-ins and referrals</li>
                <li>Bio-Locker demo for secure summaries</li>
              </ul>
            </div>

            <div>
              <p className="text-slate-300 font-medium mb-1">Contact</p>
              <a href={`tel:${PORTABLE_CLINIC.phone.replace(/[^0-9]/g, "")}`} className="text-cyan-400 font-mono">{PORTABLE_CLINIC.phone}</a>

              <div className="mt-4">
                <BioLocker doctorSummary={
                  "Algoma University Portable Clinic (Demo) — Sample summary:\nServices: walk-in triage, mental health check-in. This is a demo; no real personal data."
                } />
              </div>
            </div>
          </div>
        </div>

        {/* Isolation tips */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Staying well during isolation</h2>
            <TranslateButton
              texts={DEFAULT_TIPS}
              onTranslated={setTips}
            />
          </div>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-cyan-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended strategies */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-1">Recommended strategies</h2>
          <p className="text-slate-400 text-sm mb-3">Practical strategies based on your check-in today.</p>
          {todayMood ? (
            <div>
              <p className="text-slate-200 font-medium mb-2">Based on your check-in: {['','Really struggling','Not great','Okay','Pretty good','Doing well'][todayMood]}</p>
              <ul className="space-y-2">
                {MOOD_STRATEGIES[todayMood].map((s, idx) => (
                  <li key={idx} className="text-slate-300 text-sm flex gap-3">
                    <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No check-in found for today — try the mood tracker above to get tailored suggestions.</p>
          )}
        </div>

        {/* Crisis resources */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-1">Crisis Lines</h2>
          <p className="text-slate-400 text-sm mb-4">
            If you&apos;re in crisis or need to talk to someone, these lines are free and available 24/7.
          </p>
          <div className="flex flex-col gap-3">
            {CRISIS_RESOURCES.map((r) => (
              <a
                key={r.name}
                href={r.href}
                className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-3 transition-colors group"
              >
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-slate-400 text-xs">{r.desc}</p>
                </div>
                <span className="text-cyan-400 font-mono text-sm group-hover:text-cyan-300 transition-colors shrink-0 ml-3">
                  {r.phone}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Community-specific resources */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-1">Community &amp; Equity Resources</h2>
          <p className="text-slate-400 text-sm mb-4">
            Brampton&apos;s communities deserve care that understands their cultural context.
            These services offer culturally informed support, multilingual access, and help for newcomers.
          </p>
          <div className="flex flex-col gap-3">
            {COMMUNITY_RESOURCES.map((r) => (
              <a
                key={r.name}
                href={r.href}
                className="flex items-start justify-between bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-3 transition-colors group gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-sm">{r.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TAG_COLORS[r.tag]}`}>
                      {r.tag}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{r.desc}</p>
                </div>
                <span className="text-cyan-400 font-mono text-sm group-hover:text-cyan-300 transition-colors shrink-0 mt-0.5">
                  {r.phone}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Terms & Privacy (Demo) */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-2">Terms & Privacy (Demo)</h2>
          <p className="text-slate-400 text-sm mb-2">
            This demo app stores sensitive summaries locally and encrypts them on-device (RSA-2048 + AES-256).
            Private keys are kept on your device and are not transmitted to our servers. In this demo, the Bio-Locker
            ensures that encrypted summaries cannot be decrypted by the app owners or third parties unless you
            explicitly unlock and share them.
          </p>
          <p className="text-slate-400 text-sm mb-2">
            Some on-device features in this demo are described as using local AI models. That means processing
            happens on your device rather than being sent to a remote server. For production deployments,
            independently verify encryption, storage, and model privacy guarantees before relying on them.
          </p>
          <p className="text-slate-400 text-sm">This app is not a substitute for professional medical care. If you are in danger, call emergency services.</p>
        </div>

        {/* Equity note */}
        <div className="bg-slate-800 border border-slate-600 rounded-2xl p-5">
          <p className="text-slate-400 text-xs leading-relaxed">
            <span className="text-slate-300 font-semibold">Health equity matters: </span>
            During the Condition X outbreak, Brampton residents from marginalized communities —
            including newcomers, racialized groups, and low-income households — face higher barriers
            to care. If you or someone you know is struggling to access healthcare, 211 Ontario can
            connect you to local support services in your language, free of charge.
          </p>
        </div>

        {/* Link back to triage */}
        <div className="bg-indigo-950 border border-indigo-700 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold">Experiencing physical symptoms?</p>
            <p className="text-slate-400 text-sm">Get an AI triage assessment in under a minute.</p>
          </div>
          <Link
            href="/triage"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors shrink-0 ml-4"
          >
            Check Symptoms
          </Link>
        </div>
      </div>
    </main>
  );
}
