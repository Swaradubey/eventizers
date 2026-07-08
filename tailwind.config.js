/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./invitehub/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./invitehub/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./invitehub/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        ivory: "#FAF8F5",
        "deep-plum": "#2D1B3D",
        "soft-gold": "#C9A84C",
        "rose-blush": "#E8C4B8",
        "sage": "#7A9E7E",
        "ink": "#1A1118",
        "mist": "#F0EBE8",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-med": "float 4s ease-in-out infinite 1s",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
