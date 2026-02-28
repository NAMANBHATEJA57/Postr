import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./themes/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linen: "#F8F4EF",
        ink: "#1A1A1A",
        "ink-secondary": "#555555",
        accent: "#A6998D",
        "accent-muted": "#C7C0B8",
        divider: "#E1DCD7",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        handwritten: ["var(--font-caveat)", "cursive"],
      },
      fontSize: {
        "h1": ["3rem", { lineHeight: "1.4", fontWeight: "600" }],
        "h2": ["2.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
      },
      spacing: {
        "4": "1rem",
        "8": "2rem",
        "10": "2.5rem",
        "16": "4rem",
        "24": "6rem",
        "40": "10rem",
        "64": "16rem",
      },
      maxWidth: {
        postcard: "640px",
      },
      letterSpacing: {
        ui: "0.04em",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
