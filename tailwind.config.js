/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app:     '#0A0A0A',
        sidebar: '#0F172A',
        surface: '#111827',
        border: {
          DEFAULT: '#1F2937',
          strong:  '#374151',
        },
        brand: {
          DEFAULT: '#6366F1', // Indigo
          hover:   '#4F46E5', // Indigo-600
        },
        success: '#22C55E', // Green
        danger:  '#EF4444', // Red
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
