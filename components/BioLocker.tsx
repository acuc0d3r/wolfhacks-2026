"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const KEY_STORAGE = "conditionx_rsa_keys";
const LOCK_AFTER_SECONDS = 120;
const QR_TTL_SECONDS = 15 * 60; // 15 minutes

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

type State = "loading" | "locked" | "generating" | "unlocking" | "unlocked";

export default function BioLocker({ doctorSummary }: Props) {
  const [uiState, setUiState] = useState<State>("loading");
  const [qrToken, setQrToken] = useState("");
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);
  const [decrypted, setDecrypted] = useState("");
  const [countdown, setCountdown] = useState(LOCK_AFTER_SECONDS);
  const [qrCountdown, setQrCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const keysRef = useRef<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function formatSeconds(s: number) {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  }

  // Load or generate key pair
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

        setUiState("locked");
      } catch (e) {
        console.error("BioLocker init failed:", e);
        setUiState("locked");
      }
    })();
  }, [doctorSummary]);

  // Auto-lock countdown for unlocked view
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

  // QR token countdown
  useEffect(() => {
    if (!qrExpiry) return;
    // initialize
    setQrCountdown(Math.max(0, Math.ceil((qrExpiry - Date.now()) / 1000)));
    if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    qrTimerRef.current = setInterval(() => {
      setQrCountdown((c) => {
        if (c <= 1) {
          // expire
          setQrToken("");
          setQrExpiry(null);
          if (qrTimerRef.current) clearInterval(qrTimerRef.current);
          qrTimerRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (qrTimerRef.current) clearInterval(qrTimerRef.current); };
  }, [qrExpiry]);

  async function unlock() {
    // Not used — unlocking requires a QR token in this flow.
    return;
  }

  async function generateQr() {
    if (!keysRef.current) return;
    setUiState("generating");
    try {
      const expiry = Date.now() + QR_TTL_SECONDS * 1000;
      const payload = JSON.stringify({ exp: expiry, summary: doctorSummary });
      const token = await encryptSummary(payload, keysRef.current.publicKey);
      setQrToken(token);
      setQrExpiry(expiry);
      setUiState("locked");
      setUnlockError(null);
    } catch (e) {
      console.error("QR generation failed:", e);
      setUiState("locked");
    }
  }

  async function unlockWithQr(token?: string) {
    const t = token ?? qrToken;
    if (!keysRef.current || !t) return;
    setUiState("unlocking");
    setUnlockError(null);
    try {
      const plain = await decryptSummary(t, keysRef.current.privateKey);
      let parsed: any = null;
      try { parsed = JSON.parse(plain); } catch {}
      if (parsed && parsed.exp) {
        if (Date.now() > parsed.exp) {
          setUiState("locked");
          setUnlockError("QR token has expired");
          return;
        }
        setDecrypted(parsed.summary ?? "");
      } else {
        setDecrypted(plain);
      }
      setUiState("unlocked");
    } catch (e) {
      console.error(e);
      setUiState("locked");
      setUnlockError("Failed to decrypt token");
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
            The Bio-Locker represents a physical locker for medical packages. Generate a time-limited QR code (15 minutes)
            to allow someone (or a locker terminal) to access your package.
          </p>

          <div className="w-full flex flex-col items-center gap-3">
            {!qrToken ? (
              <button
                onClick={generateQr}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors"
              >
                🔑 Generate Access QR (15m)
              </button>
            ) : (
              <>
                <div className="bg-slate-700 p-3 rounded-xl select-none">
                  <QRCodeSVG value={qrToken} size={140} bgColor="#334155" fgColor="#94a3b8" level="L" />
                </div>
                <p className="text-slate-500 text-xs">QR expires in {formatSeconds(qrCountdown)}</p>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(qrToken);
                      setQrCopied(true);
                      setTimeout(() => setQrCopied(false), 2000);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    {qrCopied ? "Copied!" : "Copy QR"}
                  </button>
                  <button
                    onClick={() => unlockWithQr(qrToken)}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 rounded-xl"
                  >
                    🔓 Use QR to Unlock (simulate)
                  </button>
                </div>
              </>
            )}
          </div>

          {unlockError && <p className="text-orange-400 text-sm mt-2">{unlockError}</p>}
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
