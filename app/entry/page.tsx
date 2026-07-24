import { Suspense } from "react";
import EntryForm from "@/components/EntryForm";

export default function EntryPage() {
  return (
    <Suspense fallback={<p className="text-ink-muted text-center py-16">Loading…</p>}>
      <EntryForm />
    </Suspense>
  );
}