"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onTranscript: (text: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

export default function VoiceInput({ onTranscript }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const recognitionRef = useRef<AnyRecognition>(null);
  const callbackRef = useRef(onTranscript);

  // Keep callback ref current without restarting the effect
  useEffect(() => { callbackRef.current = onTranscript; });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-CA";

    recognition.onresult = (e: { results: { [0]: { [0]: { transcript: string } } } }) => {
      callbackRef.current(e.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setSupported(true);
  }, []); // runs once on mount

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }, [listening]);

  // null = not yet checked (server / first paint) — render button to avoid layout shift
  if (supported === false) {
    return (
      <span className="text-slate-500 text-xs px-2">
        Voice not supported in this browser
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={supported === null}
      title={listening ? "Stop recording" : "Speak your symptoms"}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        listening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-slate-700 hover:bg-slate-600 text-slate-200"
      }`}
    >
      <span>{listening ? "🔴" : "🎙️"}</span>
      {listening ? "Listening…" : "Speak symptoms"}
    </button>
  );
}
