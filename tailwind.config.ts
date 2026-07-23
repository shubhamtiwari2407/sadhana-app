import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFF8EC",
        "bg-elevated": "#FDECD1",
        "bg-card": "#FFFFFF",
        ink: "#5B3A0F",
        "ink-muted": "#B45309",
        gold: "#D97706",
        "gold-soft": "#B45309",
        tulsi: "#4D7C4A",
        saffron: "#EA580C",
        peacock: "#C2410C",
        "peacock-deep": "#9A3412",
        "peacock-light": "#F59E0B",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-worksans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
