import Image from "next/image";

export default function HeroBanner() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-3 rounded-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(234,88,12,0.25) 45%, transparent 70%)",
          filter: "blur(18px)",
          animation: "heroGlow 5s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div className="rounded-2xl overflow-hidden shadow-lg h-[22rem] relative">
        <Image
          src="/hero-krishna.jpg"
          alt="Radha Krishna"
          fill
          className="object-cover"
          style={{ objectPosition: "center 35%" }}
          priority
        />
      </div>
    </div>
  );
}