import { NextRequest, NextResponse } from "next/server";

const LT_ENDPOINT = process.env.LT_ENDPOINT ?? "https://api.languagetool.org/v2/check";
const DEFAULT_LANG = "fr";

export async function POST(req: NextRequest) {
  const { text, lang = DEFAULT_LANG } = await req.json();
  if (!text) return NextResponse.json({ suggestions: [] });
  const body = new URLSearchParams({ text, language: lang });
  const resp = await fetch(LT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!resp.ok) return NextResponse.json({ suggestions: [] }, { status: 200 });
  const data = await resp.json();

  // Récupère la première proposition sur le dernier token
  const matches = data.matches ?? [];
  const suggestions = (matches[0]?.replacements ?? []).map((r: any) => r.value);
  return NextResponse.json({ suggestions });
}
