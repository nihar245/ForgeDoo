/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Columbia Beached Palette
        columbia: {
          deep: '#003366',      // Deep Blue
          sky: '#3399CC',       // Sky Blue
          sand: '#F4E1C6',      // Soft Sand
          coral: '#FF6F61',     // Warm Coral
          seafoam: '#88B04B',   // Seafoam Green
          gray: '#E5E5E5',      // Neutral Gray
          red: '#CC3333'        // Destructive Red
        },
        // Semantic aliases for easier usage in classnames
        primary: {
          DEFAULT: '#3399CC',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#003366',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#FF6F61',
          foreground: '#ffffff',
        },
        positive: {
          DEFAULT: '#88B04B',
          foreground: '#ffffff',
        },
        neutral: {
          DEFAULT: '#E5E5E5',
          foreground: '#111827',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.9)',
          medium: 'rgba(248, 250, 252, 0.95)',
          dark: 'rgba(248, 250, 252, 0.8)',
        },
        neomorphism: {
          light: '#f8f9fa',
          shadow: '#e9ecef',
          highlight: '#ffffff',
        }
      },
      backdropBlur: {
        'glass': '16px',
      },
      boxShadow: {
        'glass': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'neomorphism': '8px 8px 16px #e9ecef, -8px -8px 16px #ffffff',
        'neomorphism-inset': 'inset 6px 6px 12px #e9ecef, inset -6px -6px 12px #ffffff',
        'glow': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.6)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}