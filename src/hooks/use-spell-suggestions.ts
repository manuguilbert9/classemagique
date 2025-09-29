import { useEffect, useRef, useState } from "react";

function getLastToken(s: string) {
  const m = s.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return m?.[1] || "";
}

export function useSpellSuggestions(text: string, lang = "fr") {
  const [sugg, setSugg] = useState<string[]>([]);
  const t = useRef<number>();

  useEffect(() => {
    const last = getLastToken(text);
    if (t.current) window.clearTimeout(t.current);
    if (last.length < 1) { setSugg([]); return; }

    t.current = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/spell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: last, lang }),
        });
        if (r.ok) {
          const j = await r.json();
          setSugg(j.suggestions ?? []);
        } else {
          setSugg([]);
        }
      } catch (error) {
        console.error("Error fetching spell suggestions:", error);
        setSugg([]);
      }
    }, 250);
  }, [text, lang]);

  return sugg;
}
