"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Sunrise, Moon, Flame, BookOpen, Headphones, Sparkles, HandHeart, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateScore } from "@/lib/scoring";
import CheckTile from "@/components/CheckTile";

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  wake_time: "",
  sleep_time: "",
  rounds_chanted: 0,
  reading_minutes: 0,
  listening_minutes: 0,
  mangal_aarti: false,
  seva: false,
  srimad_bhagavatam: false,
};

function FieldLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-soft mb-1.5">
      <Icon className="w-3.5 h-3.5" /> {children}
    </span>
  );
}

export default function EntryForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayStr = todayISO();
  const dateParam = searchParams.get("date");
  const selectedDate = dateParam && dateParam <= todayStr ? dateParam : todayStr;
  const isToday = selectedDate === todayStr;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const liveScore = useMemo(() => calculateScore(form), [form]);

  const navigateToDate = useCallback(
    (date: string) => {
      const clamped = date > todayStr ? todayStr : date;
      router.push(`/entry?date=${clamped}`);
    },
    [router, todayStr]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShowSuccess(false);

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
        .eq("entry_date", selectedDate)
        .maybeSingle();

      if (cancelled) return;

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
      } else {
        setForm(EMPTY_FORM);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, router, supabase]);

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
        entry_date: selectedDate,
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
    if (isToday) {
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 900);
    } else {
      setTimeout(() => setShowSuccess(false), 1800);
    }
  };

  const dateObj = new Date(selectedDate + "T00:00:00");

  if (loading) return <p className="text-ink-muted text-center py-16">Loading entry…</p>;

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">
            {isToday ? "Today's sadhana" : "Log past sadhana"}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {dateObj.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="card px-3.5 py-2.5 text-center">
          <p className="font-numeric text-xl text-ink leading-none">{liveScore}</p>
          <p className="text-[10px] text-ink-muted mt-0.5">pts so far</p>
        </div>
      </div>

      <div className="card flex items-center justify-center gap-2 py-2">
        <button
          type="button"
          onClick={() => navigateToDate(shiftDate(selectedDate, -1))}
          className="p-1.5 rounded-full hover:bg-gold/10 text-ink-muted hover:text-ink transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <input
          type="date"
          value={selectedDate}
          max={todayStr}
          onChange={(e) => e.target.value && navigateToDate(e.target.value)}
          className="text-sm text-ink bg-transparent border-none text-center font-medium px-2 py-1"
        />
        <button
          type="button"
          onClick={() => navigateToDate(shiftDate(selectedDate, 1))}
          disabled={isToday}
          className="p-1.5 rounded-full hover:bg-gold/10 text-ink-muted hover:text-ink transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {!isToday && (
        <button
          type="button"
          onClick={() => navigateToDate(todayStr)}
          className="text-xs text-gold-soft underline text-center -mt-3"
        >
          Jump to today
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Sleep and waking</h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <FieldLabel icon={Sunrise}>Wake up time</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="time"
                  className="flex-1"
                  value={form.wake_time}
                  onChange={(e) => setForm({ ...form, wake_time: e.target.value })}
                />
                {isToday && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, wake_time: nowHHMM() })}
                    className="px-3 rounded-2xl border border-gold/30 text-xs font-semibold text-gold-soft hover:bg-gold/10 transition-colors"
                  >
                    Now
                  </button>
                )}
              </div>
            </label>

            <label className="block">
              <FieldLabel icon={Moon}>Sleep time (previous day)</FieldLabel>
              <input
                type="time"
                className="w-full"
                value={form.sleep_time}
                onChange={(e) => setForm({ ...form, sleep_time: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Chanting and study</h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <FieldLabel icon={Flame}>Rounds chanted</FieldLabel>
              <input
                type="number"
                min={0}
                className="w-full"
                value={form.rounds_chanted}
                onChange={(e) => setForm({ ...form, rounds_chanted: Number(e.target.value) })}
              />
              <div className="flex gap-2 mt-2">
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

            <label className="block">
              <FieldLabel icon={BookOpen}>Reading (minutes)</FieldLabel>
              <input
                type="number"
                min={0}
                className="w-full"
                value={form.reading_minutes}
                onChange={(e) => setForm({ ...form, reading_minutes: Number(e.target.value) })}
              />
            </label>

            <label className="block">
              <FieldLabel icon={Headphones}>Hearing (minutes)</FieldLabel>
              <input
                type="number"
                min={0}
                className="w-full"
                value={form.listening_minutes}
                onChange={(e) => setForm({ ...form, listening_minutes: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Activities</h2>
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

        <div
          className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2 pt-3 max-w-md mx-auto"
          style={{ background: "linear-gradient(180deg, transparent, #FFF9F2 35%)" }}
        >
          <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 disabled:opacity-60">
            {saving
              ? "Saving…"
              : isToday
              ? "Save today's sadhana"
              : `Save sadhana for ${dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
          </button>
        </div>
      </form>

      {showSuccess && (
        <div
          className="rounded-2xl p-4 text-center pop-in relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FDE68A, #F97316, #D4AF37)" }}
        >
          <Sparkles className="w-4 h-4 absolute top-2 left-3 text-white/70" />
          <Sparkles className="w-3 h-3 absolute bottom-2 right-5 text-white/60" />
          <Sparkles className="w-5 h-5 absolute top-1 right-9 text-white/50" />
          <p className="text-white font-semibold">✨ Sadhana logged successfully!</p>
        </div>
      )}
    </div>
  );
}