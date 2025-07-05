import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FCE3C1",
          foreground: "#2C2C2C",
        },
        secondary: {
          DEFAULT: "#A3D5FF",
          foreground: "#2C2C2C",
        },
        accent: {
          DEFAULT: "#FFE99E",
          foreground: "#2C2C2C",
        },
        success: {
          DEFAULT: "#C4F4B5",
          foreground: "#2C2C2C",
        },
        destructive: {
          DEFAULT: "#FFB6C1",
          foreground: "#2C2C2C",
        },
        muted: {
          DEFAULT: "#F0F4F8",
          foreground: "#7A7A7A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C2C2C",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C2C2C",
        },
        // Custom TESS colors
        'tess-peach': '#FCE3C1',
        'tess-blue': '#A3D5FF',
        'tess-yellow': '#FFE99E',
        'tess-green': '#C4F4B5',
        'tess-pink': '#FFB6C1',
        'tess-gray': '#F0F4F8',
        'tess-bg': '#FAF6F1',
        'tess-text': '#2C2C2C',
        'tess-text-light': '#7A7A7A',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 0.6s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "bounce-gentle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "glow": {
          "0%": { boxShadow: "0 0 5px rgba(252, 227, 193, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(252, 227, 193, 0.8)" },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-warm': 'linear-gradient(135deg, #FAF6F1 0%, #F0F4F8 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;