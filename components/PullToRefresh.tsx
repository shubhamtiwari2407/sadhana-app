"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const pulling = useRef(false);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isPending) {
        touchStartY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || touchStartY.current === null) return;
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0 && window.scrollY === 0) {
        const dampened = Math.min(delta * 0.5, MAX_PULL);
        pullDistanceRef.current = dampened;
        setPullDistance(dampened);
        if (delta > 10 && e.cancelable) e.preventDefault();
      } else {
        pulling.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      touchStartY.current = null;
      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        startTransition(() => {
          router.refresh();
        });
        setTimeout(() => {
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }, 500);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPending, router]);

  const showIndicator = pullDistance > 0 || isPending;
  const readyToRelease = pullDistance >= PULL_THRESHOLD;
  const rotation = Math.min((pullDistance / PULL_THRESHOLD) * 360, 360);

  return (
    <div ref={containerRef}>
      <div
        className="flex flex-col items-center justify-end overflow-hidden"
        style={{
          height: isPending ? 50 : pullDistance,
          transition: pulling.current ? "none" : "height 0.2s ease",
        }}
      >
        {showIndicator && (
          <div className="flex flex-col items-center gap-1 pb-2">
            <RefreshCw
              className={`w-5 h-5 text-gold-soft ${isPending ? "animate-spin" : ""}`}
              style={!isPending ? { transform: `rotate(${rotation}deg)` } : undefined}
            />
            <span className="text-[10px] text-ink-muted">
              {isPending ? "Refreshing…" : readyToRelease ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}