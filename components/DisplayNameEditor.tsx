"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DisplayNameEditor({
  userId,
  initialName,
}: {
  userId: string;
  initialName: string;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: trimmed }).eq("id", userId);
    setSaving(false);
    setEditing(false);
    window.location.reload(); // simplest way to refresh every server-rendered spot showing the name
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-gold-soft hover:text-gold mt-1"
      >
        <Pencil className="w-3 h-3" /> Edit name
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        className="text-sm text-center"
        autoFocus
      />
      <button
        onClick={save}
        disabled={saving}
        className="p-1.5 rounded-full bg-tulsi/15 text-tulsi disabled:opacity-50"
        aria-label="Save name"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setName(initialName);
          setEditing(false);
        }}
        className="p-1.5 rounded-full bg-saffron/10 text-saffron"
        aria-label="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}