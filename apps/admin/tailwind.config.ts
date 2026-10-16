import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#070709",
          900: "#0B0B0E",
          850: "#101015",
          800: "#16161C",
          700: "#1E1E26",
          600: "#2A2A38",
        },
        gold: {
          300: "#EAD392",
          400: "#D8B36E",
          500: "#C5A059",
          600: "#A8833B",
          900: "#3D2F15",
        },
        celestial: {
          ivory: "#F5F5F0",
          silver: "#9D9DA8",
          muted: "#666675",
        },
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "Cinzel", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(197, 160, 89, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
