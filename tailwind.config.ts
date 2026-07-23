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
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F3E5AB",
          dark: "#AA8022",
        },
        // Premium Dark Mode / Cinema Colors
        void: "#020203",
        base: "#050506",
        elevated: "#0a0a0c",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontSize: {
        "display-large": "clamp(3rem, 10vw, 12rem)", // Exaggerated minimalism
        "display-medium": "clamp(2.5rem, 8vw, 8rem)",
        "display-small": "clamp(2rem, 5vw, 5rem)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
        "pill": "9999px",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(0, 0, 0, 0.1)",
        glow: "0 0 40px -8px rgba(212, 175, 55, 0.35)", // Gold glow
        "glass-inset": "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.01) 100%)",
        "dark-gradient": "linear-gradient(to bottom, #0a0a0f, #020203)",
        "luxury-radial": "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.05), transparent 40%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0.4)" },
          "50%": { boxShadow: "0 0 30px 6px rgba(212,175,55,0.4)" },
        },
        "image-reveal": {
          "0%": { clipPath: "inset(100% 0 0 0)" },
          "100%": { clipPath: "inset(0 0 0 0)" },
        }
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 1s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "image-reveal": "image-reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards",
      },
      transitionTimingFunction: {
        "luxury": "cubic-bezier(0.16, 1, 0.3, 1)",
        "smooth": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
