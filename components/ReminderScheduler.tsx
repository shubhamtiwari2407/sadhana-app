"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LAST_FIRED_KEY = "sadhana_reminder_last_fired";

async function fireNotification() {
  const options: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
    body: "Have you logged today's sadhana yet?",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "sadhana-daily-reminder", // replaces any existing reminder instead of stacking
    renotify: true, // re-vibrates/alerts even if a previous reminder is still showing
    requireInteraction: true, // stays in the notification shade until the person taps/dismisses it
    vibrate: [200, 100, 200, 100, 200],
  };

  // Vibration and requireInteraction only work through a service worker's
  // showNotification() — the plain `new Notification()` constructor silently
  // ignores both on most browsers. Since this is a PWA, a service worker is
  // already registered, so we route through it.
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Sadhana Circle", options);
      return;
    } catch {
      // fall through to the plain constructor below
    }
  }

  new Notification("Sadhana Circle", options);
}

export default function ReminderScheduler() {
  useEffect(() => {
    const supabase = createClient();
    let interval: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("reminder_enabled, reminder_time")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!profile?.reminder_enabled || !profile.reminder_time) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const check = () => {
        const now = new Date();
        const nowHHMM = now.toTimeString().slice(0, 5);
        const todayStr = now.toISOString().slice(0, 10);
        const lastFired = localStorage.getItem(LAST_FIRED_KEY);

        if (nowHHMM === profile.reminder_time && lastFired !== todayStr) {
          fireNotification();
          localStorage.setItem(LAST_FIRED_KEY, todayStr);
        }
      };

      check();
      interval = setInterval(check, 60_000);
    })();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return null;
}