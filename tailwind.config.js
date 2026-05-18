/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050508",
        surface: "rgba(255,255,255,0.03)",
        purple: "#7B3FE4",
        accent: "#FF6B2B",
        muted: "rgba(255,255,255,0.6)",
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      keyframes: {
        "sos-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.02)", opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "sos-pulse": "sos-pulse 2s ease-in-out infinite",
        "fade-up": "fade-up 250ms ease-out both",
      },
    },
  },
  plugins: [],
};
