import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame, BookOpen, Headphones, Sunrise, Moon, HandHeart, Sparkles, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import HeroBanner from "@/components/HeroBanner";
import CompletionRing from "@/components/CompletionRing";
import MilestoneCelebration from "@/components/MilestoneCelebration";
import QuoteCard from "@/components/QuoteCard";
import { calcStreak } from "@/lib/streak";
import { computeBadges } from "@/lib/badges";
import { getGreeting } from "@/lib/greeting";

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

  // expanded to include fields needed for badge computation, not just dates
  const { data: allEntries } = await supabase
    .from("sadhana_entries")
    .select("entry_date, rounds_chanted, reading_minutes, wake_time")
    .eq("user_id", user.id);

  const streak = calcStreak((allEntries ?? []).map((e) => e.entry_date));
  const badges = computeBadges(allEntries ?? [], streak);

  // how many devotees (including this user) have logged sadhana today, circle-wide
  const { count: todayCount } = await supabase
    .from("sadhana_entries")
    .select("user_id", { count: "exact", head: true })
    .eq("entry_date", todayISO());

  const firstName = (profile?.full_name ?? "Devotee").split(" ")[0];
  const greeting = getGreeting();

  // --- monthly calendar grid, with prev/next navigation ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const viewedYear = searchParams.year ? Number(searchParams.year) : currentYear;
  const viewedMonth = searchParams.month ? Number(searchParams.month) - 1 : currentMonth; // 0-indexed

  const loggedDates = new Set((allEntries ?? []).map((e) => e.entry_date));
  const todayStr = todayISO();
  const totalDaysInMonth = daysInMonth(viewedYear, viewedMonth);
  const monthStart = new Date(viewedYear, viewedMonth, 1);
  const leadingBlanks = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // week starts Monday

  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = new Date(viewedYear, viewedMonth, dayNum).toISOString().slice(0, 10);
    return {
      day: dayNum,
      dateStr,
      logged: loggedDates.has(dateStr),
      isFuture: dateStr > todayStr,
      isToday: dateStr === todayStr,
    };
  });

  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const prevMonthDate = new Date(viewedYear, viewedMonth - 1, 1);
  const nextMonthDate = new Date(viewedYear, viewedMonth + 1, 1);
  const isCurrentMonth = viewedYear === currentYear && viewedMonth === currentMonth;

  const toParams = (d: Date) =>
    `?year=${d.getFullYear()}&month=${String(d.getMonth() + 1).padStart(2, "0")}`;

  // completion ring: how many of today's trackable items have something logged
  const trackedFields = entry
    ? [
        !!entry.wake_time,
        !!entry.sleep_time,
        (entry.rounds_chanted ?? 0) > 0,
        (entry.reading_minutes ?? 0) > 0,
        (entry.listening_minutes ?? 0) > 0,
        !!entry.mangal_aarti,
        !!entry.seva,
        !!entry.srimad_bhagavatam,
      ]
    : [];
  const completionPercent = entry ? (trackedFields.filter(Boolean).length / trackedFields.length) * 100 : 0;

  const infoChips = entry
    ? [
        { icon: Sunrise, label: entry.wake_time ? entry.wake_time.slice(0, 5) : "No wake time" },
        { icon: Moon, label: entry.sleep_time ? entry.sleep_time.slice(0, 5) : "No sleep time" },
        { icon: Flame, label: `${entry.rounds_chanted} rounds` },
        { icon: BookOpen, label: `${entry.reading_minutes}m reading` },
        { icon: Headphones, label: `${entry.listening_minutes}m hearing` },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      <MilestoneCelebration badges={badges} />

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

      {typeof todayCount === "number" && todayCount > 0 && (
        <Link href="/board" className="card p-3 flex items-center justify-between group">
          <span className="text-sm text-ink flex items-center gap-2">
            <Flame className="w-4 h-4 text-saffron shrink-0" />
            {todayCount} devotee{todayCount === 1 ? "" : "s"} logged sadhana today 🔥
          </span>
          <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors shrink-0" />
        </Link>
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
            <div className="flex justify-center py-2">
              <CompletionRing percent={completionPercent} score={entry.score ?? 0} />
            </div>

            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {infoChips.map((chip, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-ink bg-bg-elevated rounded-full px-3 py-1.5"
                >
                  <chip.icon className="w-3.5 h-3.5 text-gold" />
                  {chip.label}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-2 flex-wrap justify-center">
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
            </div>

            <div className="text-center mt-3">
              <Link href="/entry" className="text-xs text-ink-muted hover:text-ink underline">
                Edit today's entry
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
          {monthDays.map((d) =>
            d.isFuture ? (
              <div
                key={d.day}
                className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium"
                style={{ background: "rgba(180,83,9,0.05)", color: "#B45309" }}
              >
                {d.day}
              </div>
            ) : (
              <Link
                key={d.day}
                href={`/entry?date=${d.dateStr}`}
                className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-transform active:scale-90"
                style={{
                  background: d.logged ? "linear-gradient(135deg, #EA580C, #FBBF24)" : "rgba(180,83,9,0.12)",
                  color: d.logged ? "#FFF8EC" : "#B45309",
                  outline: d.isToday ? "2px solid #D97706" : "none",
                  outlineOffset: "-2px",
                }}
              >
                {d.day}
              </Link>
            )
          )}
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