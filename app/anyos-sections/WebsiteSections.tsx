"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { validateWebsiteSections, type WebsiteSection } from "./sections";
import styles from "./WebsiteSections.module.css";

function SectionImage({ src, alt }: { src: string; alt: string }) {
  // Tenant-defined image hosts are validated by the shared section schema.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={1200} height={800} loading="lazy" className={styles.image} />;
}
function Item({ item, testimonial = false }: { item: WebsiteSection["items"][number]; testimonial?: boolean }) {
  return <article className={styles.item}>{item.image && <SectionImage src={item.image} alt={item.imageAlt} />}{item.title && <h3>{item.title}</h3>}{testimonial ? <blockquote>{item.body}</blockquote> : item.body && <p>{item.body}</p>}{item.href && <a className={styles.link} href={item.href}>View {item.title || "details"}</a>}</article>;
}
function Carousel({ section }: { section: WebsiteSection }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [columns, setColumns] = useState(1);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(media.matches); if (media.matches) setPaused(true); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = container.current; if (!element) return;
    const update = () => { const width = element.getBoundingClientRect().width; setColumns(Math.min(section.settings.columns, width >= 960 ? 8 : width >= 560 ? 4 : 1)); };
    const observer = new ResizeObserver(update); observer.observe(element); update();
    return () => observer.disconnect();
  }, [section.settings.columns]);
  const count = Math.min(columns, section.items.length);
  useEffect(() => {
    if (paused || reduced || !count || section.items.length <= count) return;
    const timer = setInterval(() => { if (!document.hidden) setIndex(i => (i + count) % section.items.length); }, section.settings.intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [paused, reduced, count, section.items.length, section.settings.intervalSeconds]);
  const visible = Array.from({ length: count }, (_, offset) => section.items[(index + offset) % section.items.length]);
  return <div ref={container} role="region" aria-roledescription={section.kind === "ticker" ? "ticker" : "carousel"} aria-label={section.title} onFocusCapture={() => setPaused(true)}>
    {!count ? <p>Add items to this {section.kind}.</p> : <>
      <div key={visible.map(item => item.id).join("-")} className={`${styles.items} ${section.settings.transition === "fade" ? styles.fade : section.settings.transition === "slide" ? styles.slide : ""}`} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>{visible.map(item => <Item key={item.id} item={item} />)}</div>
      <div className={styles.controls}>
        <button type="button" className={styles.control} disabled={section.items.length <= count} onClick={() => { setPaused(true); setIndex(i => (i - count + section.items.length) % section.items.length); }}>Previous</button>
        <span aria-live={paused ? "polite" : "off"}>Showing {count} of {section.items.length} · from {index % section.items.length + 1}</span>
        <button type="button" className={styles.control} disabled={section.items.length <= count} onClick={() => { setPaused(true); setIndex(i => (i + count) % section.items.length); }}>Next</button>
        {!reduced && section.items.length > count && <button type="button" className={styles.control} onClick={() => setPaused(p => !p)}>{paused ? "Play" : "Pause"}</button>}
      </div>
    </>}
  </div>;
}

function EnquiryForm({ siteKey, preview }: { siteKey?: string; preview: boolean }) {
  const attempt = useRef<{ id: string; payload: string } | null>(null);
  const [busy, setBusy] = useState(false); const [complete, setComplete] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (preview || !siteKey || busy || complete) return;
    const form = new FormData(event.currentTarget);
    const values = { name: form.get("name"), email: form.get("email"), message: form.get("message") };
    const payload = JSON.stringify(values);
    if (attempt.current && attempt.current.payload !== payload) { setMessage("Delivery of the original message is still unconfirmed. Retry its original text before sending a different message."); return; }
    attempt.current ??= { id: crypto.randomUUID(), payload };
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`https://platform.anyos.co.uk/api/public/website-enquiry?site=${encodeURIComponent(siteKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, requestId: attempt.current.id }) });
      const result = await response.json();
      if (response.ok && result.ok) { setComplete(true); setMessage("Your message has been received."); }
      else setMessage(result.error || "Your message has not been confirmed. Please retry the original text.");
    } catch { setMessage("Delivery could not be confirmed. Retry this form to check the same message."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={styles.form}>
    <label>Name<input name="name" autoComplete="name" required maxLength={120} className={styles.control} disabled={complete} /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} className={styles.control} disabled={complete} /></label>
    <label>Message<textarea name="message" required maxLength={5000} rows={4} className={styles.control} disabled={complete} /></label>
    <button className={styles.control} disabled={preview || !siteKey || busy || complete}>{preview ? "Preview — sending disabled" : complete ? "Message received" : busy ? "Sending…" : "Send enquiry"}</button>
    <p role="status">{message}</p>
  </form>;
}

/** One renderer for editor previews and connected sites; no platform CSS dependency. */
export function WebsiteSections({ sections, siteKey, preview = true, onSelect }: { sections: WebsiteSection[]; siteKey?: string; preview?: boolean; onSelect?(id: string): void }) {
  const valid = validateWebsiteSections(sections);
  return <div className={styles.root} data-anyos-section-renderer="2">
    {valid.filter(section => !section.hidden).map(section => <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
      {onSelect && <button type="button" className={styles.control} onClick={() => onSelect(section.id)}>Edit or talk about {section.title || "this section"}</button>}
      <h2 id={`${section.id}-title`} className={section.kind === "hero" ? styles.heroTitle : styles.title}>{section.title}</h2>
      {section.body && <p>{section.body}</p>}{section.image && <SectionImage src={section.image} alt={section.imageAlt} />}
      {section.kind === "carousel" || section.kind === "ticker" && section.settings.transition !== "none" ? <Carousel section={section} /> : section.kind === "form" ? <EnquiryForm siteKey={siteKey} preview={preview} /> : section.items.length > 0 && <div className={`${styles.items} ${styles[`columns${section.settings.columns}`]}`}>{section.items.map(item => <Item key={item.id} item={item} testimonial={section.kind === "testimonials"} />)}</div>}
      {section.cta && section.href && <a className={styles.control} href={section.href}>{section.cta}</a>}
    </section>)}
  </div>;
}
