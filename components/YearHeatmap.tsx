const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };
const TOTAL_WEEKS = 53;
const CELL = 11; // px
const GAP = 3; // px

function scoreToLevel(score: number | undefined): number {
  if (score === undefined) return 0;
  if (score <= 0) return 0;
  if (score < 16) return 1;
  if (score < 36) return 2;
  if (score < 56) return 3;
  return 4;
}

const LEVEL_COLOR = [
  "rgba(212,175,55,0.10)", // 0 - not logged
  "rgba(249,115,22,0.35)", // 1
  "rgba(249,115,22,0.6)", // 2
  "linear-gradient(135deg, #F97316, #D4AF37)", // 3
  "linear-gradient(135deg, #EA580C, #D4AF37)", // 4 - deepest gold
];

export default function YearHeatmap({ scoreByDate }: { scoreByDate: Map<string, number> }) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());

  const gridStart = new Date(currentSunday);
  gridStart.setDate(currentSunday.getDate() - (TOTAL_WEEKS - 1) * 7);

  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      return date;
    })
  );

  // month label sits above the first week column where that month begins
  let lastLabeledMonth = -1;
  const monthLabels = weeks.map((week) => {
    const firstOfMonth = week.find((d) => d.getDate() === 1);
    if (firstOfMonth && firstOfMonth.getMonth() !== lastLabeledMonth) {
      lastLabeledMonth = firstOfMonth.getMonth();
      return MONTH_NAMES[firstOfMonth.getMonth()];
    }
    return null;
  });

  const gridWidth = TOTAL_WEEKS * (CELL + GAP);

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
                  const dateStr = date.toISOString().slice(0, 10);
                  const isFuture = dateStr > todayStr;
                  const level = isFuture ? -1 : scoreToLevel(scoreByDate.get(dateStr));
                  return (
                    <div
                      key={d}
                      title={isFuture ? undefined : dateStr}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        background: isFuture ? "transparent" : LEVEL_COLOR[level],
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 mt-3" style={{ marginLeft: 28 }}>
          <span className="text-[10px] text-ink-muted mr-1">Less</span>
          {LEVEL_COLOR.map((color, i) => (
            <div key={i} style={{ width: CELL, height: CELL, borderRadius: 3, background: color }} />
          ))}
          <span className="text-[10px] text-ink-muted ml-1">More</span>
        </div>
      </div>
    </div>
  );
}