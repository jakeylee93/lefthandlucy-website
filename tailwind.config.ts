import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lucy: {
          charcoal: '#32283F',
          sage: '#8B5CF6',
          blush: '#F4B8D8',
          cream: '#FCFAFF',
          gold: '#F4C95D',
          grey: '#8B8B8B',
        }
      }
    },
  },
  plugins: [],
};
export default config;
