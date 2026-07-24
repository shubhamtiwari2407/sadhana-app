"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Edit3, Trophy, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/entry", label: "Log", icon: Edit3 },
  { href: "/board", label: "Board", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm flex justify-around items-center py-2.5 px-2 z-50 rounded-full"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(212, 175, 55, 0.35)",
        boxShadow: "0 12px 32px rgba(107, 62, 38, 0.16), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-3 py-1 transition-colors"
          >
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all"
              style={{
                background: active ? "linear-gradient(135deg, #F97316, #D4AF37)" : "transparent",
                boxShadow: active ? "0 4px 14px rgba(249, 115, 22, 0.45)" : "none",
              }}
            >
              <Icon
                className="transition-all"
                style={{
                  width: active ? 20 : 18,
                  height: active ? 20 : 18,
                  color: active ? "#FFF9F2" : "#9A6C3A",
                }}
                strokeWidth={active ? 2.4 : 1.8}
              />
            </span>
            <span className={`text-[10px] ${active ? "text-gold font-semibold" : "text-ink-muted"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}