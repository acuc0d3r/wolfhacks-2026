"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type CareType = "all" | "emergency" | "urgent" | "walkin";

const CLINICS = [
  {
    name: "Brampton Civic Hospital — Emergency",
    type: "emergency" as CareType,
    address: "2100 Bovaird Dr E, Brampton",
    phone: "905-494-2120",
    href: "tel:9054942120",
    wait: 270,
    capacity: 94,
    operator: "William Osler Health System",
    notes: "Full emergency services. Avoid unless EMERGENCY urgency.",
    open: "24/7",
    lat: 43.7178,
    lng: -79.7104,
  },
  {
    name: "Peel Memorial Centre — Urgent Care",
    type: "urgent" as CareType,
    address: "20 Lynch St, Brampton",
    phone: "905-494-2120",
    href: "tel:9054942120",
    wait: 95,
    capacity: 78,
    operator: "William Osler Health System",
    notes: "Best option for URGENT cases. No appointment needed.",
    open: "24/7",
    lat: 43.6892,
    lng: -79.7560,
  },
  {
    name: "Bramalea Medical Walk-in",
    type: "walkin" as CareType,
    address: "50 Sunny Meadow Blvd, Brampton",
    phone: "905-793-0001",
    href: "tel:9057930001",
    wait: 45,
    capacity: 62,
    operator: "Independent",
    notes: "Family medicine and walk-in. Good for MONITOR cases with worsening symptoms.",
    open: "8 AM – 8 PM",
    lat: 43.7410,
    lng: -79.6860,
  },
  {
    name: "Shoppers Drug Mart Clinic — Bramalea City Centre",
    type: "walkin" as CareType,
    address: "25 Peel Centre Dr, Brampton",
    phone: "905-456-0655",
    href: "tel:9054560655",
    wait: 30,
    capacity: 45,
    operator: "Shoppers Drug Mart",
    notes: "Minor illness, prescription renewal, Condition X testing.",
    open: "9 AM – 9 PM",
    lat: 43.7375,
    lng: -79.6900,
  },
  {
    name: "Punjabi Community Health Services",
    type: "walkin" as CareType,
    address: "33 Confederation Pkwy, Brampton",
    phone: "905-790-0808",
    href: "tel:9057900808",
    wait: 20,
    capacity: 38,
    operator: "PCHS",
    notes: "Multilingual staff. South Asian community focus. Mental health and primary care.",
    open: "9 AM – 5 PM",
    lat: 43.6845,
    lng: -79.7650,
  },
  {
    name: "Heart Lake Medical Centre",
    type: "walkin" as CareType,
    address: "10520 Hurontario St, Brampton",
    phone: "905-846-9255",
    href: "tel:9058469255",
    wait: 55,
    capacity: 70,
    operator: "Independent",
    notes: "Walk-in and family medicine. North Brampton residents.",
    open: "8 AM – 7 PM",
    lat: 43.7170,
    lng: -79.7400,
  },
  {
    name: "Algoma University — Portable Clinic (Demo)",
    type: "walkin" as CareType,
    address: "1 University Ave W, Sault Ste. Marie, ON (fictional)",
    phone: "705-555-0199",
    href: "tel:7055550199",
    wait: 25,
    capacity: 40,
    operator: "Algoma University (Demo)",
    notes: "Portable clinic demo — for demonstration only; not a real care site.",
    open: "10 AM – 4 PM",
    lat: 46.4930,
    lng: -84.3450,
  },
];

const TYPE_LABEL: Record<CareType, string> = {
  all: "All",
  emergency: "Emergency",
  urgent: "Urgent Care",
  walkin: "Walk-in",
};

const TYPE_BADGE: Record<CareType, string> = {
  all: "",
  emergency: "bg-red-500/10 text-red-400 border-red-500/20",
  urgent: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  walkin: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

// Brampton City Hall (used as distance origin for sorting)
const CITY_HALL = { lat: 43.6833, lng: -79.7609 };

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c; // kilometers
}

function WaitBar({ pct }: { pct: number }) {
  const color = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-orange-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-600 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-400 text-xs w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function ClinicsPage() {
  const [filter, setFilter] = useState<CareType>("all");
  const [sortBy, setSortBy] = useState<'best' | 'capacity' | 'location'>('best');

  const shown = filter === "all" ? CLINICS : CLINICS.filter((c) => c.type === filter);

  const shownSorted = useMemo(() => {
    const arr = shown.slice();
    if (sortBy === 'capacity') {
      // capacity: low -> high
      arr.sort((a, b) => (a.capacity ?? 0) - (b.capacity ?? 0));
    } else if (sortBy === 'location') {
      // sort by geographic distance to Brampton City Hall (closest first)
      arr.sort((a, b) => {
        const da = (typeof a.lat === "number" && typeof a.lng === "number")
          ? haversineDistanceKm(CITY_HALL.lat, CITY_HALL.lng, a.lat, a.lng)
          : Number.POSITIVE_INFINITY;
        const db = (typeof b.lat === "number" && typeof b.lng === "number")
          ? haversineDistanceKm(CITY_HALL.lat, CITY_HALL.lng, b.lat, b.lng)
          : Number.POSITIVE_INFINITY;
        return da - db;
      });
    }
    return arr;
  }, [shown, sortBy]);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Back</Link>
        <span className="font-bold">Find a Clinic</span>
        <span className="ml-auto text-xs text-slate-400 font-mono">Brampton · 2030</span>
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Brampton Care Sites</h1>
          <p className="text-slate-400 text-sm">Wait times are estimates based on current Condition X demand. Call ahead when possible.</p>
        </div>

        {/* Filter tabs + sort */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 flex-wrap">
            {(["all", "emergency", "urgent", "walkin"] as CareType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  filter === t
                    ? "bg-cyan-500 text-slate-900 border-cyan-500"
                    : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
                }`}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-slate-400 text-xs">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'best' | 'capacity' | 'location')}
              className="bg-slate-800 text-slate-300 text-sm border border-slate-600 rounded-full px-3 py-1.5"
            >
              <option value="best">Best match</option>
              <option value="capacity">Capacity (low → high)</option>
              <option value="location">Location (distance to City Hall)</option>
            </select>
          </div>
        </div>

        {/* Clinic cards */}
        <div className="flex flex-col gap-4">
          {shownSorted.map((c) => (
            <div key={c.name} className="bg-slate-800 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-semibold text-sm">{c.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_BADGE[c.type]}`}>
                      {TYPE_LABEL[c.type]}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{c.address}</p>
                  <p className="text-slate-500 text-xs">{c.operator} · {c.open}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-cyan-400">
                    {c.wait >= 60 ? `${Math.floor(c.wait / 60)}h ${c.wait % 60}m` : `${c.wait}m`}
                  </p>
                  <p className="text-slate-500 text-xs">est. wait</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-xs mb-1">Capacity</p>
                <WaitBar pct={c.capacity} />
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">{c.notes}</p>

              <a
                href={c.href}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-xl transition-colors"
              >
                📞 {c.phone}
              </a>
            </div>
          ))}
        </div>

        <p className="text-slate-500 text-xs text-center">
          In a life-threatening emergency, call 911 — do not drive to the ER yourself.
        </p>
      </div>
    </main>
  );
}
