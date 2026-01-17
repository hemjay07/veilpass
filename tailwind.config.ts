import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E3A8A",
          foreground: "#FAFAFA",
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#FAFAFA",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        // Two-value system for consistency:
        // - lg (12px): cards, modals, large containers
        // - DEFAULT/md (6px): buttons, inputs, small interactive elements
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "var(--radius)",
        DEFAULT: "var(--radius)",
      },
      spacing: {
        // Spacing scale for "breathing room" whitespace (supplements Tailwind's scale)
        // Maps to CSS variables for consistency:
        // - Tailwind 4 = 16px (space-xs)
        // - Tailwind 6 = 24px (space-sm)
        // - Tailwind 8 = 32px (space-md)
        // - Tailwind 12 = 48px (space-lg)
        // - Tailwind 16 = 64px (space-xl)
        // - Tailwind 24 = 96px (space-2xl)
        // These semantic names can be used instead of numeric values:
        "section": "var(--space-xl)",      // 64px - py-section for major sections
        "subsection": "var(--space-lg)",   // 48px - Between subsections
        "card-pad": "var(--space-sm)",     // 24px - Card internal padding
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
