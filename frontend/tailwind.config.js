/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        leaf: {
          50: "#f4faf3",
          100: "#e3f2e0",
          500: "#3d7a4a",
          700: "#2a5c36",
          900: "#1a3d24",
        },
      },
    },
  },
  plugins: [],
};
