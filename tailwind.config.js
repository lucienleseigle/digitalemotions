/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        darkGray: '#0b0c10',
        mysticYellow: '#ffba08',
        accentBlue: '#1f77ff',
        accentRed: '#e63946',
        lightGray: '#f5f5f5',
        // Optionnel : pour un gris intermédiaire dans vos dégradés
        shadowGray: '#141414',
      },
      boxShadow: {
        'inner-glow': 'inset 0 0 10px rgba(255, 255, 255, 0.2)',
      },
      fontFamily: {
        // Assurez-vous d’avoir bien importé votre police, par ex. via Google Fonts
        custom: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
