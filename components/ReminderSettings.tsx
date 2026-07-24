"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ReminderSettings({
  userId,
  initialEnabled,
  initialTime,
}: {
  userId: string;
  initialEnabled: boolean;
  initialTime: string;
}) {
  const supabase = createClient();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime);
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const persist = async (nextEnabled: boolean, nextTime: string) => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ reminder_enabled: nextEnabled, reminder_time: nextTime })
      .eq("id", userId);
    setSaving(false);
  };

  const handleToggle = async () => {
    const next = !enabled;
    if (next && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPermissionDenied(true);
        return;
      }
    }
    setPermissionDenied(false);
    setEnabled(next);
    await persist(next, time);
  };

  const handleTimeChange = async (value: string) => {
    setTime(value);
    if (enabled) await persist(enabled, value);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-ink text-sm">
          {enabled ? <Bell className="w-4 h-4 text-gold" /> : <BellOff className="w-4 h-4 text-ink-muted" />}
          Daily reminder
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={saving}
          className="relative w-11 h-6 rounded-full transition-colors shrink-0"
          style={{ background: enabled ? "#D97706" : "#E7D8C3" }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(212,175,55,0.2)" }}>
          <span className="text-xs text-ink-muted">Remind me at</span>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="text-sm w-auto"
          />
        </div>
      )}

      {permissionDenied && (
        <p className="text-xs text-saffron mt-2">
          Notifications are blocked for this site — enable them in your browser settings to use reminders.
        </p>
      )}

      <p className="text-[11px] text-ink-muted mt-2">
        Vibrates and stays in your notification shade until you dismiss it. Only fires while the app is open in
        a browser tab or installed as a PWA — not a true background push notification. Vibration support varies
        by device and browser.
      </p>
    </div>
  );
}