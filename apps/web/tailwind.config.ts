import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#080A0C",
        asphalt: "#111418",
        charcoal: "#1A1E23",
        steel: "#2A3037",
        smog: "#8B949E",
        bone: "#E8E2D5",
        soft: "#F4F1EA",
        madrid: "#C60B1E",
        star: "#FFFFFF",
        lime: "#D8FF4F",
        no2: "#FFB000",
        o3: "#8B5CF6",
        pm10: "#C2410C",
        pm25: "#B6FF3B",
        so2: "#22D3EE",
        co: "#F0ABFC",
        no: "#F97316",
        nox: "#FB7185",
      },
      fontFamily: {
        "logo-heavy": ["var(--font-logo-heavy)", "Impact", "sans-serif"],
        "logo-script": ["var(--font-logo-script)", "cursive"],
        ui: ["var(--font-ui)", "sans-serif"],
        data: ["var(--font-data)", "monospace"],
      },
      screens: {
        xs: "360px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1800px",
        "4xl": "2200px",
        "mobile-landscape": { raw: "(max-height: 520px) and (orientation: landscape)" },
        "tablet-portrait": {
          raw: "(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)",
        },
        "tablet-landscape": {
          raw: "(min-width: 1024px) and (max-width: 1279px) and (orientation: landscape)",
        },
        "pointer-coarse": { raw: "(pointer: coarse)" },
        "pointer-fine": { raw: "(pointer: fine)" },
        "reduced-motion": { raw: "(prefers-reduced-motion: reduce)" },
        "high-contrast": { raw: "(prefers-contrast: more)" },
      },
      boxShadow: {
        atmosphere: "0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 80px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        halo: "radial-gradient(circle at center, rgba(216, 255, 79, 0.22), rgba(216, 255, 79, 0))",
      },
      animation: {
        float: "float 18s ease-in-out infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite",
        drift: "drift 20s linear infinite",
        scrollDot: "scrollDot 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.38", transform: "scale(1)" },
          "50%": { opacity: "0.74", transform: "scale(1.08)" },
        },
        drift: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-120px, 0, 0)" },
        },
        scrollDot: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "70%": { transform: "translateY(8px)", opacity: "0.3" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
