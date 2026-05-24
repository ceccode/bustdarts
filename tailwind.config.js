/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        score: ['Bebas Neue', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'bg-base': 'rgb(var(--bg-base) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
        'bg-input': 'rgb(var(--bg-input) / <alpha-value>)',
        'border-default': 'rgb(var(--border-default) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-dim': 'rgb(var(--accent-dim) / <alpha-value>)',
        'accent-text': 'rgb(var(--accent-text) / <alpha-value>)',
        bust: 'rgb(var(--bust) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}

