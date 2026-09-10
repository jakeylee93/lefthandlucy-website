'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Mail, MapPin, ChevronLeft, ChevronRight, MessageSquare, Menu, X, Send, CheckCircle, BookOpen, Globe, Calendar } from 'lucide-react'
import Image from 'next/image'
import { translations, Lang } from './translations'
import { SiteSections } from './site-sections'

const LANGUAGES: Record<Lang, string> = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' }
import { SERVICES, TESTIMONIALS } from './site-data'
type Translate = (key: string) => string
function ContactForm({ t, lang }: { t: Translate; lang: Lang }) {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const request = useRef({ fingerprint: '', id: '' })
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (sending) return
    setSending(true); setError('')
    const fingerprint = JSON.stringify({ ...form, language: lang })
    if (request.current.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() }
    try {
      const response = await fetch('https://platform.anyos.co.uk/api/public/website-enquiry?site=left-hand-lucy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, language: lang, requestId: request.current.id }), signal: AbortSignal.timeout(20000) })
      const body = await response.json()
      if (!response.ok || !body.ok || !body.reference) throw new Error('save_failed')
      setReference(body.reference)
    } catch { setError(t('contact.error')) } finally { setSending(false) }
  }
  if (reference) return <div className="form-success" role="status"><CheckCircle size={32} /><h3 data-anyos="contact.sent">{t('contact.sent')}</h3><p className="form-reference">{t('contact.reference')}: {reference.slice(0, 8).toUpperCase()}</p></div>
  return <form onSubmit={handleSubmit} className="contact-form">
    <div className="form-row"><label>{t('contact.name')}<input autoComplete="name" name="name" required maxLength={160} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>{t('contact.email')}<input type="email" autoComplete="email" name="email" required maxLength={200} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label></div>
    <fieldset><legend data-anyos="contact.service">{t('contact.service')}</legend><div className="service-options">{[{ key: 'contact.service.ps', value: 'Project Support' }, { key: 'contact.service.el', value: 'English Lessons' }, { key: 'services.ee.title', value: 'Events & Experiences' }, { key: 'contact.service.other', value: 'Other' }].map(option => <button key={option.value} type="button" aria-pressed={form.service === option.value} onClick={() => setForm({ ...form, service: option.value })} data-anyos={option.key}>{t(option.key)}</button>)}</div></fieldset>
    <label>{t('contact.message')}<textarea name="message" required maxLength={8000} rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label>
    <label className="form-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="button button-primary" type="submit" disabled={sending}><span data-anyos="contact.send">{sending ? t('contact.sending') : t('contact.send')}</span><Send size={16} /></button>
  </form>
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [testimonial, setTestimonial] = useState(0)
  const menuButton = useRef<HTMLButtonElement>(null)
  const t: Translate = key => translations[lang][key] || translations.en[key] || key
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() } }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [])
  const nav = [{ key: 'nav.home', href: '#home' }, { key: 'nav.services', href: '#services' }, { key: 'about.label', href: '#about' }, { key: 'nav.contact', href: '#contact' }]
  return <>
    <a href="#main" className="skip-link">{t('nav.skip')}</a>
    <header className="site-header"><div className="header-inner"><a className="wordmark" href="#home" data-anyos="nav.brand">Left Hand Lucy</a><nav aria-label="Main navigation" className="desktop-nav">{nav.slice(0, 3).map(item => <a href={item.href} key={item.key} data-anyos={item.key}>{t(item.key)}</a>)}</nav><label className="language-picker"><Globe size={15} /><span className="sr-only">Language</span><select value={lang} onChange={e => setLang(e.target.value as Lang)}>{Object.entries(LANGUAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><a className="header-cta button button-primary" href="#contact" data-anyos="nav.cta">{t('nav.contact')}<ArrowRight size={15} /></a><button className="menu-button icon-button" ref={menuButton} aria-label={menuOpen ? t('nav.close') : t('nav.open')} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>{menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{nav.map((item, index) => <a href={item.href} key={item.key} onClick={() => setMenuOpen(false)}><span className="nav-number">0{index + 1}</span><span data-anyos={item.key}>{t(item.key)}</span><ArrowRight size={18} /></a>)}</nav>}</header>
    <main id="main">
      <section id="home" className="hero"><div className="hero-copy"><p className="eyebrow" data-anyos="hero.tags">{t('hero.tags')}</p><h1 data-anyos="hero.title">Left Hand Lucy</h1><p className="hero-tagline" data-anyos="hero.tagline">{t('hero.tagline')}</p><p className="hero-intro" data-anyos="hero.intro">{t('hero.intro')}</p><div className="hero-actions"><a href="#services" className="button button-primary"><span data-anyos="hero.cta1">{t('hero.cta1')}</span><ArrowRight size={16} /></a><a href="#contact" className="button button-secondary" data-anyos="hero.cta2">{t('hero.cta2')}</a></div></div><div className="hero-photo"><Image src="/images/lucy-hero.jpg" alt="Lucy smiling in Madrid" fill priority sizes="(max-width: 767px) 100vw, 52vw" data-anyos-img="hero.image" /><span className="photo-caption"><MapPin size={13} /><span data-anyos="about.tag.madrid">{t('about.tag.madrid')}</span></span></div></section>
      <section id="services" className="section-space"><div className="container"><div className="section-heading"><p className="eyebrow" data-anyos="services.label">{t('services.label')}</p><h2 data-anyos="services.title">{t('services.title')}</h2></div><div className="services-grid">{SERVICES.map((service, index) => <article key={service.id} className="service-card"><div className="service-top"><span className="service-icon"><service.Icon size={22} strokeWidth={1.5} /></span><span className="service-number">0{index + 1}</span></div><h3 data-anyos={`services.${service.id}.title`}>{t(`services.${service.id}.title`)}</h3><p data-anyos={`services.${service.id}.desc`}>{t(`services.${service.id}.desc`)}</p><ul>{service.includes.map((item, i) => <li key={item}><span data-anyos={`services.${service.id}.item${i + 1}`}>{item}</span></li>)}</ul><a href="#contact" className="text-link"><span data-anyos={`services.${service.id}.cta`}>Get in touch</span><ArrowRight size={16} /></a></article>)}</div></div></section>
      <section id="about" className="section-space about-section"><div className="container about-grid"><div className="about-photo"><Image src="/images/lucy.jpg" alt="Lucy" width={600} height={750} sizes="(max-width: 767px) 100vw, 40vw" data-anyos-img="about.image" /><div className="about-badge"><BookOpen size={20} /><div><strong data-anyos="about.badge">{t('about.badge')}</strong><span data-anyos="about.badge.sub">{t('about.badge.sub')}</span></div></div></div><div className="about-copy"><p className="eyebrow" data-anyos="about.label">{t('about.label')}</p><h2 data-anyos="about.title">{t('about.title1')}</h2><h3 data-anyos="about.title2">{t('about.title2')}</h3><div className="about-paragraphs">{[1, 2, 3, 4].map(i => <p key={i} data-anyos={`about.p${i}`}>{t(`about.p${i}`)}</p>)}</div><a href="#contact" className="text-link"><span data-anyos="about.cta">{t('about.cta')}</span><ArrowRight size={16} /></a><div className="about-tags">{[{ id: 'english', Icon: Globe }, { id: 'madrid', Icon: MapPin }, { id: 'teacher', Icon: BookOpen }, { id: 'planner', Icon: Calendar }].map(tag => <span key={tag.id}><tag.Icon size={13} /><span data-anyos={`about.tag.${tag.id}`}>{t(`about.tag.${tag.id}`)}</span></span>)}</div></div></div></section>
      <section id="testimonials" className="section-space testimonials-section"><div className="container"><div className="section-heading"><p className="eyebrow" data-anyos="testimonials.label">{t('testimonials.label')}</p><h2 data-anyos="testimonials.title">{t('testimonials.title')}</h2></div><div className="testimonial-stage" aria-live="polite">{TESTIMONIALS.map((item, i) => <figure key={item.id} hidden={i !== testimonial}><blockquote><span className="quote-mark" aria-hidden="true">“</span><p data-anyos={`testimonials.${item.id}.text`}>{item.text}</p></blockquote><figcaption><strong data-anyos={`testimonials.${item.id}.name`}>{item.name}</strong><span><span data-anyos={`testimonials.${item.id}.role`}>{item.role}</span> · <span data-anyos={`testimonials.${item.id}.service`}>{item.service}</span></span></figcaption></figure>)}</div><div className="testimonial-controls"><button className="icon-button" aria-label={t('reviews.previous')} onClick={() => setTestimonial(i => (i + 4) % 5)}><ChevronLeft size={18} /></button><span>{String(testimonial + 1).padStart(2, '0')} / 05</span><button className="icon-button" aria-label={t('reviews.next')} onClick={() => setTestimonial(i => (i + 1) % 5)}><ChevronRight size={18} /></button></div></div></section>
      <SiteSections lang={lang} />
      <section id="contact" className="section-space contact-section"><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow" data-anyos="contact.label">{t('contact.label')}</p><h2 data-anyos="contact.title">{t('contact.title')}</h2><p data-anyos="contact.desc">{t('contact.desc')}</p><div className="contact-links">{[{ Icon: Mail, key: 'email', label: 'Email', value: 'Lucy@lefthandlucy.com', href: 'mailto:Lucy@lefthandlucy.com' }, { Icon: MapPin, key: 'location', label: 'Location', value: 'Madrid, Spain', href: 'https://www.google.com/maps/search/?api=1&query=Madrid%2C%20Spain' }, { Icon: MessageSquare, key: 'whatsapp', label: 'WhatsApp', value: 'Message me', href: 'https://wa.me/34697903144' }].map(link => <a href={link.href} key={link.key} className="contact-link"><link.Icon size={20} strokeWidth={1.5} /><span><span className="contact-link-label" data-anyos={`contact.card.${link.key}.label`}>{link.label}</span><strong data-anyos={`contact.card.${link.key}.value`}>{link.value}</strong></span><ArrowRight size={16} /></a>)}</div></div><ContactForm t={t} lang={lang} /></div></section>
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-top"><div><p className="wordmark" data-anyos="footer.brand">Left Hand Lucy</p><p data-anyos="footer.tagline">{t('footer.tagline')}</p></div><nav aria-label="Footer navigation"><a href="#services" data-anyos="footer.link.services">{t('nav.services')}</a><a href="#about" data-anyos="footer.link.about">{t('about.label')}</a><a href="https://connect-cardos.vercel.app" data-anyos="footer.link.conectados">Conectados</a><a href="#contact" data-anyos="footer.link.contact">{t('nav.contact')}</a></nav></div><div className="footer-bottom"><p data-anyos="footer.rights">{t('footer.rights')}</p><p data-anyos="footer.contactline">Lucy@lefthandlucy.com · Madrid, Spain</p></div></div></footer>
  </>
}
