import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFF9F2",
        "bg-elevated": "#FDECD1",
        "bg-card": "#FFFFFF",
        ink: "#6B3E26",
        "ink-muted": "#9A6C3A",
        gold: "#D97706",
        "gold-soft": "#D4AF37",
        tulsi: "#4D7C4A",
        saffron: "#F97316",
        peacock: "#C2410C",
        "peacock-deep": "#9A3412",
        "peacock-light": "#F59E0B",
      },
      fontFamily: {
        display: ["var(--font-marcellus)", "serif"],
        body: ["var(--font-nunito)", "sans-serif"],
        numeric: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        card: "22px",
      },
    },
  },
  plugins: [],
};
export default config;