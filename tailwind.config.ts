import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          black: "#000000",
          white: "#ffffff",
          gray: "#f5f5f7",
          text: "#1d1d1f",
          blue: "#0071e3",
          "link-blue": "#0066cc",
          "bright-blue": "#2997ff",
          "dark-surface-1": "#272729",
          "dark-surface-2": "#262628",
          "dark-surface-3": "#28282a",
        },
      },
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Icons",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        "980px": "980px",
      },
      borderRadius: {
        pill: "980px",
      },
      boxShadow: {
        card: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0px",
      },
    },
  },
  plugins: [],
};
export default config;
