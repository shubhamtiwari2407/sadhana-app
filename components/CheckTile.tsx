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
      className="relative flex flex-col items-center justify-center gap-1.5 aspect-square rounded-xl border p-2 text-center transition-colors"
      style={{
        background: checked ? "linear-gradient(135deg, #EA580C, #FBBF24)" : "#FFFFFF",
        borderColor: checked ? "transparent" : "rgba(217,119,6,0.3)",
      }}
    >
      {checked && (
        <span className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5">
          <Check className="w-3 h-3 text-saffron" strokeWidth={3} />
        </span>
      )}
      <Icon className="w-5 h-5" style={{ color: checked ? "#FFF8EC" : "#B45309" }} />
      <span
        className="text-[11px] font-medium leading-tight"
        style={{ color: checked ? "#FFF8EC" : "#5B3A0F" }}
      >
        {label}
      </span>
    </button>
  );
}