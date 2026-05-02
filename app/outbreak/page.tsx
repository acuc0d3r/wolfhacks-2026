import Link from "next/link";

const ALERT_LEVEL = "HIGH" as const;

const ALERT_STYLE = {
  CRITICAL: { bg: "bg-red-950",    border: "border-red-500",   badge: "bg-red-600",    text: "CRITICAL", desc: "Activate emergency protocols. ER intake diverted to overflow sites." },
  HIGH:     { bg: "bg-orange-950", border: "border-orange-500", badge: "bg-orange-500", text: "HIGH",     desc: "Healthcare system under severe pressure. Avoid ER unless life-threatening." },
  MODERATE: { bg: "bg-yellow-950", border: "border-yellow-500", badge: "bg-yellow-500 text-slate-900", text: "MODERATE", desc: "Elevated community transmission. Use triage tool before visiting a clinic." },
  LOW:      { bg: "bg-green-950",  border: "border-green-500",  badge: "bg-green-600",  text: "LOW",      desc: "Conditions stable. Routine healthcare access available." },
};

const NEIGHBOURHOODS = [
  { name: "Downtown Brampton",  cases: 312, trend: "up",   severity: 88 },
  { name: "Bramalea",           cases: 278, trend: "up",   severity: 79 },
  { name: "Springdale",         cases: 241, trend: "flat", severity: 68 },
  { name: "Heart Lake",         cases: 198, trend: "up",   severity: 56 },
  { name: "Sandalwood",         cases: 187, trend: "flat", severity: 53 },
  { name: "Castlemore",         cases: 163, trend: "down", severity: 46 },
  { name: "Northwest Brampton", cases: 145, trend: "down", severity: 41 },
  { name: "Chinguacousy",       cases: 134, trend: "flat", severity: 38 },
  { name: "Gore",               cases:  98, trend: "down", severity: 28 },
  { name: "Brampton West",      cases:  76, trend: "down", severity: 22 },
];

const TREND_DAYS = [
  { day: "Apr 26", cases: 820 },
  { day: "Apr 27", cases: 947 },
  { day: "Apr 28", cases: 1103 },
  { day: "Apr 29", cases: 1286 },
  { day: "Apr 30", cases: 1441 },
  { day: "May 1",  cases: 1634 },
  { day: "May 2",  cases: 1832 },
];

const ADAPTATIONS = [
  {
    level: "LOW",
    color: "border-green-600 bg-green-950/40",
    badge: "bg-green-600 text-white",
    rules: [
      "Standard triage — all 4 urgency levels active",
      "Walk-in clinics recommended for URGENT cases",
      "Normal warning sign thresholds applied",
    ],
  },
  {
    level: "MODERATE",
    color: "border-yellow-600 bg-yellow-950/40",
    badge: "bg-yellow-500 text-slate-900",
    rules: [
      "Triage adds Condition X-specific warning signs to all results",
      "MONITOR cases advised to call ahead before visiting a clinic",
      "Mental health resources promoted automatically",
    ],
  },
  {
    level: "HIGH",
    color: "border-orange-500 bg-orange-950/40",
    badge: "bg-orange-500 text-white",
    rules: [
      "URGENT cases redirected to Peel Memorial Urgent Care first",
      "Clinic finder deprioritises high-capacity ER sites",
      "Anonymous symptom reporting auto-prompted after every triage",
    ],
  },
  {
    level: "CRITICAL",
    color: "border-red-500 bg-red-950/40",
    badge: "bg-red-600 text-white",
    rules: [
      "Only EMERGENCY cases directed to ER — all others to overflow clinics",
      "Triage result includes overflow site addresses and hotline numbers",
      "All symptom reports forwarded to Peel Public Health in real time",
    ],
  },
];

const alert = ALERT_STYLE[ALERT_LEVEL];
const maxCases = Math.max(...TREND_DAYS.map((d) => d.cases));

export default function OutbreakPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Back</Link>
        <span className="font-bold">Condition X Outbreak Status</span>
        <span className="ml-auto text-xs text-slate-400 font-mono">Brampton · Live</span>
      </header>

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Alert level */}
        <div className={`rounded-2xl border p-6 ${alert.bg} ${alert.border}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full text-white ${alert.badge}`}>
              ALERT LEVEL: {alert.text}
            </span>
            <span className="text-xs text-slate-400 font-mono">Updated May 2, 2030 · 08:42 AM</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{alert.desc}</p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Cases",    value: "1,832",  sub: "↑ 198 today",   color: "text-red-400" },
            { label: "ER Capacity",     value: "94%",    sub: "Near critical",  color: "text-orange-400" },
            { label: "Testing Sites",   value: "12",     sub: "7 near capacity", color: "text-yellow-400" },
            { label: "ER Diversions",   value: "847",    sub: "via this app",   color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-300 text-xs font-medium mt-0.5">{s.label}</p>
              <p className="text-slate-500 text-xs">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* 7-day trend */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-5">7-Day Case Trend</h2>
          <div className="flex items-end gap-2 h-32">
            {TREND_DAYS.map((d) => {
              const heightPct = Math.round((d.cases / maxCases) * 100);
              const isToday = d.day === "May 2";
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-slate-400 text-xs">{d.cases.toLocaleString()}</span>
                  <div
                    className={`w-full rounded-t-md transition-all ${isToday ? "bg-orange-500" : "bg-slate-600"}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-slate-500 text-xs whitespace-nowrap">{d.day.split(" ")[1]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-slate-500 text-xs mt-3">Cases confirmed via Peel Public Health reporting system</p>
        </div>

        {/* Neighbourhood grid */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Cases by Neighbourhood</h2>
          <div className="flex flex-col gap-3">
            {NEIGHBOURHOODS.map((n) => (
              <div key={n.name} className="flex items-center gap-3">
                <span className="text-slate-300 text-sm w-40 shrink-0">{n.name}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      n.severity > 75 ? "bg-red-500" :
                      n.severity > 50 ? "bg-orange-500" :
                      n.severity > 30 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${n.severity}%` }}
                  />
                </div>
                <span className="text-slate-400 text-xs w-12 text-right">{n.cases}</span>
                <span className="text-xs w-4">
                  {n.trend === "up" ? "↑" : n.trend === "down" ? "↓" : "→"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How the app adapts */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-1">How ConditionX Response Adapts</h2>
          <p className="text-slate-400 text-sm mb-5">
            Triage guidance, clinic routing, and data reporting automatically adjust based on the current alert level.
          </p>
          <div className="flex flex-col gap-3">
            {ADAPTATIONS.map((a) => (
              <div key={a.level} className={`rounded-xl border p-4 ${a.color} ${a.level === ALERT_LEVEL ? "ring-2 ring-white/20" : ""}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.badge}`}>{a.level}</span>
                  {a.level === ALERT_LEVEL && <span className="text-xs text-slate-400">← current</span>}
                </div>
                <ul className="space-y-1">
                  {a.rules.map((r, i) => (
                    <li key={i} className="text-slate-300 text-xs flex gap-2">
                      <span className="text-slate-500 shrink-0">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/triage" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl text-center text-sm transition-colors">
            Check My Symptoms
          </Link>
          <Link href="/clinics" className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-center text-sm transition-colors">
            Find a Clinic
          </Link>
        </div>
      </div>
    </main>
  );
}
