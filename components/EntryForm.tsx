"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sunrise, Moon, Flame, BookOpen, Headphones, Sparkles, HandHeart, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateScore } from "@/lib/scoring";
import CheckTile from "@/components/CheckTile";

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

export default function EntryForm() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    wake_time: "",
    sleep_time: "",
    rounds_chanted: 0,
    reading_minutes: 0,
    listening_minutes: 0,
    mangal_aarti: false,
    seva: false,
    srimad_bhagavatam: false,
  });

  const liveScore = useMemo(() => calculateScore(form), [form]);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("sadhana_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("entry_date", todayISO())
        .maybeSingle();

      if (data) {
        setForm({
          wake_time: data.wake_time ?? "",
          sleep_time: data.sleep_time ?? "",
          rounds_chanted: data.rounds_chanted ?? 0,
          reading_minutes: data.reading_minutes ?? 0,
          listening_minutes: data.listening_minutes ?? 0,
          mangal_aarti: data.mangal_aarti ?? false,
          seva: data.seva ?? false,
          srimad_bhagavatam: data.srimad_bhagavatam ?? false,
        });
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login");
      return;
    }

    const score = calculateScore(form);

    const { error: upsertError } = await supabase.from("sadhana_entries").upsert(
      {
        user_id: userData.user.id,
        entry_date: todayISO(),
        ...form,
        sleep_time: form.sleep_time || null,
        wake_time: form.wake_time || null,
        score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entry_date" }
    );

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 900);
  };

  if (loading) return <p className="text-ink-muted text-center py-16">Loading today's entry…</p>;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gold-soft">Today's sadhana</h1>
          <p className="text-sm text-ink-muted mt-1">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="card px-3 py-2 text-center">
          <p className="font-display text-xl text-gold-soft leading-none">{liveScore}</p>
          <p className="text-[10px] text-ink-muted mt-0.5">pts so far</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-peacock" /> Wake up time
          </span>
          <div className="flex gap-2">
            <input
              type="time"
              className="p-3 flex-1"
              value={form.wake_time}
              onChange={(e) => setForm({ ...form, wake_time: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, wake_time: nowHHMM() })}
              className="px-3 rounded-xl border border-gold/30 text-xs font-semibold text-gold-soft hover:bg-gold/10 transition-colors"
            >
              Now
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-peacock" /> Sleep time (previous day)
          </span>
          <input
            type="time"
            className="p-3"
            value={form.sleep_time}
            onChange={(e) => setForm({ ...form, sleep_time: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-saffron" /> Rounds chanted
          </span>
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.rounds_chanted}
            onChange={(e) => setForm({ ...form, rounds_chanted: Number(e.target.value) })}
          />
          <div className="flex gap-2 mt-1">
            {[
              { label: "+1", delta: 1 },
              { label: "+4", delta: 4 },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setForm({ ...form, rounds_chanted: form.rounds_chanted + chip.delta })}
                className="px-3 py-1 rounded-full border border-gold/30 text-xs font-semibold text-gold-soft hover:bg-gold/10 transition-colors"
              >
                {chip.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setForm({ ...form, rounds_chanted: 16 })}
              className="px-3 py-1 rounded-full border border-gold/30 text-xs font-semibold text-gold-soft hover:bg-gold/10 transition-colors"
            >
              Set 16
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gold" /> Reading (minutes)
          </span>
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.reading_minutes}
            onChange={(e) => setForm({ ...form, reading_minutes: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-gold" /> Hearing (minutes)
          </span>
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.listening_minutes}
            onChange={(e) => setForm({ ...form, listening_minutes: Number(e.target.value) })}
          />
        </label>

        <div>
          <p className="text-sm font-medium text-ink mb-2">Today's activities</p>
          <div className="grid grid-cols-3 gap-3">
            <CheckTile
              icon={Sparkles}
              label="Mangal aarti"
              checked={form.mangal_aarti}
              onChange={(v) => setForm({ ...form, mangal_aarti: v })}
            />
            <CheckTile
              icon={HandHeart}
              label="Seva"
              checked={form.seva}
              onChange={(v) => setForm({ ...form, seva: v })}
            />
            <CheckTile
              icon={BookMarked}
              label="SB class"
              checked={form.srimad_bhagavatam}
              onChange={(v) => setForm({ ...form, srimad_bhagavatam: v })}
            />
          </div>
        </div>

        {error && <p className="text-saffron text-sm">{error}</p>}

        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-2 max-w-md mx-auto" style={{ background: "linear-gradient(180deg, transparent, #FFF8EC 30%)" }}>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-60 shadow-lg">
            {saving ? "Saving…" : `Save today's sadhana`}
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="mt-1 bg-green-100 border border-green-300 rounded-xl p-4 text-center fade-in-up">
          <p className="text-green-800 font-semibold">✅ Sadhana logged successfully!</p>
        </div>
      )}
    </div>
  );
}