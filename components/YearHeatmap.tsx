import { toLocalISODate } from "@/lib/date";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };
const CELL = 11; // px
const GAP = 3; // px

const LOGGED_FILL = "linear-gradient(135deg, #F97316, #D4AF37)";
const EMPTY_FILL = "rgba(212,175,55,0.10)";

export default function YearHeatmap({
  year,
  scoreByDate,
}: {
  year: number;
  scoreByDate: Map<string, number>;
}) {
  const todayStr = toLocalISODate(new Date());
  const loggedDates = new Set(scoreByDate.keys());

  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  // pad out to full weeks (Sun-Sat) so the grid starts/ends cleanly
  const gridStart = new Date(jan1);
  gridStart.setDate(jan1.getDate() - jan1.getDay());
  const gridEnd = new Date(dec31);
  gridEnd.setDate(dec31.getDate() + (6 - dec31.getDay()));

  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1;
  const totalWeeks = totalDays / 7;

  const weeks = Array.from({ length: totalWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      return date;
    })
  );

  // month label sits above the first week column where that month begins
  let lastLabeledMonth = -1;
  const monthLabels = weeks.map((week) => {
    const firstOfMonth = week.find((d) => d.getFullYear() === year && d.getDate() === 1);
    if (firstOfMonth && firstOfMonth.getMonth() !== lastLabeledMonth) {
      lastLabeledMonth = firstOfMonth.getMonth();
      return MONTH_NAMES[firstOfMonth.getMonth()];
    }
    return null;
  });

  const gridWidth = totalWeeks * (CELL + GAP);

  return (
    <div className="overflow-x-auto -mx-1 px-1" style={{ WebkitOverflowScrolling: "touch" }}>
      <div style={{ width: gridWidth + 28 }}>
        <div className="flex" style={{ marginLeft: 28 }}>
          {monthLabels.map((label, i) => (
            <div key={i} style={{ width: CELL + GAP, position: "relative" }}>
              {label && (
                <span
                  className="absolute text-[10px] text-ink-muted whitespace-nowrap"
                  style={{ left: 0, top: 0 }}
                >
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex mt-4">
          <div className="flex flex-col justify-between" style={{ width: 24, height: 7 * (CELL + GAP) - GAP }}>
            {Array.from({ length: 7 }, (_, d) => (
              <span key={d} className="text-[9px] text-ink-muted leading-none" style={{ height: CELL }}>
                {DAY_LABELS[d] ?? ""}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((date, d) => {
                  const dateStr = toLocalISODate(date);
                  const outsideYear = date.getFullYear() !== year;
                  const isFuture = dateStr > todayStr;
                  const logged = loggedDates.has(dateStr);
                  const hidden = outsideYear || isFuture;
                  return (
                    <div
                      key={d}
                      title={hidden ? undefined : dateStr}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        background: hidden ? "transparent" : logged ? LOGGED_FILL : EMPTY_FILL,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-ink-muted" style={{ marginLeft: 28 }}>
          <span className="flex items-center gap-1.5">
            <span style={{ width: CELL, height: CELL, borderRadius: 3, background: LOGGED_FILL, display: "inline-block" }} />
            Logged
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: CELL, height: CELL, borderRadius: 3, background: EMPTY_FILL, display: "inline-block" }} />
            Missed
          </span>
        </div>
      </div>
    </div>
  );
}