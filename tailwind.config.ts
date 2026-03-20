import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lucy: {
          charcoal: '#2D3436',
          sage: '#7B9E87',
          blush: '#E8B4B8',
          cream: '#FAF8F5',
          gold: '#C8A96E',
          grey: '#8B8B8B',
        }
      }
    },
  },
  plugins: [],
};
export default config;
