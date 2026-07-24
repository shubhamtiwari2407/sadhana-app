const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function YearHeatmap({
  year,
  loggedDates,
}: {
  year: number;
  loggedDates: Set<string>;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      {MONTH_NAMES.map((name, monthIdx) => {
        const total = daysInMonth(year, monthIdx);
        const monthStart = new Date(year, monthIdx, 1);
        const leadingBlanks = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
        const loggedCount = Array.from({ length: total }, (_, i) => {
          const dateStr = new Date(year, monthIdx, i + 1).toISOString().slice(0, 10);
          return loggedDates.has(dateStr);
        }).filter(Boolean).length;

        return (
          <div key={name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-ink">{name}</span>
              <span className="text-[10px] text-ink-muted font-numeric">{loggedCount}/{total}</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: total }, (_, i) => {
                const dateStr = new Date(year, monthIdx, i + 1).toISOString().slice(0, 10);
                const logged = loggedDates.has(dateStr);
                const isFuture = dateStr > todayStr;
                return (
                  <div
                    key={i}
                    className="aspect-square rounded"
                    style={{
                      background: logged
                        ? "linear-gradient(135deg, #F97316, #D4AF37)"
                        : isFuture
                        ? "rgba(212,175,55,0.04)"
                        : "rgba(212,175,55,0.12)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}