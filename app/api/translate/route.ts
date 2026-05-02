import { NextRequest, NextResponse } from "next/server";

async function translateOne(text: string, langCode: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.responseData?.translatedText ?? text;
}

export async function POST(req: NextRequest) {
  const { texts, langCode } = await req.json();

  if (!Array.isArray(texts) || texts.length === 0 || !langCode) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (langCode === "en") {
    return NextResponse.json({ translations: texts });
  }

  try {
    const translations = await Promise.all(texts.map((t: string) => translateOne(t, langCode)));
    return NextResponse.json({ translations });
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
