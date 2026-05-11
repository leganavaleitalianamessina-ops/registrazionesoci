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
        lni: {
          blue: "#003366",
          light: "#0055aa",
          accent: "#ffcc00",
        },
      },
    },
  },
  plugins: [],
};
export default config;
