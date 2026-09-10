import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Left Hand Lucy — A trusted hand for life's busy corners",
  description: "Event planning, English lessons, and project support in Madrid. Lucy brings calm structure and thoughtful creativity to everything she does.",
};

// anyOS Site Settings — read by edit.js to render the "Site Settings" panel.
// Each setting maps to a CSS custom property on :root (globals.css); edit.js
// hydrates saved overrides via document.documentElement.style.setProperty(cssVar, value)
// and fires "anyos:settings-changed" so JS consumers (the carousels) re-read live.
const ANYOS_SETTINGS = [
    {
      id: "colours",
      label: "Colours",
      settings: [
        { cssVar: "--lucy-sage", label: "Primary", type: "color", default: "#436c57" },
        { cssVar: "--lucy-gold", label: "Accent", type: "color", default: "#94713b" },
        { cssVar: "--lucy-charcoal", label: "Text", type: "color", default: "#273d35" },
        { cssVar: "--lucy-cream", label: "Background", type: "color", default: "#faf8f3" },
      ],
    },
    {
      id: "layout",
      label: "Layout",
      settings: [
        { cssVar: "--section-space", label: "Section spacing", type: "range", min: 24, max: 120, step: 4, unit: "px", default: 72 },
        { cssVar: "--heading-size", label: "Hero title", type: "range", min: 36, max: 100, step: 2, unit: "px", default: 68 },
        { cssVar: "--hero-image-height", label: "Hero height", type: "range", min: 400, max: 900, step: 20, unit: "px", default: 620 },
        { cssVar: "--button-radius", label: "Button corners", type: "range", min: 0, max: 30, step: 2, unit: "px", default: 8 },
        { cssVar: "--card-radius", label: "Card corners", type: "range", min: 0, max: 40, step: 2, unit: "px", default: 16 },
      ],
    },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Declared before edit.js loads so the Site Settings panel can render from it. */}
        <script dangerouslySetInnerHTML={{ __html: `window.ANYOS_SETTINGS = ${JSON.stringify(ANYOS_SETTINGS)};` }} />
      </head>
      <body>
        {children}
        {/* anyOS live-edit: hydrates data-anyos text / data-anyos-img images + click-to-edit from the anyOS Website module. */}
        <Script src="https://platform.anyos.co.uk/edit.js?v=6" data-site="left-hand-lucy" strategy="afterInteractive" />
      </body>
    </html>
  );
}
