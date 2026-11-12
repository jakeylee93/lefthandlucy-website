import type { Metadata, Viewport } from "next";
import "./globals.css";

// Testing copies set LHL_TESTING=1 on their own Vercel project so they are never indexed.
const isTesting = process.env.LHL_TESTING === "1";

// viewport-fit lets the mobile menu respect the iPhone home bar.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#faf8f3" };

export const metadata: Metadata = {
  title: "Left Hand Lucy — A trusted hand for life's busy corners",
  description: "Event planning, English lessons, and project support in Madrid. Lucy brings calm structure and thoughtful creativity to everything she does.",
  ...(isTesting ? { robots: { index: false, follow: false } } : {}),
};

// anyOS Site Settings — read by edit.js to render the "Site Settings" panel.
// Each setting maps to a CSS custom property on :root (globals.css); edit.js
// hydrates saved overrides via document.documentElement.style.setProperty(cssVar, value)
// and fires "anyos:settings-changed" so JS consumers (the carousels) re-read live.
// Testing copies are read-only. Before edit.js loads: drop any edit link token
// and refuse every non-GET request to the anyOS platform, so a testing page can
// never save editor content, upload or generate images, or send an enquiry.
// Reading Lucy's saved content (GET) still works, so the copy shows her edits.
const TESTING_READ_ONLY_GUARD = `(function(){
  var PLATFORM = "platform.anyos.co.uk";
  var SAFE = { GET: 1, HEAD: 1, OPTIONS: 1 };
  function isPlatform(url){ try { return new URL(url, location.href).hostname === PLATFORM; } catch (e) { return false; } }
  try { var u = new URL(location.href); if (u.searchParams.has("anyos_edit")) { u.searchParams.delete("anyos_edit"); history.replaceState(null, "", u.href); } } catch (e) {}
  try { Object.keys(sessionStorage).forEach(function(k){ if (k.indexOf("anyosEditToken:") === 0) sessionStorage.removeItem(k); }); } catch (e) {}
  var realFetch = window.fetch;
  window.fetch = function(input, init){
    var url = typeof input === "string" ? input : (input && input.url) || String(input);
    var method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
    if (isPlatform(url) && !SAFE[method]) return Promise.reject(new TypeError("Testing site is read-only: " + method + " to anyOS blocked"));
    return realFetch.apply(this, arguments);
  };
  var open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url){ this.__lhlBlocked = isPlatform(url) && !SAFE[String(method).toUpperCase()]; return open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function(){ if (this.__lhlBlocked) throw new Error("Testing site is read-only"); return send.apply(this, arguments); };
  if (navigator.sendBeacon) { var beacon = navigator.sendBeacon.bind(navigator); navigator.sendBeacon = function(url, data){ return isPlatform(url) ? false : beacon(url, data); }; }
  window.__LHL_TESTING_READ_ONLY__ = true;
})();`;

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
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {isTesting && <script dangerouslySetInnerHTML={{ __html: TESTING_READ_ONLY_GUARD }} />}
        {/* Declared before edit.js loads so the Site Settings panel can render from it. */}
        <script dangerouslySetInnerHTML={{ __html: `window.ANYOS_SETTINGS = ${JSON.stringify(ANYOS_SETTINGS)};` }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
