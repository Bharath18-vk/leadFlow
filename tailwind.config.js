/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#3b82f6",
        background: "#ffffff",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          light: '#DCF8C6',
          hover: '#20ba5a',
        },
      },
    },
  },
  plugins: [],
}
