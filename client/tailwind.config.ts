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
        surface: "#F1ECE6",
        ink: "#1A1A1A",
        "ink-secondary": "#555555",
        // Primary accent — Dusty Rose
        accent: "#C08497",
        "accent-teal": "#5E8B7E",
        "accent-terra": "#C46A4A",
        "accent-lavender": "#8E7DBE",
        // Muted accent for placeholder / secondary text
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
        "fade-in": "fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in-up": "fadeInUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in-up-card": "fadeInUpCard 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "shimmer": "shimmer 1.5s infinite linear",
      },
      transitionTimingFunction: {
        "subtle": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUpCard: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
