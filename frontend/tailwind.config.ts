import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Brand palette remap to keep existing utility classes aligned with miCoach look & feel */
        amber: {
          50: "#ecfdf8",
          100: "#d1faef",
          200: "#a7f3df",
          300: "#6ee7c8",
          400: "#2dd4b0",
          500: "#04A28F",
          600: "#038A7A",
          700: "#036E62",
          800: "#06584f",
          900: "#0b4a44",
          950: "#042c2a",
        },
        violet: {
          50: "#edf3ff",
          100: "#dbe8ff",
          200: "#bed4ff",
          300: "#94b8ff",
          400: "#5f92ff",
          500: "#2b70ff",
          600: "#0057F0",
          700: "#0048c5",
          800: "#003a9e",
          900: "#123b6b",
          950: "#0a2545",
        },
        rose: {
          50: "#fff9ec",
          100: "#fff1d2",
          200: "#ffe3a4",
          300: "#ffd571",
          400: "#FDC86E",
          500: "#f3b35b",
          600: "#d6933f",
          700: "#ad7331",
          800: "#885a2c",
          900: "#704b27",
          950: "#3f2817",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
