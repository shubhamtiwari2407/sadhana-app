import Image from "next/image";

export default function HeroBanner() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg h-48 relative">
      <Image
  src="/hero-krishna.jpg"
  alt="Radha Krishna"
  fill
  className="object-contain"
  style={{ objectPosition: "center 35%" }}
  priority
/>
    </div>
  );
}
