"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="card flex items-center justify-between p-4 w-full text-left hover:border-saffron/40"
    >
      <span className="flex items-center gap-2 text-ink">
        <LogOut className="w-4 h-4 text-saffron" /> Sign out
      </span>
    </button>
  );
}
