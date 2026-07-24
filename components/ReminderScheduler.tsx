"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LAST_FIRED_KEY = "sadhana_reminder_last_fired";

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
          new Notification("Sadhana Circle", {
            body: "Have you logged today's sadhana yet?",
            icon: "/icons/icon-192.png",
          });
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