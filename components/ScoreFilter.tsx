"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

const MONTHS = [
  { value: "all", label: "All months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function ScoreFilter({
  year,
  month,
  years,
}: {
  year: string;
  month: string;
  years: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: "year" | "month", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/board?${params.toString()}`);
  };

  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? "All months";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-ink">Filter scoreboard</h2>
        <Calendar className="w-4 h-4 text-gold" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Year</span>
          <select
            value={year}
            onChange={(e) => update("year", e.target.value)}
            className="w-full rounded-xl border border-gold/30 bg-white/70 backdrop-blur-sm px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Month</span>
          <select
            value={month}
            onChange={(e) => update("month", e.target.value)}
            className="w-full rounded-xl border border-gold/30 bg-white/70 backdrop-blur-sm px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-ink-muted mt-3">
        Showing the {monthLabel} {year} scoreboard
      </p>
    </div>
  );
}