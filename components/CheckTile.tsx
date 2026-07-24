"use client";

import { Check } from "lucide-react";
import { LucideIcon } from "lucide-react";

export default function CheckTile({
  checked,
  onChange,
  label,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative flex flex-col items-center justify-center gap-1.5 aspect-square rounded-2xl border p-2 text-center transition-all duration-150 active:scale-90"
      style={{
        background: checked ? "linear-gradient(135deg, #F97316, #D4AF37)" : "rgba(255,255,255,0.7)",
        borderColor: checked ? "transparent" : "rgba(212,175,55,0.35)",
        boxShadow: checked ? "0 6px 16px rgba(249,115,22,0.35)" : "none",
      }}
    >
      {checked && (
        <span className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 check-pop">
          <Check className="w-3 h-3 text-saffron" strokeWidth={3} />
        </span>
      )}
      <Icon className="w-5 h-5" style={{ color: checked ? "#FFF9F2" : "#9A6C3A" }} />
      <span
        className="text-[11px] font-medium leading-tight"
        style={{ color: checked ? "#FFF9F2" : "#6B3E26" }}
      >
        {label}
      </span>
    </button>
  );
}