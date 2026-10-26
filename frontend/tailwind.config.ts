import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#090b0a", panel: "#111512", line: "#242a25", acid: "#c7ff4a", muted: "#9ba69d" }, boxShadow: { glow: "0 0 48px rgba(199,255,74,.10)" } } },
  plugins: [],
};
export default config;
