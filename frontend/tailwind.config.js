/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--text)',
        'foreground-heading': 'var(--text-h)',
        border: 'var(--border)',
        code: 'var(--code-bg)',
        accent: {
          DEFAULT: 'var(--accent)',
          bg: 'var(--accent-bg)',
          border: 'var(--accent-border)',
        },
        social: 'var(--social-bg)',
      },
      fontFamily: {
        sans: 'var(--sans)',
        heading: 'var(--heading)',
        mono: 'var(--mono)',
      },
      boxShadow: {
        theme: 'var(--shadow)',
      },
    },
  },
  plugins: [],
}


