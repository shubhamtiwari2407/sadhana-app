"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toLocalISODate } from "@/lib/date";
const COLUMNS = [
  "entry_date",
  "wake_time",
  "sleep_time",
  "rounds_chanted",
  "reading_minutes",
  "listening_minutes",
  "mangal_aarti",
  "seva",
  "srimad_bhagavatam",
  "score",
] as const;

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportDataButton({ userId }: { userId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sadhana_entries")
      .select(COLUMNS.join(","))
      .eq("user_id", userId)
      .order("entry_date", { ascending: true });

    setLoading(false);
    if (error || !data) return;

    const header = COLUMNS.join(",");
    const rows = data.map((row: any) => COLUMNS.map((col) => toCsvValue(row[col])).join(","));
    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sadhana-history-${toLocalISODate(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="card flex items-center justify-between p-4 w-full text-left hover:border-gold/40 disabled:opacity-60"
    >
      <span className="flex items-center gap-2 text-ink">
        <Download className="w-4 h-4 text-gold" /> {loading ? "Preparing…" : "Export my data (CSV)"}
      </span>
    </button>
  );
}