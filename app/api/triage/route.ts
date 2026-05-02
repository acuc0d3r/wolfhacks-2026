import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a medical triage assistant during a 2030 Brampton healthcare emergency involving "Condition X".
Analyze the patient's symptoms and respond with ONLY valid JSON — no markdown fences, no explanation outside the JSON object.

{
  "urgency": "EMERGENCY" | "URGENT" | "MONITOR" | "SELF_CARE",
  "headline": "Single imperative sentence (e.g. 'Go to the ER immediately' or 'Rest at home and monitor your symptoms')",
  "timeframe": "Specific timeframe (e.g. 'Seek care within 2 hours', 'Monitor for 3 days', 'Call 911 now')",
  "recommendation": "2–3 sentence explanation of what to do and why",
  "warningSignsToWatch": ["sign 1", "sign 2", "sign 3"],
  "mentalHealthNote": "Brief supportive note about isolation/anxiety if relevant — or null",
  "doctorSummary": "2–3 sentence clinical summary for the doctor: chief complaint, symptom duration, severity, and AI urgency assessment"
}

Urgency levels:
- EMERGENCY: life-threatening, call 911 or go to ER immediately
- URGENT: see a doctor or walk-in clinic within 24 hours
- MONITOR: watch symptoms at home for 2–3 days, seek care if they worsen
- SELF_CARE: rest, fluids, OTC remedies — no medical visit needed unless symptoms worsen

Always err on the side of caution. This is triage guidance only, not diagnosis.`;

function buildDemoResponse(symptoms: string) {
  const lower = symptoms.toLowerCase();
  const hasChestPain = lower.includes("chest") || lower.includes("breath");
  const hasFever = lower.includes("fever") || lower.includes("temperature");
  const hasMild = lower.includes("mild") || lower.includes("slight") || lower.includes("runny nose") || lower.includes("sniffle");

  if (hasChestPain) {
    return {
      urgency: "EMERGENCY",
      headline: "Go to the emergency room immediately.",
      timeframe: "Seek care within the next 30 minutes",
      recommendation: "Chest pain or difficulty breathing during a Condition X outbreak is a serious warning sign that requires immediate evaluation. Do not drive yourself — call 911 or have someone take you to the ER right away.",
      warningSignsToWatch: ["Worsening shortness of breath", "Blue-tinged lips or fingertips", "Loss of consciousness or confusion"],
      mentalHealthNote: "It's normal to feel frightened right now. Focus on getting to care — you're taking the right step.",
      doctorSummary: `Patient reports: "${symptoms}". AI assessment: EMERGENCY urgency. Chief complaint includes chest or respiratory symptoms during Condition X outbreak. Immediate evaluation recommended.`,
    };
  }

  if (hasFever) {
    return {
      urgency: "URGENT",
      headline: "See a doctor or walk-in clinic within 24 hours.",
      timeframe: "Seek care within 24 hours",
      recommendation: "Fever is one of the primary indicators of Condition X infection. A healthcare provider should assess you in person, take a swab, and determine whether isolation or treatment is needed.",
      warningSignsToWatch: ["Fever above 39.5°C", "Difficulty breathing or chest tightness", "Severe headache or stiff neck", "Confusion or unusual drowsiness"],
      mentalHealthNote: "Being unwell in isolation is stressful. Reach out to someone you trust while you wait — you don't have to go through this alone.",
      doctorSummary: `Patient reports: "${symptoms}". AI assessment: URGENT urgency. Fever present, consistent with possible Condition X. Clinical assessment and testing recommended within 24 hours.`,
    };
  }

  if (hasMild) {
    return {
      urgency: "SELF_CARE",
      headline: "Rest at home — no clinic visit needed right now.",
      timeframe: "Monitor for 48–72 hours",
      recommendation: "Your symptoms appear mild and manageable at home. Rest, stay hydrated, and take over-the-counter medication for comfort. Avoid contact with vulnerable individuals as a precaution.",
      warningSignsToWatch: ["Fever developing above 38°C", "Symptoms worsening instead of improving after 3 days", "New shortness of breath"],
      mentalHealthNote: null,
      doctorSummary: `Patient reports: "${symptoms}". AI assessment: SELF_CARE. Mild symptoms not requiring immediate medical attention. Patient advised to monitor and escalate if warning signs develop.`,
    };
  }

  return {
    urgency: "MONITOR",
    headline: "Monitor your symptoms at home for 3 days.",
    timeframe: "Monitor for 3 days — seek care sooner if symptoms worsen",
    recommendation: "Your symptoms don't require immediate medical attention, but keep a close eye on how you feel over the next few days. Rest, drink fluids, and isolate from others as a precaution during the Condition X outbreak.",
    warningSignsToWatch: ["Fever above 38.5°C", "Shortness of breath or chest tightness", "Symptoms not improving after 3 days", "Severe fatigue or inability to get out of bed"],
    mentalHealthNote: "Staying home alone while you're unwell can be isolating. Check in with a friend or family member by phone or video each day — it makes a real difference.",
    doctorSummary: `Patient reports: "${symptoms}". AI assessment: MONITOR urgency. Symptoms warrant home monitoring with escalation instructions. No immediate clinical intervention required at this time.`,
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", pa: "Punjabi", fr: "French",
  tl: "Tagalog", ur: "Urdu", es: "Spanish", ta: "Tamil",
  pt: "Portuguese", zh: "Chinese",
};

export async function POST(req: NextRequest) {
  const { symptoms, language = "en" } = await req.json();
  if (!symptoms?.trim()) {
    return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
  }

  const langName = LANGUAGE_NAMES[language] ?? "English";
  const langInstruction = language !== "en"
    ? ` Respond entirely in ${langName}, including all fields of the JSON values (but keep the JSON keys in English).`
    : "";

  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-2.0-flash-lite", systemInstruction: SYSTEM_PROMPT + langInstruction },
      { apiVersion: "v1beta" }
    );

    const chat = model.startChat();
    const result = await chat.sendMessage(symptoms.trim());
    const raw = result.response.text().trim();
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Gemini unavailable, using demo fallback:", message);
    return NextResponse.json(buildDemoResponse(symptoms.trim()));
  }
}
