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
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex justify-around py-2 z-50"
      style={{
        background: "linear-gradient(180deg, #fffaf0 0%, #fdecd1 100%)",
        borderTop: "1px solid rgba(217, 119, 6, 0.25)",
        boxShadow: "0 -4px 16px rgba(180, 83, 9, 0.08)",
      }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
              active ? "text-gold-soft" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
            <span className="text-[11px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
