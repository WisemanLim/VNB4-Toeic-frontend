import type { Config } from "tailwindcss";

// Palette mirrors Guardrails Admin look-and-feel
//   bg #0f172a (slate-900), bg-card #1e293b (slate-800), bg-elev #334155 (slate-700)
//   accent #38bdf8 (sky-400), accent-2 #818cf8 (indigo-400)
//   danger #f87171, success #4ade80, warn #facc15
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#0f172a",
        "bg-card": "#1e293b",
        "bg-elev": "#334155",
        border: "#334155",
        text: "#e2e8f0",
        "text-muted": "#94a3b8",
        accent: "#38bdf8",
        "accent-2": "#818cf8",
        danger: "#f87171",
        success: "#4ade80",
        warn: "#facc15",
        background: "#0f172a",
        foreground: "#e2e8f0",
        primary: "#38bdf8",
        muted: "#334155",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
