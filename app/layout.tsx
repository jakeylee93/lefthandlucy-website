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
const ANYOS_SETTINGS = {
  groups: [
    {
      id: "colours",
      label: "Colours",
      settings: [
        { cssVar: "--lucy-sage", label: "Primary", type: "color", default: "#7B9E87" },
        { cssVar: "--lucy-gold", label: "Accent", type: "color", default: "#C8A96E" },
        { cssVar: "--lucy-charcoal", label: "Text", type: "color", default: "#2D3436" },
        { cssVar: "--lucy-cream", label: "Background", type: "color", default: "#FAF8F5" },
      ],
    },
    {
      id: "layout",
      label: "Layout",
      settings: [
        { cssVar: "--section-space", label: "Section spacing", type: "range", min: 40, max: 160, step: 4, unit: "px", default: 80 },
      ],
    },
    {
      id: "slider",
      label: "Slider",
      settings: [
        {
          cssVar: "--carousel-ms",
          label: "Slider speed",
          type: "select",
          default: "6000",
          options: [
            { label: "Slow", value: "9000" },
            { label: "Normal", value: "6000" },
            { label: "Fast", value: "3500" },
          ],
        },
      ],
    },
  ],
};

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
