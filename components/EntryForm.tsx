"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateScore } from "@/lib/scoring";
import Toggle from "@/components/Toggle";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function EntryForm() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    sleep_time: "",
    wake_time: "",
    rounds_chanted: 0,
    reading_minutes: 0,
    listening_minutes: 0,
    service_minutes: 0,
    mangal_aarti: false,
    srimad_bhagavatam: false,
  });

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
          sleep_time: data.sleep_time ?? "",
          wake_time: data.wake_time ?? "",
          rounds_chanted: data.rounds_chanted ?? 0,
          reading_minutes: data.reading_minutes ?? 0,
          listening_minutes: data.listening_minutes ?? 0,
          service_minutes: data.service_minutes ?? 0,
          mangal_aarti: data.mangal_aarti ?? false,
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
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl text-gold-soft">Today's sadhana</h1>
        <p className="text-sm text-ink-muted mt-1">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Rounds chanted
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.rounds_chanted}
            onChange={(e) => setForm({ ...form, rounds_chanted: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Reading (minutes)
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.reading_minutes}
            onChange={(e) => setForm({ ...form, reading_minutes: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Service (minutes)
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.service_minutes}
            onChange={(e) => setForm({ ...form, service_minutes: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Wake up time
          <input
            type="time"
            className="p-3"
            value={form.wake_time}
            onChange={(e) => setForm({ ...form, wake_time: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Sleep time (previous day)
          <input
            type="time"
            className="p-3"
            value={form.sleep_time}
            onChange={(e) => setForm({ ...form, sleep_time: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Listening (minutes)
          <input
            type="number"
            min={0}
            className="p-3"
            value={form.listening_minutes}
            onChange={(e) => setForm({ ...form, listening_minutes: Number(e.target.value) })}
          />
        </label>

        <Toggle
          label="Mangal aarti attended"
          checked={form.mangal_aarti}
          onChange={(v) => setForm({ ...form, mangal_aarti: v })}
        />
        <Toggle
          label="Srimad Bhagavatam class"
          checked={form.srimad_bhagavatam}
          onChange={(v) => setForm({ ...form, srimad_bhagavatam: v })}
        />

        {error && <p className="text-saffron text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary py-3 disabled:opacity-60">
          {saving ? "Saving…" : "Save today's sadhana"}
        </button>
      </form>

      {showSuccess && (
        <div className="mt-1 bg-green-100 border border-green-300 rounded-xl p-4 text-center fade-in-up">
          <p className="text-green-800 font-semibold">✅ Sadhana logged successfully!</p>
        </div>
      )}
    </div>
  );
}
