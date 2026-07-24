const REFLECTIONS = [
  { text: "Every round chanted with attention is a step closer to the heart.", source: "Daily reflection" },
  { text: "Consistency in small acts of devotion outweighs occasional grand ones.", source: "Daily reflection" },
  { text: "A quiet morning practice sets the tone the whole day follows.", source: "Daily reflection" },
  { text: "Service offered without expectation is its own reward.", source: "Daily reflection" },
  { text: "Reading a little each day builds understanding that lasts a lifetime.", source: "Daily reflection" },
  { text: "The mind wanders — gently bringing it back is the practice itself.", source: "Daily reflection" },
  { text: "Waking before the world does gives the day a head start on peace.", source: "Daily reflection" },
];

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function QuoteCard({ bare = false }: { bare?: boolean }) {
  const reflection = REFLECTIONS[dayOfYear() % REFLECTIONS.length];

  if (bare) {
    return (
      <div>
        <p className="text-sm italic text-ink/90">{reflection.text}</p>
        <p className="text-xs text-ink-muted mt-1.5 text-right">— {reflection.source}</p>
      </div>
    );
  }

  return (
    <div className="card p-4 bg-gradient-to-br from-peacock/20 to-gold/10">
      <p className="text-sm italic text-ink">{reflection.text}</p>
      <p className="text-xs text-ink-muted mt-2 text-right">— {reflection.source}</p>
    </div>
  );
}