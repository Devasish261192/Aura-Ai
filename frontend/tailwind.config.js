/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          accent: "#3B82F6",
          accentHover: "#2563EB",
          text: "#F9FAFB",
          muted: "#9CA3AF"
        }
      }
    },
  },
  plugins: [],
}
