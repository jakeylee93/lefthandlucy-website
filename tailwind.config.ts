import type { Config } from "tailwindcss";

// Colours resolve from the anyOS-editable CSS variables on :root (globals.css).
// `rgb(from var(...) r g b / <alpha-value>)` keeps opacity modifiers like
// bg-lucy-sage/90 working while the underlying hex var stays editable.
const lucyVar = (name: string) => `rgb(from var(--lucy-${name}) r g b / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lucy: {
          charcoal: lucyVar('charcoal'),
          sage: lucyVar('sage'),
          blush: lucyVar('blush'),
          cream: lucyVar('cream'),
          gold: lucyVar('gold'),
          grey: lucyVar('grey'),
        }
      }
    },
  },
  plugins: [],
};
export default config;
