import Image from "next/image";
import { Flame, CalendarCheck, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
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
    .select("full_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: entries } = await supabase
    .from("sadhana_entries")
    .select("entry_date, score, rounds_chanted, reading_minutes, wake_time")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  const totalDays = entries?.length ?? 0;
  const avgScore = totalDays ? Math.round(entries!.reduce((s, e) => s + (e.score ?? 0), 0) / totalDays) : 0;
  const streak = calcStreak((entries ?? []).map((e) => e.entry_date));
  const badges = computeBadges(entries ?? [], streak);

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold/40 shadow-lg mb-3">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={96} height={96} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-bg-elevated" />
          )}
        </div>
        <h1 className="font-display text-xl text-gold-soft">{profile?.full_name ?? "Devotee"}</h1>
        {joined && <p className="text-sm text-ink-muted">In the circle since {joined}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center p-3">
          <CalendarCheck className="w-5 h-5 mx-auto mb-1 text-tulsi" />
          <p className="text-xl font-display text-ink">{totalDays}</p>
          <p className="text-xs text-ink-muted">Days logged</p>
        </div>
        <div className="card text-center p-3">
          <Flame className="w-5 h-5 mx-auto mb-1 text-saffron" />
          <p className="text-xl font-display text-ink">{streak}</p>
          <p className="text-xs text-ink-muted">Day streak</p>
        </div>
        <div className="card text-center p-3">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-gold" />
          <p className="text-xl font-display text-ink">{avgScore}</p>
          <p className="text-xs text-ink-muted">Avg. score</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">Badges</h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div key={badge.key} className="flex flex-col items-center gap-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  badge.earned ? "bg-gold/20" : "bg-bg-elevated opacity-35 grayscale"
                }`}
              >
                {BADGE_ICON[badge.key]}
              </div>
              <span className="text-[10px] text-center text-ink-muted leading-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SignOutButton />
      </div>
    </div>
  );
}