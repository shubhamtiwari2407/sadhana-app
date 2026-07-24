"use client";

import { useEffect, useState } from "react";
import type { Badge } from "@/lib/badges";

const STORAGE_KEY = "sadhana_celebrated_badges";

export default function MilestoneCelebration({ badges }: { badges: Badge[] }) {
  const [celebrating, setCelebrating] = useState<Badge | null>(null);

  useEffect(() => {
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      seen = [];
    }
    const newlyEarned = badges.find((b) => b.earned && !seen.includes(b.key));
    if (newlyEarned) {
      setCelebrating(newlyEarned);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, newlyEarned.key]));
      const timer = setTimeout(() => setCelebrating(null), 3200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!celebrating) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      style={{ background: "rgba(91,58,15,0.35)" }}
      onClick={() => setCelebrating(null)}
    >
      <div
        className="card px-8 py-6 text-center pop-in shadow-2xl"
        style={{ background: "linear-gradient(135deg, #FFF8EC, #FDECD1)" }}
      >
        <p className="text-4xl mb-2">🏆</p>
        <p className="font-display text-xl text-gold-soft">{celebrating.label}</p>
        <p className="text-sm text-ink-muted mt-1">unlocked!</p>
      </div>
    </div>
  );
}