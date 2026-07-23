import Link from "next/link";
import Image from "next/image";
import { Flame, BookOpen, Headphones, Sunrise, Moon, HandHeart, Sparkles, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import HeroBanner from "@/components/HeroBanner";
import StatCard from "@/components/StatCard";
import QuoteCard from "@/components/QuoteCard";
import { calcStreak } from "@/lib/streak";

const todayISO = () => new Date().toISOString().slice(0, 10);

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // move back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16 fade-in-up">
        <HeroBanner />
        <h1 className="font-display text-2xl text-gold-soft mt-4">Welcome to Sadhana Circle</h1>
        <p className="text-ink-muted max-w-xs">
          Sign in to log today's practice and see your own dashboard here.
        </p>
        <Link href="/login" className="btn-primary px-6 py-3">
          Sign in
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: entry } = await supabase
    .from("sadhana_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_date", todayISO())
    .maybeSingle();

  // last 7 calendar days, for the streak + weekly chart
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const { data: recentEntries } = await supabase
    .from("sadhana_entries")
    .select("entry_date, score")
    .eq("user_id", user.id)
    .gte("entry_date", weekAgo.toISOString().slice(0, 10))
    .order("entry_date", { ascending: true });

  const { data: allDates } = await supabase
    .from("sadhana_entries")
    .select("entry_date")
    .eq("user_id", user.id);

  const streak = calcStreak((allDates ?? []).map((e) => e.entry_date));

  const firstName = (profile?.full_name ?? "Devotee").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // build Mon–Sun bars for the current week
  const monday = startOfWeek(new Date());
  const scoreByDate = new Map((recentEntries ?? []).map((e) => [e.entry_date, e.score ?? 0]));
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    return { label: "MTWTFSS"[i], score: scoreByDate.get(dateStr) ?? 0, isFuture: d > new Date() };
  });
  const maxScore = Math.max(1, ...weekBars.map((b) => b.score));

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-peacock-light">{greeting}</p>
          <h1 className="font-display text-2xl text-gold-soft">{firstName}</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/40">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-bg-elevated" />
          )}
        </div>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 w-fit">
          <Flame className="w-5 h-5 text-saffron" />
          <span className="text-sm font-bold text-ink">{streak} day streak 🔥</span>
        </div>
      )}

      <HeroBanner />

      <div>
        <h2 className="font-display text-lg text-gold-soft mb-3">Today's sadhana</h2>
        {!entry ? (
          <div className="card p-6 text-center">
            <p className="text-ink-muted text-sm mb-3">You haven't logged today's sadhana yet.</p>
            <Link href="/entry" className="btn-primary px-5 py-2 inline-block">
              Log today
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Flame} value={entry.rounds_chanted} label="Japa" accent="saffron" />
              <StatCard icon={BookOpen} value={`${entry.reading_minutes}m`} label="Reading" accent="gold" />
              <StatCard icon={HandHeart} value={`${entry.service_minutes}m`} label="Service" accent="tulsi" />
              <StatCard
                icon={Sunrise}
                value={entry.wake_time ? entry.wake_time.slice(0, 5) : "—"}
                label="Wake up"
                accent="peacock"
              />
              <StatCard
                icon={Moon}
                value={entry.sleep_time ? entry.sleep_time.slice(0, 5) : "—"}
                label="Sleep"
                accent="peacock"
              />
              <StatCard icon={Headphones} value={`${entry.listening_minutes}m`} label="Listening" accent="gold" />
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {entry.mangal_aarti && (
                <span className="flex items-center gap-1 text-xs text-gold-soft bg-gold/10 rounded-full px-3 py-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Mangal aarti
                </span>
              )}
              {entry.srimad_bhagavatam && (
                <span className="flex items-center gap-1 text-xs text-tulsi bg-tulsi/10 rounded-full px-3 py-1.5">
                  <BookMarked className="w-3.5 h-3.5" /> SB class
                </span>
              )}
              <Link href="/entry" className="text-xs text-ink-muted hover:text-ink ml-auto self-center underline">
                Edit
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-ink mb-3">This week</h3>
        <div className="flex items-end gap-1.5 h-20">
          {weekBars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full rounded-t"
                style={{
                  height: bar.isFuture ? "4%" : `${Math.max(6, (bar.score / maxScore) * 100)}%`,
                  background: bar.isFuture
                    ? "rgba(180,83,9,0.12)"
                    : "linear-gradient(to top, #D97706, #FBBF24)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-ink-muted">
          {weekBars.map((bar, i) => (
            <span key={i}>{bar.label}</span>
          ))}
        </div>
      </div>

      <QuoteCard />
    </div>
  );
}
