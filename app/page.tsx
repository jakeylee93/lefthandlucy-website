'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Mail, MapPin, MessageSquare, Menu, X, Send, CheckCircle, Globe } from 'lucide-react'
import { translations, Lang } from './translations'
import { SiteSections } from './site-sections'
import { TESTIMONIALS } from './site-data'
import { useHideEmptyEditable, useReveal, useScrollLayers, useSlideWheel } from './motion'
import { ServicesCarousel } from './services-carousel'

const LANGUAGES: Record<Lang, string> = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' }
const SERVICE_VALUES: Record<string, string> = { ps: 'Project Support', el: 'English Lessons', ee: 'Events & Experiences' }
const SERVICE_TITLE_KEYS: Record<string, string> = { ps: 'services.ps.title', el: 'services.el.title', ee: 'services.ee.title' }
const CMS_CONTENT = 'https://platform.anyos.co.uk/api/site-cms/left-hand-lucy/content'
const ENQUIRY_ROUTE = 'https://platform.anyos.co.uk/api/public/website-enquiry?site=left-hand-lucy'
// The enquiry form only sends from Lucy's own domains. Testing and preview
// copies show the direct email/WhatsApp routes instead, so nobody sends a
// real enquiry by accident while reviewing a test build.
const LIVE_ENQUIRY_HOSTS = ['lefthandlucy.com', 'www.lefthandlucy.com']

type Translate = (key: string) => string
type Testimonial = (typeof TESTIMONIALS)[number]

function cmsText(value: unknown) {
  if (typeof value !== 'string') return ''
  const doc = new DOMParser().parseFromString(value, 'text/html')
  return (doc.body.textContent || '').trim()
}

function ContactForm({ t, lang, service, setService }: { t: Translate; lang: Lang; service: string; setService: (value: string) => void }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [canSend, setCanSend] = useState<boolean | null>(null)
  const request = useRef({ fingerprint: '', id: '' })
  useEffect(() => {
    const host = window.location.hostname
    setCanSend(LIVE_ENQUIRY_HOSTS.includes(host))
  }, [])
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (sending || !canSend) return
    setSending(true); setError('')
    const payload = { ...form, service, language: lang }
    const fingerprint = JSON.stringify(payload)
    if (request.current.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() }
    try {
      const response = await fetch(ENQUIRY_ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, requestId: request.current.id }), signal: AbortSignal.timeout(20000) })
      const body = await response.json()
      if (!response.ok || !body.ok || !body.reference) throw new Error('save_failed')
      setReference(body.reference)
    } catch { setError(t('contact.error')) } finally { setSending(false) }
  }
  if (reference) return <div className="form-card form-success" role="status"><CheckCircle size={30} strokeWidth={1.5} /><h3 data-anyos="contact.sent">{t('contact.sent')}</h3><p className="form-reference">{t('contact.reference')}: {reference.slice(0, 8).toUpperCase()}</p></div>
  return <form onSubmit={handleSubmit} className="form-card contact-form" aria-describedby={canSend === false ? 'form-preview-note' : undefined}>
    <div className="form-row">
      <label>{t('contact.name')}<input autoComplete="name" name="name" required maxLength={160} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label>{t('contact.email')}<input type="email" autoComplete="email" name="email" required maxLength={200} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
    </div>
    <fieldset><legend data-anyos="contact.service">{t('contact.service')}</legend><div className="service-options">{[{ key: 'contact.service.ps', value: 'Project Support' }, { key: 'contact.service.el', value: 'English Lessons' }, { key: 'services.ee.title', value: 'Events & Experiences' }, { key: 'contact.service.other', value: 'Other' }].map(option => <button key={option.value} type="button" aria-pressed={service === option.value} onClick={() => setService(service === option.value ? '' : option.value)} data-anyos={option.key}>{t(option.key)}</button>)}</div></fieldset>
    <label>{t('contact.message')}<textarea name="message" required maxLength={8000} rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label>
    <label className="form-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    {canSend === false && <p id="form-preview-note" className="form-preview-note">Test preview: this form is switched off here so no real enquiry is sent. Please use email or WhatsApp to reach Lucy.</p>}
    <button className="button button-primary" type="submit" disabled={sending || !canSend}><span data-anyos="contact.send">{sending ? t('contact.sending') : t('contact.send')}</span><Send size={16} /></button>
  </form>
}

function RotatingStamp({ t }: { t: Translate }) {
  const words = ['ps', 'el', 'ee'].map(id => t(SERVICE_TITLE_KEYS[id])).join('  ·  ') + '  ·  '
  return <svg className="hero-stamp" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <defs><path id="stamp-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
    <circle cx="100" cy="100" r="98" />
    <text><textPath href="#stamp-circle" textLength="462" lengthAdjust="spacingAndGlyphs">{words}</textPath></text>
    <path className="stamp-hand" d="M86 128c-6-14-10-30-6-46 2-7 9-6 9 1l1 20 3-34c1-8 10-8 10 0l1 30 3-36c1-8 10-8 10 0l0 36 4-28c1-7 10-6 10 1l-2 40c5-7 9-12 14-12 6 1 6 7 2 12l-15 22c-6 9-14 14-26 14-8 0-15-4-18-20z" />
  </svg>
}

/** Side dots: one per full-screen slide, highlights the slide in view. */
function SlideDots({ slides }: { slides: { id: string; label: string }[] }) {
  const [active, setActive] = useState(slides[0]?.id)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id) }, { threshold: 0.5 })
    slides.forEach(slide => { const el = document.getElementById(slide.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  // Re-observe only when the set of slides changes, not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.map(slide => slide.id).join()])
  return <nav className="slide-dots" aria-label="Sections">{slides.map(slide => <a key={slide.id} href={`#${slide.id}`} aria-label={slide.label} aria-current={active === slide.id ? 'true' : undefined}><span className="dot-label">{slide.label}</span><span className="dot" /></a>)}</nav>
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [service, setService] = useState('')
  const [confirmed, setConfirmed] = useState<(Testimonial & { shownText: string; shownName: string; shownRole: string; shownService: string })[]>([])
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstMenuLink = useRef<HTMLAnchorElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const t: Translate = key => translations[lang][key] || translations.en[key] || key

  useScrollLayers([heroRef, aboutRef])
  useReveal()
  useHideEmptyEditable()
  useSlideWheel()

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() } }
    document.addEventListener('keydown', close)
    document.body.classList.toggle('menu-open', menuOpen)
    if (menuOpen) firstMenuLink.current?.focus()
    return () => document.removeEventListener('keydown', close)
  }, [menuOpen])
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 900px)')
    const onChange = () => { if (desktop.matches) setMenuOpen(false) }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  // Only show testimonials whose words AND name Lucy has saved in her editor.
  // The template placeholders in site-data.ts are never shown as real quotes.
  useEffect(() => {
    let active = true
    fetch(CMS_CONTENT, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        const content = data?.content || {}
        if (!active) return
        setConfirmed(TESTIMONIALS.flatMap(item => {
          const text = cmsText(content[`testimonials.${item.id}.text`])
          const name = cmsText(content[`testimonials.${item.id}.name`])
          if (!text || !name) return []
          const has = (key: string) => typeof content[`testimonials.${item.id}.${key}`] === 'string'
          return [{ ...item, shownText: text, shownName: name, shownRole: has('role') ? cmsText(content[`testimonials.${item.id}.role`]) : item.role, shownService: has('service') ? cmsText(content[`testimonials.${item.id}.service`]) : item.service }]
        }))
      })
      .catch(() => { /* Without the editor content, no testimonials are shown. */ })
    return () => { active = false }
  }, [])

  const chooseService = (id: string) => { setService(SERVICE_VALUES[id]); setMenuOpen(false) }
  const slides = [{ id: 'home', label: t('nav.home') }, { id: 'services', label: t('nav.services') }, { id: 'about', label: t('about.label') }, ...(confirmed.length ? [{ id: 'kind-words', label: t('testimonials.label') }] : []), { id: 'contact', label: t('nav.contact') }]
  const nav = [{ key: 'nav.services', href: '#services' }, { key: 'about.label', href: '#about' }, ...(confirmed.length ? [{ key: 'testimonials.label', href: '#kind-words' }] : []), { key: 'nav.contact', href: '#contact' }]

  return <>
    <a href="#main" className="skip-link">{t('nav.skip')}</a>
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
      <div className="header-inner">
        <a className="wordmark" href="#home" data-anyos="nav.brand" onClick={() => setMenuOpen(false)}>Left Hand Lucy</a>
        <nav aria-label="Main navigation" className="desktop-nav">{nav.filter(item => item.key !== 'nav.contact').map(item => <a href={item.href} key={item.key} data-anyos={item.key === 'nav.contact' ? undefined : item.key}>{t(item.key)}</a>)}</nav>
        <label className="language-picker desktop-only"><Globe size={15} strokeWidth={1.6} /><span className="sr-only">Language</span><select value={lang} onChange={e => setLang(e.target.value as Lang)}>{Object.entries(LANGUAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <a className="header-cta button button-primary desktop-only" href="#contact" data-anyos="nav.cta">{t('nav.contact')}</a>
        <button className="menu-button" ref={menuButton} aria-label={menuOpen ? t('nav.close') : t('nav.open')} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      <div id="mobile-navigation" className="mobile-sheet" hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {[{ key: 'nav.home', href: '#home' }, ...nav].map((item, index) => <a ref={index === 0 ? firstMenuLink : undefined} href={item.href} key={item.key} onClick={() => setMenuOpen(false)} style={{ '--i': index } as React.CSSProperties}><span className="nav-number">0{index + 1}</span><span data-anyos={item.key === 'nav.contact' || item.key === 'testimonials.label' ? undefined : item.key}>{t(item.key)}</span><ArrowRight size={20} strokeWidth={1.5} /></a>)}
        </nav>
        <div className="sheet-foot">
          <label className="language-picker"><Globe size={15} strokeWidth={1.6} /><span className="sr-only">Language</span><select value={lang} onChange={e => setLang(e.target.value as Lang)}>{Object.entries(LANGUAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <div className="sheet-contact"><a href="mailto:Lucy@lefthandlucy.com"><Mail size={16} strokeWidth={1.6} />Lucy@lefthandlucy.com</a><a href="https://wa.me/34697903144"><MessageSquare size={16} strokeWidth={1.6} />WhatsApp</a></div>
        </div>
      </div>
    </header>

    <SlideDots slides={slides} />
    <main id="main">
      <section id="home" className="slide hero" ref={heroRef}>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow" data-anyos="hero.tags">{t('hero.tags')}</p>
            <h1 data-anyos="hero.title">Left Hand Lucy</h1>
            <p className="hero-tagline" data-anyos="hero.tagline">{t('hero.tagline')}</p>
            <p className="hero-intro" data-anyos="hero.intro">{t('hero.intro')}</p>
            <div className="hero-actions">
              <a href="#services" className="button button-primary"><span data-anyos="hero.cta1">{t('hero.cta1')}</span><ArrowRight size={16} /></a>
              <a href="#contact" className="button button-ghost" data-anyos="hero.cta2">{t('hero.cta2')}</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-backdrop" aria-hidden="true" />
            <div className="hero-frame">
              <picture>
                <source media="(max-width: 899px)" srcSet="/images/lucy-portrait-800.jpg 800w, /images/lucy-portrait-1200.jpg 1200w" sizes="100vw" />
                <img src="/images/lucy-hero.jpg" srcSet="/images/lucy-hero-1400.jpg 1400w, /images/lucy-hero-2400.jpg 2400w" sizes="50vw" alt="Lucy smiling on a bench in Madrid" fetchPriority="high" data-anyos-img="hero.image" />
              </picture>
              <span className="hero-word" aria-hidden="true">Madrid</span>
            </div>
            <RotatingStamp t={t} />
            <span className="hero-chip" data-hide-empty><MapPin size={13} /><span data-anyos="about.tag.madrid">{t('about.tag.madrid')}</span></span>
          </div>
        </div>
        <a href="#services" className="scroll-cue" aria-hidden="true" tabIndex={-1}><span /></a>
      </section>

      <section id="services" className="slide services-section">
        <div className="container">
          <div className="section-heading reveal"><p className="eyebrow" data-anyos="services.label">{t('services.label')}</p><h2 data-anyos="services.title">{t('services.title')}</h2></div>
          <ServicesCarousel t={t} onChoose={chooseService} />
        </div>
      </section>

      <section id="about" className="slide about-section" ref={aboutRef}>
        <div className="container about-grid">
          <div className="about-visual">
            <div className="about-backdrop" aria-hidden="true" />
            <div className="about-frame"><img src="/images/lucy.jpg" alt="Lucy" width={600} height={900} loading="lazy" data-anyos-img="about.image" /></div>
            <div className="about-badge" data-hide-empty><strong data-anyos="about.badge">{t('about.badge')}</strong><span data-anyos="about.badge.sub">{t('about.badge.sub')}</span></div>
          </div>
          <div className="about-copy">
            <div className="reveal"><p className="eyebrow" data-anyos="about.label">{t('about.label')}</p><h2 data-anyos="about.title">{t('about.title1')}</h2><p className="about-subtitle" data-anyos="about.title2">{t('about.title2')}</p></div>
            <p className="about-lede reveal" data-anyos="about.p1">{t('about.p1')}</p>
            <div className="about-paragraphs reveal">{[2, 3, 4].map(i => <p key={i} data-anyos={`about.p${i}`}>{t(`about.p${i}`)}</p>)}</div>
            <div className="about-tags reveal">{['english', 'madrid', 'teacher', 'planner'].map(id => <span key={id} data-hide-empty><span data-anyos={`about.tag.${id}`}>{t(`about.tag.${id}`)}</span></span>)}</div>
            <a href="#contact" className="text-link reveal"><span data-anyos="about.cta">{t('about.cta')}</span><ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      {confirmed.length > 0 && <section id="kind-words" className="slide words-section">
        <div className="container">
          <div className="section-heading reveal"><p className="eyebrow" data-anyos="testimonials.label">{t('testimonials.label')}</p><h2 data-anyos="testimonials.title">{t('testimonials.title')}</h2></div>
          <div className={`words-list count-${confirmed.length}`}>{confirmed.map(item => <figure key={item.id} className="reveal">
            <blockquote><p data-anyos={`testimonials.${item.id}.text`}>{item.shownText}</p></blockquote>
            <figcaption><strong data-anyos={`testimonials.${item.id}.name`}>{item.shownName}</strong><span>{item.shownRole && <span data-anyos={`testimonials.${item.id}.role`}>{item.shownRole}</span>}{item.shownRole && item.shownService && ' · '}{item.shownService && <span data-anyos={`testimonials.${item.id}.service`}>{item.shownService}</span>}</span></figcaption>
          </figure>)}</div>
        </div>
      </section>}

      <SiteSections lang={lang} />

      <section id="contact" className="slide contact-section">
        <div className="container contact-grid">
          <div className="contact-copy reveal">
            <p className="eyebrow" data-anyos="contact.label">{t('contact.label')}</p>
            <h2 data-anyos="contact.title">{t('contact.title')}</h2>
            <p className="contact-desc" data-anyos="contact.desc">{t('contact.desc')}</p>
            <div className="contact-links">{[{ Icon: Mail, key: 'email', label: 'Email', value: 'Lucy@lefthandlucy.com', href: 'mailto:Lucy@lefthandlucy.com' }, { Icon: MessageSquare, key: 'whatsapp', label: 'WhatsApp', value: 'Message me', href: 'https://wa.me/34697903144' }, { Icon: MapPin, key: 'location', label: 'Location', value: 'Madrid, Spain', href: 'https://www.google.com/maps/search/?api=1&query=Madrid%2C%20Spain' }].map(link => <a href={link.href} key={link.key} className="contact-link" {...(link.href.startsWith('https') ? { target: '_blank', rel: 'noopener' } : {})}><link.Icon size={20} strokeWidth={1.4} /><span><span className="contact-link-label" data-anyos={`contact.card.${link.key}.label`}>{link.label}</span><strong data-anyos={`contact.card.${link.key}.value`}>{link.value}</strong></span><ArrowUpRight size={18} strokeWidth={1.5} /></a>)}</div>
          </div>
          <ContactForm t={t} lang={lang} service={service} setService={setService} />
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div><p className="footer-wordmark" data-anyos="footer.brand">Left Hand Lucy</p><p className="footer-tagline" data-anyos="footer.tagline">{t('footer.tagline')}</p></div>
          <nav aria-label="Footer navigation"><a href="#services" data-anyos="footer.link.services">{t('nav.services')}</a><a href="#about" data-anyos="footer.link.about">{t('about.label')}</a><a href="https://connect-cardos.vercel.app" data-anyos="footer.link.conectados">Conectados</a><a href="#contact" data-anyos="footer.link.contact">{t('nav.contact')}</a></nav>
        </div>
        <div className="footer-bottom"><p data-anyos="footer.rights">{t('footer.rights')}</p><p data-anyos="footer.contactline">Lucy@lefthandlucy.com · Madrid, Spain</p></div>
      </div>
    </footer>
  </>
}
