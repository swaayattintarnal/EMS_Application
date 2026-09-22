/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
    extend: {
      colors: {
        // Based on the image
        'primary-purple': '#5B21B6', 
        'secondary-purple': '#7C3AED', 
        'light-purple-bg': '#EDE9FE', 
        'text-dark': '#333333', 
        'text-light': '#F5F5F5', 
        'border-light': '#D1D5DB', 
        'custom-indigo': '#2c3459', 
        'custom-purple': '#944be1'
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', 
      }
    },
  },
  plugins: [],
};
