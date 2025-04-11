import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        ersota: ["Ersota", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        primary: "#A100FF", // neon purple
        secondary: "#00FFD1", // vibrant teal
        background: "#1A1A2E", // deep charcoal gray
        "text-primary": "#FFFFFF", // white
        "text-secondary": "#D3D3E5", // lavender gray
        "accent-green": "#39FF14", // neon green
        "accent-blue": "#00C4FF", // electric blue
        "accent-red": "#FF4F4F", // neon red
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #00FFD1, 0 0 10px #00FFD1" },
          "50%": { boxShadow: "0 0 20px #00FFD1, 0 0 30px #00FFD1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        wave: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 2s infinite",
        glow: "glow 2s infinite",
        float: "float 6s ease-in-out infinite",
        spin: "spin 2s linear infinite",
        wave: "wave 15s ease infinite alternate",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to right, #A100FF, #00FFD1)",
        "button-gradient": "linear-gradient(to right, #39FF14, #00C4FF)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
