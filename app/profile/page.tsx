import Image from "next/image";
import { Flame, CalendarCheck, Trophy, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DisplayNameEditor from "@/components/DisplayNameEditor";
import ExportDataButton from "@/components/ExportDataButton";
import ReminderSettings from "@/components/ReminderSettings";
import YearHeatmap from "@/components/YearHeatmap";
import { calcStreak } from "@/lib/streak";
import { computeBadges } from "@/lib/badges";

const BADGE_ICON: Record<string, string> = {
  streak: "🏆",
  rounds: "📿",
  reading: "📖",
  earlyRiser: "🌅",
};

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <p className="text-ink-muted">Sign in to see your profile.</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, created_at, reminder_enabled, reminder_time")
    .eq("id", user.id)
    .maybeSingle();

  const { data: entries } = await supabase
    .from("sadhana_entries")
    .select("entry_date, score, rounds_chanted, reading_minutes, wake_time")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  const allEntries = entries ?? [];
  const allDates = allEntries.map((e) => e.entry_date);

  // --- core stats ---
  const totalDays = allEntries.length;
  const avgScore = totalDays ? Math.round(allEntries.reduce((s, e) => s + (e.score ?? 0), 0) / totalDays) : 0;
  const streak = calcStreak(allDates);
  const badges = computeBadges(allEntries, streak);

  // --- badge unlock dates: record any newly-earned badge, then read all records back ---
  const earnedBadges = badges.filter((b) => b.earned);
  if (earnedBadges.length > 0) {
    const { data: existing } = await supabase.from("user_badges").select("badge_key").eq("user_id", user.id);
    const existingKeys = new Set((existing ?? []).map((r) => r.badge_key));
    const toInsert = earnedBadges
      .filter((b) => !existingKeys.has(b.key))
      .map((b) => ({ user_id: user.id, badge_key: b.key }));
    if (toInsert.length > 0) {
      await supabase.from("user_badges").insert(toInsert);
    }
  }
  const { data: badgeRecords } = await supabase
    .from("user_badges")
    .select("badge_key, earned_at")
    .eq("user_id", user.id);
  const earnedAtByKey = new Map((badgeRecords ?? []).map((r) => [r.badge_key, r.earned_at as string]));

  // --- 5. year heatmap ---
  const scoreByDate = new Map(allEntries.map((e) => [e.entry_date, e.score ?? 0]));

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  const METRICS = [
    { icon: CalendarCheck, value: totalDays, label: "Days logged", color: "#4D7C4A" },
    { icon: Flame, value: streak, label: "Day streak", color: "#F97316" },
    { icon: Trophy, value: avgScore, label: "Avg. score", color: "#D4AF37" },
  ];

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      <div className="card p-6 flex flex-col items-center text-center relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.3), transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="w-24 h-24 rounded-full overflow-hidden mb-3 relative"
          style={{ border: "3px solid #D4AF37", boxShadow: "0 10px 24px rgba(212,175,55,0.35)" }}
        >
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={96} height={96} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-bg-elevated" />
          )}
        </div>
        <h1 className="font-display text-2xl text-ink relative">{profile?.full_name ?? "Devotee"}</h1>
        {joined && <p className="text-sm text-ink-muted mt-1 relative">In the circle since {joined}</p>}
        <div className="relative">
          <DisplayNameEditor userId={user.id} initialName={profile?.full_name ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {METRICS.map((m) => (
          <div key={m.label} className="card text-center p-4">
            <m.icon className="w-5 h-5 mx-auto mb-2" style={{ color: m.color }} />
            <p className="text-2xl font-numeric text-ink">{m.value}</p>
            <p className="text-[11px] text-ink-muted mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* 6 — badges with unlock dates */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Badges</h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map((badge) => {
            const earnedAt = earnedAtByKey.get(badge.key);
            return (
              <div key={badge.key} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={
                    badge.earned
                      ? {
                          background: "linear-gradient(135deg, #F97316, #D4AF37)",
                          boxShadow: "0 6px 16px rgba(212,175,55,0.4)",
                          border: "2px solid rgba(255,255,255,0.6)",
                        }
                      : {
                          background: "rgba(212,175,55,0.08)",
                          border: "2px solid rgba(212,175,55,0.15)",
                          opacity: 0.5,
                        }
                  }
                >
                  <span style={{ filter: badge.earned ? "none" : "grayscale(100%)" }}>
                    {BADGE_ICON[badge.key]}
                  </span>
                </div>
                <span className="text-[10px] text-center text-ink-muted leading-tight">{badge.label}</span>
                {badge.earned && earnedAt && (
                  <span className="text-[9px] text-center text-tulsi leading-tight">
                    {new Date(earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}
                {!badge.earned && badge.progressLabel && (
                  <span className="text-[9px] text-center text-gold-soft/80 leading-tight">
                    {badge.progressLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 — year contribution heatmap */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-semibold text-ink">Contribution activity</h3>
        </div>
        <YearHeatmap year={new Date().getFullYear()} scoreByDate={scoreByDate} />
      </div>

      {/* settings section */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold-soft">Settings</span>
        <span className="flex-1 divider-gold" />
      </div>

      {/* 8 — reminders */}
      <ReminderSettings
        userId={user.id}
        initialEnabled={profile?.reminder_enabled ?? false}
        initialTime={profile?.reminder_time ?? "20:00"}
      />

      {/* 9 — export + sign out */}
      <div className="flex flex-col gap-2">
        <ExportDataButton userId={user.id} />
        <SignOutButton />
      </div>
    </div>
  );
}