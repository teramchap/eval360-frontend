/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef3ff",
          100: "#dce6ff",
          400: "#5b83e0",
          500: "#3d63c9",
          600: "#2e4fa8",
          700: "#233d85",
        },
        mint: {
          50: "#e9fbf3",
          400: "#34c78a",
          500: "#1fa971",
        },
        plum: {
          50: "#f3ecff",
          400: "#8b5cf6",
          500: "#7440e8",
        },
        amber: {
          50: "#fff7e6",
          400: "#f5a524",
        },
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(45, 70, 140, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
