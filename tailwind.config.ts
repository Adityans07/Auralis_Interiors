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
        // Rich luxury palette with a high-end contrast tone.
        sand: {
          50: "#fbf6f0",
          100: "#f3e8dc",
          200: "#e7d3c3",
          300: "#d4b49a",
          400: "#be9676",
          500: "#a77a57",
          600: "#8d5f42",
          700: "#704d3a",
          800: "#5d3f31",
          900: "#483228",
        },
        ink: {
          50: "#f7f5f3",
          100: "#ece7e4",
          200: "#d2c7c0",
          300: "#b0a29a",
          400: "#8c7a70",
          500: "#6f5f56",
          600: "#51443f",
          700: "#3c322f",
          800: "#292223",
          900: "#131010",
          950: "#080606",
        },
        gold: {
          DEFAULT: "#d6b37a",
          light: "#f1d9ae",
          dark: "#9e7d49",
        },
        twilight: {
          50: "#f2f1f5",
          100: "#dedbe4",
          200: "#c7c1d2",
          300: "#9f93b0",
          400: "#7f7190",
          500: "#635878",
          600: "#4e4561",
          700: "#3f354c",
          800: "#2c2637",
          900: "#18131f",
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
          "radial-gradient(circle at top left, rgba(214,179,122,0.18), transparent 24%), radial-gradient(circle at 80% 8%, rgba(255, 219, 176, 0.12), transparent 20%), radial-gradient(circle at bottom right, rgba(76, 57, 90, 0.14), transparent 22%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(214,179,122,0.35)" },
          "50%": { boxShadow: "0 0 30px 10px rgba(214,179,122,0.35)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "soft-tilt": {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
        float: "float 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.8s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "soft-tilt": "soft-tilt 10s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
