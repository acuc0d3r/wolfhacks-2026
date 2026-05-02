"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface Props {
  doctorSummary: string;
}

export default function QRCodeDisplay({ doctorSummary }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(doctorSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-6 text-slate-900 flex flex-col items-center gap-4">
      <h3 className="font-bold text-lg text-center">Show this to your doctor</h3>
      <p className="text-slate-500 text-sm text-center">Scan the QR code to see your full symptom summary — no intake form needed</p>

      <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
        <QRCodeSVG
          value={doctorSummary}
          size={180}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="M"
        />
      </div>

      {/* Fallback text summary */}
      <details className="w-full">
        <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 text-center select-none">
          View text summary
        </summary>
        <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">
          {doctorSummary}
        </p>
      </details>

      <button
        onClick={copyText}
        className="text-sm text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
      >
        {copied ? "Copied!" : "Copy text summary"}
      </button>
    </div>
  );
}
