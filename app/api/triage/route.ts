import { NextRequest, NextResponse } from "next/server";

// GROQ settings: provide a GROQ_API_KEY in environment, and optionally GROQ_API_URL
const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.ai/v1/models/groq-1:predict";

const SYSTEM_PROMPT = `You are a medical triage assistant during a 2030 Brampton healthcare emergency involving "Condition X".
Analyze the patient's symptoms and respond with ONLY valid JSON — no markdown fences, no explanation outside the JSON object.

{
  "urgency": "EMERGENCY" | "URGENT" | "MONITOR" | "SELF_CARE",
  "headline": "Single imperative sentence (e.g. 'Go to the ER immediately' or 'Rest at home and monitor your symptoms')",
  "timeframe": "Specific timeframe (e.g. 'Seek care within 2 hours', 'Monitor for 3 days', 'Call 911 now')",
  "recommendation": "2–3 sentence explanation of what to do and why",
  "warningSignsToWatch": ["sign 1", "sign 2", "sign 3"],
  "otcRecommendations": ["OTC product 1 for symptom X", "OTC product 2 for symptom Y"] or [] if urgency is EMERGENCY or URGENT,
  "mentalHealthNote": "Brief supportive note about isolation/anxiety if relevant — or null",
  "doctorSummary": "2–3 sentence clinical summary for the doctor: chief complaint, known conditions, medications, allergies, symptom duration, severity, and AI urgency assessment"
}

Urgency levels:
- EMERGENCY: life-threatening, call 911 or go to ER immediately
- URGENT: see a doctor or walk-in clinic within 24 hours
- MONITOR: watch symptoms at home for 2–3 days, seek care if they worsen
- SELF_CARE: rest, fluids, OTC remedies — no medical visit needed unless symptoms worsen

OTC recommendations:
- Only suggest for MONITOR or SELF_CARE urgency
- Only recommend over-the-counter products available in Canada (e.g. Tylenol, Advil, Reactine, Robitussin, saline spray, electrolyte drinks)
- ALWAYS check the patient's known allergies and medications before suggesting any OTC product — flag conflicts
- Max 3 suggestions, each as one short sentence: product name + what it helps with

Always err on the side of caution. This is triage guidance only, not diagnosis.`;

function buildHealthContext(profile: { conditions: string[]; conditionsOther: string; medications: string; allergies: string } | null): string {
  if (!profile) return "";
  const parts: string[] = [];
  const conds = [...profile.conditions, profile.conditionsOther].filter(Boolean);
  if (conds.length)          parts.push(`Known conditions: ${conds.join(", ")}`);
  if (profile.medications)   parts.push(`Current medications: ${profile.medications}`);
  if (profile.allergies)     parts.push(`Allergies: ${profile.allergies}`);
  if (!parts.length)         return "";
  return `\n\nPatient health context (factor into urgency and OTC suggestions):\n${parts.map(p => `- ${p}`).join("\n")}`;
}

function buildDemoResponse(symptoms: string) {
  const lower = symptoms.toLowerCase();
  const hasChestPain = lower.includes("chest") || lower.includes("breath");
  const hasFever = lower.includes("fever") || lower.includes("temperature");
  const hasMild = lower.includes("mild") || lower.includes("slight") || lower.includes("runny nose") || lower.includes("sniffle");

  if (hasChestPain) return {
    urgency: "EMERGENCY",
    headline: "Go to the emergency room immediately.",
    timeframe: "Seek care within the next 30 minutes",
    recommendation: "Chest pain or difficulty breathing during a Condition X outbreak is a serious warning sign. Call 911 or have someone drive you to the ER right away — do not drive yourself.",
    warningSignsToWatch: ["Worsening shortness of breath", "Blue-tinged lips or fingertips", "Loss of consciousness or confusion"],
    otcRecommendations: [],
    mentalHealthNote: "It's normal to feel frightened. Focus on getting to care — you're doing the right thing.",
    doctorSummary: `Patient reports: "${symptoms}". EMERGENCY urgency. Chest or respiratory symptoms during Condition X outbreak. Immediate evaluation required.`,
  };

  if (hasFever) return {
    urgency: "URGENT",
    headline: "See a doctor or walk-in clinic within 24 hours.",
    timeframe: "Seek care within 24 hours",
    recommendation: "Fever is a primary indicator of Condition X infection. A healthcare provider should assess you in person, take a swab, and determine whether isolation or treatment is needed.",
    warningSignsToWatch: ["Fever above 39.5°C", "Difficulty breathing or chest tightness", "Severe headache or stiff neck", "Confusion or unusual drowsiness"],
    otcRecommendations: [],
    mentalHealthNote: "Being unwell in isolation is stressful. Reach out to someone you trust — you don't have to go through this alone.",
    doctorSummary: `Patient reports: "${symptoms}". URGENT urgency. Fever present, consistent with possible Condition X. Clinical assessment and testing recommended within 24 hours.`,
  };

  if (hasMild) return {
    urgency: "SELF_CARE",
    headline: "Rest at home — no clinic visit needed right now.",
    timeframe: "Monitor for 48–72 hours",
    recommendation: "Your symptoms appear mild and manageable at home. Rest, stay hydrated, and use OTC remedies for comfort. Avoid contact with others as a precaution.",
    warningSignsToWatch: ["Fever developing above 38°C", "Symptoms worsening after 3 days", "New shortness of breath"],
    otcRecommendations: [
      "Tylenol (acetaminophen) — for mild fever or body aches",
      "Saline nasal spray — to relieve congestion",
      "Pedialyte or Gatorade — to stay hydrated if appetite is low",
    ],
    mentalHealthNote: null,
    doctorSummary: `Patient reports: "${symptoms}". SELF_CARE. Mild symptoms not requiring immediate attention. Patient advised to monitor and escalate if warning signs develop.`,
  };

  return {
    urgency: "MONITOR",
    headline: "Monitor your symptoms at home for 3 days.",
    timeframe: "Monitor for 3 days — seek care sooner if symptoms worsen",
    recommendation: "Your symptoms don't require immediate medical attention. Rest, drink fluids, and isolate from others as a precaution during the Condition X outbreak.",
    warningSignsToWatch: ["Fever above 38.5°C", "Shortness of breath or chest tightness", "Symptoms not improving after 3 days", "Severe fatigue"],
    otcRecommendations: [
      "Advil (ibuprofen) — for inflammation, fever, or body aches",
      "Robitussin DM — for cough relief",
      "Zinc lozenges — may help reduce duration of cold-like symptoms",
    ],
    mentalHealthNote: "Staying home alone while unwell can be isolating. Check in with a friend or family member by phone each day.",
    doctorSummary: `Patient reports: "${symptoms}". MONITOR urgency. Symptoms warrant home monitoring with escalation instructions.`,
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", pa: "Punjabi", fr: "French",
  tl: "Tagalog", ur: "Urdu", es: "Spanish", ta: "Tamil",
  pt: "Portuguese", zh: "Chinese",
};

export async function POST(req: NextRequest) {
  const { symptoms, language = "en", healthProfile = null } = await req.json();
  if (!symptoms?.trim()) {
    return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
  }

  const langName = LANGUAGE_NAMES[language] ?? "English";
  const langInstruction = language !== "en"
    ? ` Respond entirely in ${langName}, including all JSON values (keep JSON keys in English).`
    : "";

  const healthContext = buildHealthContext(healthProfile);

  try {
    const prompt = SYSTEM_PROMPT + langInstruction + "\n\nPatient input:\n" + symptoms.trim() + healthContext;

    const resp = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await resp.json().catch(() => null);

    let raw = "";
    if (!data) raw = "";
    else if (typeof data === "string") raw = data;
    else if (data.output && Array.isArray(data.output) && data.output[0]) {
      const c = data.output[0].content;
      if (typeof c === "string") raw = c;
      else if (Array.isArray(c)) raw = c.map((x: any) => (typeof x === "string" ? x : x.text || "")).join("");
    } else if (data.choices && data.choices[0] && (data.choices[0].text || data.choices[0].message?.content)) {
      raw = data.choices[0].text || data.choices[0].message?.content || "";
    } else if (data.text) raw = data.text;
    else raw = JSON.stringify(data);

    const text = (raw || "").toString().trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    try {
      return NextResponse.json(JSON.parse(text));
    } catch (e) {
      console.warn("Groq response parse failed, falling back to demo:", e instanceof Error ? e.message : e);
      return NextResponse.json(buildDemoResponse(symptoms.trim()));
    }
  } catch (err) {
    console.warn("Groq unavailable, using demo fallback:", err instanceof Error ? err.message : err);
    return NextResponse.json(buildDemoResponse(symptoms.trim()));
  }
}
