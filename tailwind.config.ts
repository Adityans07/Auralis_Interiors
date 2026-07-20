import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Warm neutral luxury palette
        sand: {
          50: "#faf8f5",
          100: "#f3ede4",
          200: "#e7dccd",
          300: "#d8c6ae",
          400: "#c3a982",
          500: "#b3925f",
          600: "#a07d4e",
          700: "#856442",
          800: "#6d523a",
          900: "#5b4531",
        },
        ink: {
          50: "#f6f6f5",
          100: "#e7e7e4",
          200: "#c9c9c2",
          300: "#a3a399",
          400: "#7c7c70",
          500: "#616156",
          600: "#4b4b43",
          700: "#3b3b35",
          800: "#26251f",
          900: "#161512",
          950: "#0c0b09",
        },
        gold: {
          DEFAULT: "#c3a06a",
          light: "#d9bd8c",
          dark: "#a17f4a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(38, 37, 31, 0.18)",
        glow: "0 0 40px -8px rgba(195, 160, 106, 0.55)",
      },
      backgroundImage: {
        "luxury-radial":
          "radial-gradient(circle at 20% 20%, rgba(195,160,106,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(120,90,180,0.12), transparent 40%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(195,160,106,0.55)" },
          "50%": { boxShadow: "0 0 30px 6px rgba(195,160,106,0.55)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
