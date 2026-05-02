"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const KEY_STORAGE = "conditionx_rsa_keys";
const LOCK_AFTER_SECONDS = 120;

// ── Crypto helpers ──────────────────────────────────────────────────────────

async function generateKeyPair() {
  return crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  );
}

async function exportKeys(pair: CryptoKeyPair) {
  return {
    pub:  JSON.stringify(await crypto.subtle.exportKey("jwk", pair.publicKey)),
    priv: JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey)),
  };
}

async function importKeys(stored: { pub: string; priv: string }) {
  const pub  = await crypto.subtle.importKey("jwk", JSON.parse(stored.pub),  { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const priv = await crypto.subtle.importKey("jwk", JSON.parse(stored.priv), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
  return { publicKey: pub, privateKey: priv };
}

async function encryptSummary(text: string, publicKey: CryptoKey): Promise<string> {
  // Hybrid: AES-GCM for data, RSA-OAEP wraps the AES key
  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, new TextEncoder().encode(text));
  const rawAES  = await crypto.subtle.exportKey("raw", aesKey);
  const wrapped = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawAES);

  // Pack: [4B key-len][wrapped key][12B IV][cipher]
  const out = new Uint8Array(4 + wrapped.byteLength + 12 + encData.byteLength);
  new DataView(out.buffer).setUint32(0, wrapped.byteLength);
  out.set(new Uint8Array(wrapped), 4);
  out.set(iv, 4 + wrapped.byteLength);
  out.set(new Uint8Array(encData), 4 + wrapped.byteLength + 12);
  return btoa(String.fromCharCode(...out));
}

async function decryptSummary(b64: string, privateKey: CryptoKey): Promise<string> {
  const bytes  = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const keyLen = new DataView(bytes.buffer).getUint32(0);
  const wrapped = bytes.slice(4, 4 + keyLen);
  const iv      = bytes.slice(4 + keyLen, 4 + keyLen + 12);
  const cipher  = bytes.slice(4 + keyLen + 12);

  const rawAES = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, wrapped);
  const aesKey = await crypto.subtle.importKey("raw", rawAES, "AES-GCM", false, ["decrypt"]);
  const plain  = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, cipher);
  return new TextDecoder().decode(plain);
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props { doctorSummary: string }

type State = "loading" | "locked" | "unlocking" | "unlocked";

export default function BioLocker({ doctorSummary }: Props) {
  const [uiState, setUiState] = useState<State>("loading");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [countdown, setCountdown] = useState(LOCK_AFTER_SECONDS);
  const [copied, setCopied] = useState(false);
  const keysRef = useRef<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load or generate key pair, then encrypt the summary
  useEffect(() => {
    (async () => {
      try {
        let stored = null;
        try { stored = JSON.parse(localStorage.getItem(KEY_STORAGE) ?? "null"); } catch {}

        const keys = stored ? await importKeys(stored) : await generateKeyPair();
        keysRef.current = keys;

        if (!stored) {
          const exported = await exportKeys(keys as CryptoKeyPair);
          localStorage.setItem(KEY_STORAGE, JSON.stringify(exported));
        }

        const enc = await encryptSummary(doctorSummary, keys.publicKey);
        setEncrypted(enc);
        setUiState("locked");
      } catch (e) {
        console.error("BioLocker init failed:", e);
        setUiState("locked");
      }
    })();
  }, [doctorSummary]);

  // Auto-lock countdown
  useEffect(() => {
    if (uiState !== "unlocked") return;
    setCountdown(LOCK_AFTER_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { lock(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  async function unlock() {
    if (!keysRef.current || !encrypted) return;
    setUiState("unlocking");
    try {
      const plain = await decryptSummary(encrypted, keysRef.current.privateKey);
      setDecrypted(plain);
      setUiState("unlocked");
    } catch {
      setUiState("locked");
    }
  }

  function lock() {
    if (timerRef.current) clearInterval(timerRef.current);
    setDecrypted("");
    setUiState("locked");
  }

  async function copyText() {
    await navigator.clipboard.writeText(decrypted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (uiState === "loading") {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 flex items-center justify-center gap-3 text-slate-400 text-sm">
        <span className="animate-spin">⚙️</span> Generating encryption keys…
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 self-start">
        <span className="text-lg">{uiState === "unlocked" ? "🔓" : "🔒"}</span>
        <h3 className="font-bold text-lg">Bio-Locker</h3>
        <span className="text-xs text-slate-400 ml-1">RSA-2048 + AES-256</span>
      </div>

      {uiState === "locked" && (
        <>
          <p className="text-slate-400 text-sm text-center">
            Your medical summary is encrypted with your personal RSA key.
            Only you can unlock it to show your doctor.
          </p>

          {/* Encrypted QR preview */}
          {encrypted && (
            <div className="bg-slate-700 p-3 rounded-xl opacity-60 select-none" title="Encrypted — unlock to reveal">
              <QRCodeSVG value={encrypted.slice(0, 800)} size={140} bgColor="#334155" fgColor="#94a3b8" level="L" />
            </div>
          )}
          <p className="text-slate-500 text-xs text-center">⬆ Encrypted cipher — unreadable until unlocked</p>

          <button
            onClick={unlock}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors"
          >
            🔓 Unlock for Doctor
          </button>
        </>
      )}

      {uiState === "unlocking" && (
        <div className="flex flex-col items-center gap-3 py-4 text-slate-400 text-sm">
          <span className="animate-spin text-2xl">🔑</span>
          Decrypting with your private key…
        </div>
      )}

      {uiState === "unlocked" && (
        <>
          <p className="text-slate-300 text-sm text-center font-medium">
            Show this to your doctor — auto-locks in{" "}
            <span className={`font-bold ${countdown <= 30 ? "text-orange-400" : "text-cyan-400"}`}>{countdown}s</span>
          </p>

          <div className="bg-white p-3 rounded-xl border-2 border-cyan-400">
            <QRCodeSVG value={decrypted} size={180} bgColor="#ffffff" fgColor="#0f172a" level="M" />
          </div>

          <details className="w-full">
            <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-300 text-center select-none">
              View text summary
            </summary>
            <p className="mt-3 text-sm text-slate-300 bg-slate-700 rounded-lg p-3 leading-relaxed">{decrypted}</p>
          </details>

          <div className="flex gap-3 w-full">
            <button onClick={copyText} className="flex-1 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors py-2">
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button onClick={lock} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium py-2 rounded-xl transition-colors">
              🔒 Lock now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
