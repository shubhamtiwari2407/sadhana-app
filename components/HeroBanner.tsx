import Image from "next/image";

export default function HeroBanner() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-3 rounded-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.5) 0%, rgba(249,115,22,0.22) 45%, transparent 70%)",
          filter: "blur(20px)",
          animation: "heroGlow 5s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="group rounded-card overflow-hidden relative"
        style={{
          height: "22rem",
          boxShadow: "0 20px 44px rgba(107,62,38,0.22), 0 2px 8px rgba(107,62,38,0.12)",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
      >
        <Image
          src="/hero-krishna.jpg"
          alt="Radha Krishna"
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-active:scale-105"
          style={{ objectPosition: "center 35%" }}
          priority
        />
      </div>
    </div>
  );
}