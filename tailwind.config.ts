import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          teal: "#00B3A4",
          ink: "#1E2328",
          coral: "#FF6B6B",
          navy: "#0C202B",
          mist: "#F6F8F9",
        },
        // Solutions page: teal sampled from the approved artwork.
        sx: {
          deep: "#013641",
          mid: "#026164",
          bright: "#0a7a70",
          teal: "#0d7d70",
          tealDark: "#0a5f56",
          mint: "#e0f3f2",
          line: "#dbeceb",
          page: "#f4faf9",
        },
        // Home reference palette, sampled from the approved design.
        hx: {
          ink: "#0b2233",
          copy: "#5a6b7c",
          muted: "#7b8b9a",
          cyan: "#00B3A4",
          cyan2: "#00897E",
          cyanInk: "#009B8E",
          line: "#e2eeec",
          band: "#f5fbfa",
          tint: "#e9f8f6",
        },
        // Products reference palette, sampled from the approved design.
        px: {
          ink: "#0d2438",
          copy: "#55677a",
          muted: "#78889a",
          cyan: "#00B3A4",
          cyan2: "#00897E",
          cyanInk: "#009B8E",
          line: "#e2eeec",
          band: "#f5fbfa",
          band2: "#f1f8fd",
          tint: "#e9f8f6",
          deep: "#00587e",
        },
        // Careers reference palette, sampled from the approved design.
        cx: {
          ink: "#0a1a2c",
          copy: "#57687c",
          muted: "#6d7a8c",
          label: "#46566a",
          cyan: "#00B3A4",
          cyan2: "#00897E",
          cyanInk: "#009B8E",
          line: "#e3ebf1",
          field: "#e2eaf0",
          band: "#f6fafc",
          band2: "#f1f8fb",
          tint: "#f3f9fc",
        },
      },
      boxShadow: {
        apex: "0 24px 70px rgba(30,35,40,.10)",
        teal: "0 18px 48px rgba(0,179,164,.18)",
      },
      keyframes: {
        "apex-float": {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-10px,0)" },
        },
        "apex-pulse": {
          "0%, 100%": { opacity: "0.42", transform: "scale(1)" },
          "50%": { opacity: "0.82", transform: "scale(1.04)" },
        },
      },
      animation: {
        "apex-float": "apex-float 7s ease-in-out infinite",
        "apex-pulse": "apex-pulse 4.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
