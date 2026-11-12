'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, CalendarDays, CheckCircle, Globe, GraduationCap, Luggage, Mail, MapPin, Menu, MessageSquare, PartyPopper, PenLine, Plane, Send, X } from 'lucide-react'
import { translations, Lang } from './translations'
import { SiteSections } from './site-sections'
import { TESTIMONIALS } from './site-data'
import { useHideEmptyEditable, useReveal, useScrollLayers, useSectionScroll } from './motion'
import { ServicesCarousel } from './services-carousel'
import { HAND_POSES, LeftHand, type HandPose } from './hand'
import Script from 'next/script'
import { DEFAULT_LAYOUT, SITE_KEY, type SectionInstance, type SectionKind } from './content/model'
import { contentSource, plainText } from './content/sources'
import { AV_PATHS, KEEP_VISIBLE, layoutFromChapters, type AvView } from './content/anyvendor-v1'

const LANGUAGES: Record<Lang, string> = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' }
const SERVICE_VALUES: Record<string, string> = { ps: 'Project Support', el: 'English Lessons', ee: 'Events & Experiences' }
const ENQUIRY_ROUTE = 'https://platform.anyos.co.uk/api/public/website-enquiry?site=left-hand-lucy'
// The enquiry form only sends from Lucy's own domains. Testing and preview
// copies show the direct email/WhatsApp routes instead, so nobody sends a
// real enquiry by accident while reviewing a test build.
const LIVE_ENQUIRY_HOSTS = ['lefthandlucy.com', 'www.lefthandlucy.com']
// One gesture per moment: the header hand follows the section in view.
const SECTION_POSE: Record<string, HandPose> = { home: 'wave', about: 'ok', 'kind-words': 'thumbsUp', more: 'three', contact: 'pointDown' }
const SERVICE_POSE: Record<string, HandPose> = { ps: 'palm', el: 'pointRight', ee: 'peace' }
// Faint line icons tied to the service on show.
const SERVICE_ICONS = { ps: [CalendarDays, PenLine], el: [GraduationCap, BookOpen], ee: [PartyPopper, Plane, Luggage] } as const

type Translate = (key: string) => string
type Testimonial = (typeof TESTIMONIALS)[number] & { shownText: string; shownName: string; shownRole: string; shownService: string }
type Slide = { id: string; label: string }
/** anyos: today's live source (edit.js). anyvendor: content read on the server from AnyVendor. */
export interface HomeProps { source?: 'anyos' | 'anyvendor'; av?: AvView; draft?: boolean; edit?: boolean; editorOrigins?: string[] }
declare global { interface Window { AnyVendorBridge?: { start(options: Record<string, unknown>): boolean } } }
const CHAPTER_KEY: Partial<Record<SectionKind, string>> = { services: 'services', about: 'about', testimonials: 'testimonials', contact: 'contact' }

function ContactForm({ t, lang, service, setService, draft }: { t: Translate; lang: Lang; service: string; setService: (value: string) => void; draft: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [sending, setSending] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [canSend, setCanSend] = useState<boolean | null>(null)
  const request = useRef({ fingerprint: '', id: '' })
  useEffect(() => { setCanSend(!draft && LIVE_ENQUIRY_HOSTS.includes(window.location.hostname)) }, [draft])
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
    <label>{t('contact.message')}<textarea name="message" required maxLength={8000} rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label>
    <label className="form-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    {canSend === false && <p id="form-preview-note" className="form-preview-note">{draft ? 'Draft preview: the form does not send from a draft.' : 'Test preview: this form is switched off here so no real enquiry is sent. Please use email or WhatsApp to reach Lucy.'}</p>}
    <button className="button button-primary" type="submit" disabled={sending || !canSend}><span data-anyos="contact.send">{sending ? t('contact.sending') : t('contact.send')}</span><Send size={16} /></button>
  </form>
}

/** Side dots: one per section, highlights the section in view. */
function SlideDots({ slides, active }: { slides: Slide[]; active: string }) {
  return <nav className="slide-dots" aria-label="Sections">{slides.map(slide => <a key={slide.id} href={`#${slide.id}`} aria-label={slide.label} aria-current={active === slide.id ? 'true' : undefined}><span className="dot-label">{slide.label}</span><span className="dot" /></a>)}</nav>
}

/** Bottom control naming the real next section. It only moves when pressed. */
function NextControl({ slides, id, t }: { slides: Slide[]; id: string; t: Translate }) {
  const next = slides[slides.findIndex(slide => slide.id === id) + 1]
  if (!next) return null
  return <a className="next-control" href={`#${next.id}`}><span className="next-word">{t('nav.next')}</span><span className="next-label">{next.label}</span><ArrowDown size={15} strokeWidth={1.8} /></a>
}

export default function Home({ source = 'anyos', av, draft = false, edit = false, editorOrigins = [] }: HomeProps) {
  const [lang, setLang] = useState<Lang>('en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [service, setService] = useState('')
  const [activeService, setActiveService] = useState('ps')
  const [activeSlide, setActiveSlide] = useState('home')
  const [posePick, setPosePick] = useState<HandPose | null>(null)
  const [layout, setLayout] = useState<SectionInstance[]>(av?.layout ?? DEFAULT_LAYOUT)
  const [confirmed, setConfirmed] = useState<Testimonial[]>(() => (av?.quotes ?? []).map((quote, i) => ({ id: `q${i}`, text: quote.text, name: quote.name, role: quote.role, service: quote.service, shownText: quote.text, shownName: quote.name, shownRole: quote.role, shownService: quote.service })))
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstMenuLink = useRef<HTMLAnchorElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  // Saved AnyVendor text wins over the built-in text (as anyOS overrides do today), even when saved empty.
  const t: Translate = key => { const id = key === 'about.title1' ? 'about.title' : key; return av && id in av.fields ? av.fields[id] : translations[lang][key] || translations.en[key] || key }

  useScrollLayers([heroRef])
  useReveal()
  useHideEmptyEditable()
  useSectionScroll()

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

  // Saved content: section order/visibility, and testimonials. A quote is shown
  // only when its words AND name were saved by Lucy; template placeholders never are.
  // If the content service is unreachable the built-in content stays in place.
  useEffect(() => {
    if (source !== 'anyos') return
    let active = true
    const state = new URLSearchParams(window.location.search).get('preview') === 'draft' ? 'draft' : 'published'
    contentSource.load(state).then(content => {
      if (!active) return
      setLayout(content.layout)
      const fields = content.fields
      setConfirmed(TESTIMONIALS.flatMap(item => {
        const text = plainText(fields[`testimonials.${item.id}.text`])
        const name = plainText(fields[`testimonials.${item.id}.name`])
        if (!text || !name) return []
        const saved = (key: string, fallback: string) => typeof fields[`testimonials.${item.id}.${key}`] === 'string' ? plainText(fields[`testimonials.${item.id}.${key}`]) : fallback
        return [{ ...item, shownText: text, shownName: name, shownRole: saved('role', item.role), shownService: saved('service', item.service) }]
      }))
    }).catch(() => { /* keep built-in content */ })
    return () => { active = false }
  }, [source])

  // AnyVendor editing marks: every element that shows a field carries data-av-field.
  // Set after each render because the same elements already carry their data-anyos key.
  useEffect(() => {
    if (!edit) return
    document.querySelectorAll<HTMLElement>('[data-anyos], [data-anyos-img]').forEach(el => {
      const path = AV_PATHS[el.getAttribute('data-anyos') || el.getAttribute('data-anyos-img') || '']
      if (path && !el.hasAttribute('data-av-field') && (el.tagName === 'IMG' || el.childElementCount === 0)) el.setAttribute('data-av-field', path)
    })
  })
  const startBridge = useCallback(() => {
    window.AnyVendorBridge?.start({ slug: SITE_KEY, origins: editorOrigins, capabilities: { text: true, image: true, chapters: true }, keepVisible: KEEP_VISIBLE,
      // Order and visibility are applied through React state, so chapters hidden in the saved draft can be shown live too.
      onChapters: (order: { chapter: string; visible: boolean }[]) => setLayout(layoutFromChapters(order)) })
  }, [editorOrigins])

  const chooseService = useCallback((id: string) => { setService(SERVICE_VALUES[id]); setMenuOpen(false) }, [])
  const visible = layout.filter(section => !section.hidden && (section.kind !== 'testimonials' || confirmed.length > 0) && section.kind !== 'custom')
  const labels: Record<SectionKind, string> = { hero: t('nav.home'), services: t('services.title'), about: t('about.label'), testimonials: t('next.kind-words'), contact: t('next.contact'), custom: '' }
  const slideKey = visible.map(section => section.id).join()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const slides: Slide[] = useMemo(() => visible.map(section => ({ id: section.id, label: labels[section.kind] })), [slideKey, lang])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { setActiveSlide(entry.target.id); setPosePick(null) } }, { rootMargin: '-45% 0px -45% 0px' })
    slideKey.split(',').forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [slideKey])

  const pose: HandPose = posePick ?? (activeSlide === 'services' ? SERVICE_POSE[activeService] : SECTION_POSE[activeSlide]) ?? 'wave'
  const nextPose = () => setPosePick(HAND_POSES[(HAND_POSES.indexOf(pose) + 1) % HAND_POSES.length])
  const nav = slides.filter(slide => slide.id !== 'home')
  const DecorIcons = SERVICE_ICONS[activeService as keyof typeof SERVICE_ICONS] || SERVICE_ICONS.ps

  const quoteMark = (id: string, index: number, sub: string) => source === 'anyvendor' ? (edit ? { 'data-av-field': `testimonials.items.${index}.${sub}` } : {}) : { 'data-anyos': `testimonials.${id}.${sub}` }
  const chapter = (kind: SectionKind) => (source === 'anyvendor' && CHAPTER_KEY[kind] ? { 'data-av-chapter': CHAPTER_KEY[kind] } : {})
  const heroImage = av?.images['hero.image'], aboutImage = av?.images['about.image']
  const customHero = heroImage && heroImage.src !== '/images/lucy-hero.jpg', customAbout = aboutImage && aboutImage.src !== '/images/lucy-portrait-1200.jpg'
  const email = av?.email ?? { href: 'mailto:Lucy@lefthandlucy.com', label: 'Lucy@lefthandlucy.com' }

  const sections: Record<SectionKind, (id: string) => React.ReactNode> = {
    hero: id => <section key={id} id={id} className="slide hero" ref={heroRef}>
      <div className="slide-body hero-grid">
        <div className="hero-copy">
          <p className="eyebrow" data-anyos="hero.tags">{t('hero.tags')}</p>
          <h1 data-anyos="hero.title">{t('hero.title')}</h1>
          <p className="hero-tagline" data-anyos="hero.tagline">{t('hero.tagline')}</p>
          <p className="hero-intro" data-anyos="hero.intro">{t('hero.intro')}</p>
          <div className="hero-actions">
            <a href="#services" className="button button-primary"><span data-anyos="hero.cta1">{t('hero.cta1')}</span><ArrowRight size={16} /></a>
            <a href="#contact" className="button button-ghost" data-anyos="hero.cta2">{t('hero.cta2')}</a>
          </div>
          <p className="hero-facts"><span className="hero-place" data-hide-empty><MapPin size={14} strokeWidth={1.7} /><span data-anyos="about.tag.madrid">{t('about.tag.madrid')}</span></span><span data-anyos="hero.availability">{t('hero.availability')}</span></p>
        </div>
        <div className="hero-media">
          {customHero ? <img src={heroImage.src} alt={heroImage.alt} fetchPriority="high" data-anyos-img="hero.image" /> : <picture>
            <source media="(max-width: 899px)" srcSet="/images/lucy-hero-1400.jpg 1400w, /images/lucy-hero-2400.jpg 2400w" sizes="100vw" />
            <img src="/images/lucy-hero.jpg" srcSet="/images/lucy-hero-portrait-1100.jpg 1100w, /images/lucy-hero-portrait-2000.jpg 2000w" sizes="(max-width: 899px) 100vw, 46vw" alt={heroImage?.alt || 'Lucy smiling on a bench in Madrid'} fetchPriority="high" data-anyos-img="hero.image" />
          </picture>}
        </div>
      </div>
      <NextControl slides={slides} id={id} t={t} />
    </section>,

    services: id => <section key={id} id={id} className="slide services-section" {...chapter('services')}>
      <div className="service-decor" aria-hidden="true" key={activeService}>{DecorIcons.map((Icon, i) => <Icon key={i} strokeWidth={1.1} style={{ '--i': i } as React.CSSProperties} />)}</div>
      <div className="slide-body"><div className="container">
        <div className="section-heading reveal"><p className="eyebrow" data-anyos="services.label">{t('services.label')}</p><h2 data-anyos="services.title">{t('services.title')}</h2></div>
        <ServicesCarousel t={t} onChoose={chooseService} onActive={setActiveService} includes={av?.includes} edit={edit} />
      </div></div>
      <NextControl slides={slides} id={id} t={t} />
    </section>,

    about: id => <section key={id} id={id} className="slide about-section" {...chapter('about')}>
      <div className="slide-body"><div className="container about-grid">
        <div className="about-visual">
          <div className="about-frame">{customAbout ? <img src={aboutImage.src} alt={aboutImage.alt} loading="lazy" data-anyos-img="about.image" /> : <img src="/images/lucy-portrait-1200.jpg" srcSet="/images/lucy-portrait-800.jpg 800w, /images/lucy-portrait-1200.jpg 1200w" sizes="(max-width: 899px) 60vw, 34vw" alt={aboutImage?.alt || 'Lucy'} width={1200} height={1607} loading="lazy" data-anyos-img="about.image" />}</div>
          <div className="about-badge" data-hide-empty><strong data-anyos="about.badge">{t('about.badge')}</strong><span data-anyos="about.badge.sub">{t('about.badge.sub')}</span></div>
        </div>
        <div className="about-copy">
          <div className="reveal"><p className="eyebrow" data-anyos="about.label">{t('about.label')}</p><h2 data-anyos="about.title">{t('about.title1')}</h2><p className="about-subtitle" data-anyos="about.title2">{t('about.title2')}</p></div>
          <p className="about-lede reveal" data-anyos="about.p1">{t('about.p1')}</p>
          <div className="about-paragraphs reveal">{[2, 3, 4].map(i => <p key={i} data-anyos={`about.p${i}`}>{t(`about.p${i}`)}</p>)}</div>
          <div className="about-tags reveal">{['english', 'teacher', 'planner'].map(tag => <span key={tag} data-hide-empty><span data-anyos={`about.tag.${tag}`}>{t(`about.tag.${tag}`)}</span></span>)}</div>
          <a href="#contact" className="text-link reveal"><span data-anyos="about.cta">{t('about.cta')}</span><ArrowRight size={16} /></a>
        </div>
      </div></div>
      <NextControl slides={slides} id={id} t={t} />
    </section>,

    testimonials: id => confirmed.length > 0 && <section key={id} id={id} className="slide words-section" {...chapter('testimonials')}>
      <div className="slide-body"><div className="container">
        <div className="section-heading reveal"><p className="eyebrow" data-anyos="testimonials.label">{t('testimonials.label')}</p><h2 data-anyos="testimonials.title">{t('testimonials.title')}</h2></div>
        <div className={`words-list count-${confirmed.length}`}>{confirmed.map((item, i) => <figure key={item.id} className="reveal">
          <blockquote><p {...quoteMark(item.id, i, 'text')}>{item.shownText}</p></blockquote>
          <figcaption><strong {...quoteMark(item.id, i, 'name')}>{item.shownName}</strong><span>{item.shownRole && <span {...quoteMark(item.id, i, 'role')}>{item.shownRole}</span>}{item.shownRole && item.shownService && ' · '}{item.shownService && <span {...quoteMark(item.id, i, 'service')}>{item.shownService}</span>}</span></figcaption>
        </figure>)}</div>
      </div></div>
      <NextControl slides={slides} id={id} t={t} />
    </section>,

    // Extra modules live in anyOS only; AnyVendor v1 declares no added section types.
    custom: id => source === 'anyos' ? <SiteSections key={id} lang={lang} /> : null,

    contact: id => <section key={id} id={id} className="slide contact-section" {...chapter('contact')}>
      <div className="slide-body"><div className="container contact-grid">
        <div className="contact-copy reveal">
          <p className="eyebrow" data-anyos="contact.label">{t('contact.label')}</p>
          <h2 data-anyos="contact.title">{t('contact.title')}</h2>
          <p className="contact-desc" data-anyos="contact.desc">{t('contact.desc')}</p>
          <div className="contact-links">{[{ Icon: Mail, key: 'email', label: 'Email', value: email.label, href: email.href }, { Icon: MessageSquare, key: 'whatsapp', label: 'WhatsApp', value: 'Message me', href: 'https://wa.me/34697903144' }, { Icon: MapPin, key: 'location', label: 'Location', value: 'Madrid, Spain', href: 'https://www.google.com/maps/search/?api=1&query=Madrid%2C%20Spain' }].map(link => <a href={link.href} key={link.key} className="contact-link" {...(link.href.startsWith('https') ? { target: '_blank', rel: 'noopener' } : {})}><link.Icon size={20} strokeWidth={1.4} /><span><span className="contact-link-label" data-anyos={`contact.card.${link.key}.label`}>{link.label}</span><strong data-anyos={`contact.card.${link.key}.value`}>{av && `contact.card.${link.key}.value` in av.fields ? av.fields[`contact.card.${link.key}.value`] : link.value}</strong></span><ArrowUpRight size={18} strokeWidth={1.5} /></a>)}</div>
        </div>
        <ContactForm t={t} lang={lang} service={service} setService={setService} draft={draft} />
      </div></div>
    </section>,
  }

  return <>
    {/* anyOS live-edit: only while anyOS is the content source. Never on an AnyVendor page or draft. */}
    {source === 'anyos' && <Script src="https://platform.anyos.co.uk/edit.js?v=6" data-site="left-hand-lucy" strategy="afterInteractive" />}
    {edit && editorOrigins.length > 0 && <Script src="/anyvendor-bridge.js" strategy="afterInteractive" onReady={startBridge} />}
    {draft && <p className="draft-badge" role="status">Draft preview</p>}
    <a href="#main" className="skip-link">{t('nav.skip')}</a>
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}${activeSlide === 'contact' && !menuOpen ? ' on-dark' : ''}`}>
      <div className="header-inner">
        <button type="button" className="hand-button" onClick={nextPose} aria-label="Left Hand Lucy hand signal: show another gesture"><LeftHand pose={pose} /></button>
        <a className="wordmark" href="#home" data-anyos="nav.brand" onClick={() => setMenuOpen(false)}>Left Hand Lucy</a>
        <nav aria-label="Main navigation" className="desktop-nav">{nav.filter(item => item.id !== 'contact').map(item => <a href={`#${item.id}`} key={item.id} aria-current={activeSlide === item.id ? 'true' : undefined}>{item.label}</a>)}</nav>
        <label className="language-picker desktop-only"><Globe size={15} strokeWidth={1.6} /><span className="sr-only">Language</span><select value={lang} onChange={e => setLang(e.target.value as Lang)}>{Object.entries(LANGUAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <a className="header-cta button button-primary desktop-only" href="#contact" data-anyos="nav.cta">{t('nav.contact')}</a>
        <button className="menu-button" ref={menuButton} aria-label={menuOpen ? t('nav.close') : t('nav.open')} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      <div id="mobile-navigation" className="mobile-sheet" hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {slides.map((item, index) => <a ref={index === 0 ? firstMenuLink : undefined} href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)} style={{ '--i': index } as React.CSSProperties}><span className="nav-number">0{index + 1}</span><span>{item.id === 'contact' ? t('nav.contact') : item.label}</span><ArrowRight size={20} strokeWidth={1.5} /></a>)}
        </nav>
        <div className="sheet-foot">
          <label className="language-picker"><Globe size={15} strokeWidth={1.6} /><span className="sr-only">Language</span><select value={lang} onChange={e => setLang(e.target.value as Lang)}>{Object.entries(LANGUAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <div className="sheet-contact"><a href={email.href}><Mail size={16} strokeWidth={1.6} />{email.label}</a><a href="https://wa.me/34697903144"><MessageSquare size={16} strokeWidth={1.6} />WhatsApp</a></div>
        </div>
      </div>
    </header>

    <SlideDots slides={slides} active={activeSlide} />
    <main id="main">{layout.filter(section => !section.hidden).map(section => sections[section.kind](section.id))}</main>

    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div><p className="footer-wordmark" data-anyos="footer.brand">Left Hand Lucy</p><p className="footer-tagline" data-anyos="footer.tagline">{t('footer.tagline')}</p></div>
          <nav aria-label="Footer navigation"><a href="#services" data-anyos="footer.link.services">{t('nav.services')}</a><a href="#about" data-anyos="footer.link.about">{t('about.label')}</a><a href="https://connect-cardos.vercel.app" data-anyos="footer.link.conectados">Conectados</a><a href="#contact" data-anyos="footer.link.contact">{t('nav.contact')}</a><a href="#home" className="to-top"><ArrowUp size={14} />{t('nav.top')}</a></nav>
        </div>
        <div className="footer-bottom"><p data-anyos="footer.rights">{t('footer.rights')}</p><p data-anyos="footer.contactline">Lucy@lefthandlucy.com · Madrid, Spain</p></div>
      </div>
    </footer>
  </>
}
