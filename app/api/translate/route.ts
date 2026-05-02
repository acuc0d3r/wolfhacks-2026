import { translate } from "@vitalets/google-translate-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { texts, langCode } = await req.json();

  if (!Array.isArray(texts) || texts.length === 0 || !langCode) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (langCode === "en") {
    return NextResponse.json({ translations: texts });
  }

  try {
    const results = await Promise.all(
      texts.map((t: string) => translate(t, { to: langCode }))
    );
    return NextResponse.json({ translations: results.map((r) => r.text) });
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
