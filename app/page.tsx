import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame, BookOpen, Headphones, Sunrise, Moon, HandHeart, Sparkles, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import HeroBanner from "@/components/HeroBanner";
import StatCard from "@/components/StatCard";
import QuoteCard from "@/components/QuoteCard";
import { calcStreak } from "@/lib/streak";

const todayISO = () => new Date().toISOString().slice(0, 10);

function daysInMonth(year: number, month: number): number {
  // month is 0-indexed (JS Date convention)
  return new Date(year, month + 1, 0).getDate();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
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

  const { data: allDates } = await supabase
    .from("sadhana_entries")
    .select("entry_date")
    .eq("user_id", user.id);

  const streak = calcStreak((allDates ?? []).map((e) => e.entry_date));

  const firstName = (profile?.full_name ?? "Devotee").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // --- monthly calendar grid, with prev/next navigation ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const viewedYear = searchParams.year ? Number(searchParams.year) : currentYear;
  const viewedMonth = searchParams.month ? Number(searchParams.month) - 1 : currentMonth; // 0-indexed

  const loggedDates = new Set((allDates ?? []).map((e) => e.entry_date));
  const todayStr = todayISO();
  const totalDaysInMonth = daysInMonth(viewedYear, viewedMonth);
  const monthStart = new Date(viewedYear, viewedMonth, 1);
  const leadingBlanks = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // week starts Monday

  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = new Date(viewedYear, viewedMonth, dayNum).toISOString().slice(0, 10);
    return {
      day: dayNum,
      logged: loggedDates.has(dateStr),
      isFuture: dateStr > todayStr,
      isToday: dateStr === todayStr,
    };
  });

  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // prev/next month links — can't navigate past the current month
  const prevMonthDate = new Date(viewedYear, viewedMonth - 1, 1);
  const nextMonthDate = new Date(viewedYear, viewedMonth + 1, 1);
  const isCurrentMonth = viewedYear === currentYear && viewedMonth === currentMonth;

  const toParams = (d: Date) =>
    `?year=${d.getFullYear()}&month=${String(d.getMonth() + 1).padStart(2, "0")}`;

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
              <StatCard icon={Flame} value={entry.rounds_chanted} label="Japa" accent="saffron" />
              <StatCard icon={BookOpen} value={`${entry.reading_minutes}m`} label="Reading" accent="gold" />
              <StatCard icon={Headphones} value={`${entry.listening_minutes}m`} label="Hearing" accent="gold" />
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {entry.mangal_aarti && (
                <span className="flex items-center gap-1 text-xs text-gold-soft bg-gold/10 rounded-full px-3 py-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Mangal aarti
                </span>
              )}
              {entry.seva && (
                <span className="flex items-center gap-1 text-xs text-saffron bg-saffron/10 rounded-full px-3 py-1.5">
                  <HandHeart className="w-3.5 h-3.5" /> Seva
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
        <div className="flex items-center justify-between mb-3">
          <Link
            href={toParams(prevMonthDate)}
            className="p-1.5 rounded-full hover:bg-gold/10 text-ink-muted hover:text-ink transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h3 className="text-sm font-semibold text-ink">{monthLabel}</h3>
          {isCurrentMonth ? (
            <span className="p-1.5 rounded-full text-ink-muted/30" aria-hidden="true">
              <ChevronRight className="w-4 h-4" />
            </span>
          ) : (
            <Link
              href={toParams(nextMonthDate)}
              className="p-1.5 rounded-full hover:bg-gold/10 text-ink-muted hover:text-ink transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {monthDays.map((d) => (
            <div
              key={d.day}
              className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium"
              style={{
                background: d.logged
                  ? "linear-gradient(135deg, #EA580C, #FBBF24)"
                  : d.isFuture
                  ? "rgba(180,83,9,0.05)"
                  : "rgba(180,83,9,0.12)",
                color: d.logged ? "#FFF8EC" : "#B45309",
                outline: d.isToday ? "2px solid #D97706" : "none",
                outlineOffset: "-2px",
              }}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "linear-gradient(135deg, #EA580C, #FBBF24)" }}
            />
            Logged
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "rgba(180,83,9,0.12)" }} />
            Missed
          </span>
        </div>
      </div>

      <QuoteCard />
    </div>
  );
}