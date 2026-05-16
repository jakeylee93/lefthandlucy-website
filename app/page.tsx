'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, ChevronLeft, ChevronRight, Star, MessageSquare, Menu, X, ExternalLink, Send, CheckCircle, Briefcase, BookOpen, Compass, Globe, Users, Calendar, Sparkles } from 'lucide-react'
import { translations, Lang } from './translations'
import Image from 'next/image'

// ── Language Context ──────────────────────────────────────
const LangContext = createContext<{ lang: Lang; t: (key: string) => string; setLang: (l: Lang) => void }>({
  lang: 'en', t: (k) => k, setLang: () => {},
})
function useLang() { return useContext(LangContext) }

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪' }

// ── Services data ─────────────────────────────────────────
const SERVICES = [
  {
    Icon: Briefcase,
    titleKey: 'services.ps.title',
    descKey: 'services.ps.desc',
    color: '#C8A96E',
    includes: [
      'Email & inbox management',
      'Calendar & scheduling',
      'Research & analysis',
      'Task coordination & deadlines',
      'Document preparation',
      'Travel arrangements',
      '& more',
    ],
  },
  {
    Icon: BookOpen,
    titleKey: 'services.el.title',
    descKey: 'services.el.desc',
    color: '#E8B4B8',
    includes: [
      'Conversational English',
      'Business & professional English',
      "Children's lessons",
      'Exam preparation',
      'Pronunciation & accent coaching',
    ],
  },
  {
    Icon: Compass,
    titleKey: 'services.ee.title',
    descKey: 'services.ee.desc',
    color: '#7B9E87',
    includes: [
      'Venue sourcing & coordination',
      'Madrid experiences & local recommendations',
      'Concierge support for visitors',
      'Group events & social gatherings',
      'Restaurant & activity bookings',
      'On-the-day coordination',
    ],
  },
]

const SERVICE_SUMMARIES = [
  'Inboxes, diaries, research and calm organisation.',
  'Confidence-building English for real life.',
  'Events, bookings and Madrid experiences made smoother.',
]

const WHO_I_HELP = [
  'Busy founders and professionals who need calm, discreet support behind the scenes',
  'Families, children and adults building confidence with English in Madrid',
  'Hosts and visitors who want thoughtful events, local plans and smooth logistics',
]

const WORKING_MODES = [
  { title: 'In person', text: 'Madrid-based support for lessons, meetings, errands, events and on-the-ground organisation.' },
  { title: 'Virtual', text: 'Remote executive assistance, research, scheduling, planning and English support wherever you are.' },
  { title: 'Flexible', text: 'One-off help, regular sessions or a steady extra pair of hands when life gets busy.' },
]

const FAQS = [
  { q: 'Can Lucy help with one-off projects?', a: 'Yes. Left Hand Lucy is designed to be flexible, from a single task or event to ongoing project support.' },
  { q: 'Does Lucy work virtually as well as in Madrid?', a: 'Yes. Support can be in person, virtual or a mix of both depending on the project.' },
  { q: 'Who are the English lessons for?', a: 'Children, adults and professionals who want practical, confidence-building English support.' },
  { q: 'Can Lucy help with events from planning to the day itself?', a: 'Yes. She can help with ideas, venues, guest lists, bookings, logistics and calm on-the-day coordination.' },
]

const TESTIMONIALS = [
  { text: "I moved to Madrid recently, and Lucy's lessons helped me feel at home so quickly. Her explanations are simple, her examples practical, and she makes learning fun. I feel far more confident speaking now.", name: 'Amelia Grant', role: 'English student', service: 'English Lessons' },
  { text: "I've tried a few English tutors over the years, but Lucy stands out immediately. Her teaching style is clear, patient, and completely tailored to what I need. I genuinely look forward to our sessions each week.", name: 'Marco Hernández', role: 'Professional in Madrid', service: 'English Lessons' },
  { text: "Lucy is an absolute gem. She took my scattered ideas and turned them into a beautifully organised event that felt effortless from start to finish. Her calm approach and attention to detail made the whole experience stress-free.", name: 'Sophie Aldridge', role: 'Private event client', service: 'Events & Experiences' },
  { text: "I was drowning in admin and deadlines. Lucy stepped in and within a week everything was organised and running smoothly. She's incredibly reliable and nothing is too much trouble.", name: 'David Chen', role: 'Small business owner', service: 'Project Support' },
  { text: "My daughter's confidence in English has absolutely soared since starting lessons with Lucy. She makes it feel like fun, not work. We couldn't be happier.", name: 'Isabel Moreno', role: 'Parent', service: 'English Lessons' },
]

// ── Nav ───────────────────────────────────────────────────
function Nav() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navLinks = [
    { l: t('nav.home'), h: '#' },
    { l: t('nav.services'), h: '#services' },
    { l: t('nav.meet'), h: '#meet-lucy' },
    { l: t('nav.contact'), h: '#contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2">
            <span className={`text-xl font-semibold italic transition-colors ${scrolled ? 'text-lucy-charcoal' : 'text-white'}`} style={{ fontFamily: 'var(--font-heading)' }}>Left Hand Lucy</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(i => (
              <a key={i.l} href={i.h} className={`text-sm font-extrabold tracking-[0.12em] uppercase transition-colors ${scrolled ? 'text-lucy-charcoal/75 hover:text-lucy-charcoal' : 'text-white/80 hover:text-white'}`}>{i.l}</a>
            ))}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${scrolled ? 'bg-lucy-cream text-lucy-charcoal' : 'bg-white/10 text-white'}`}>
                {LANG_FLAGS[lang]} {lang.toUpperCase()}
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden">
                  {(Object.keys(LANG_FLAGS) as Lang[]).map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false) }} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium w-full hover:bg-lucy-cream transition-colors ${l === lang ? 'bg-lucy-cream text-lucy-sage font-bold' : 'text-lucy-charcoal'}`}>
                      {LANG_FLAGS[l]} {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href="#contact" className="group relative overflow-hidden bg-lucy-charcoal text-white px-5 py-3 text-xs font-extrabold tracking-[0.14em] uppercase shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5" style={{ borderRadius: '18px 18px 18px 4px' }}><span className="relative z-10 flex items-center gap-2">{t('nav.contact')} <Sparkles size={13} /></span><span className="absolute inset-0 bg-lucy-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300" /></a>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} className={scrolled ? 'text-lucy-charcoal' : 'text-white'} /> : <Menu size={24} className={scrolled ? 'text-lucy-charcoal' : 'text-white'} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-black/5 px-6 py-4">
          {navLinks.map(i => (
            <a key={i.l} href={i.h} className="block py-2 text-lucy-grey text-base font-medium" onClick={() => setOpen(false)}>{i.l}</a>
          ))}
          <div className="flex gap-2 mt-3 mb-2">
            {(Object.keys(LANG_FLAGS) as Lang[]).map(l => (
              <button key={l} onClick={() => { setLang(l); setOpen(false) }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${l === lang ? 'bg-lucy-sage text-white' : 'bg-lucy-cream text-lucy-charcoal'}`}>
                {LANG_FLAGS[l]}
              </button>
            ))}
          </div>
          <a href="#contact" className="block mt-2 bg-lucy-charcoal text-white px-5 py-3 text-center font-extrabold tracking-wide" onClick={() => setOpen(false)}>{t('nav.contact')}</a>
        </div>
      )}
    </nav>
  )
}

// ── Testimonial Carousel ──────────────────────────────────
function TestimonialCarousel() {
  const [active, setActive] = useState(0)
  const next = () => setActive(a => (a + 1) % TESTIMONIALS.length)
  const prev = () => setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  useEffect(() => { const interval = setInterval(next, 6000); return () => clearInterval(interval) }, [])
  const tm = TESTIMONIALS[active]
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center px-8">
          <div className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-lucy-gold text-lucy-gold" />)}</div>
          <p className="text-lucy-charcoal text-lg sm:text-xl leading-relaxed mb-6 italic" style={{ fontFamily: 'var(--font-heading)' }}>&ldquo;{tm.text}&rdquo;</p>
          <p className="text-lucy-charcoal font-bold text-sm">{tm.name}</p>
          <p className="text-lucy-grey text-xs mt-1">{tm.role} · {tm.service}</p>
        </motion.div>
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg"><ChevronLeft size={18} className="text-lucy-charcoal" /></button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg"><ChevronRight size={18} className="text-lucy-charcoal" /></button>
      </div>
      <div className="flex justify-center gap-2 mt-8">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all ${i === active ? 'bg-lucy-sage w-6' : 'bg-black/10 w-2'}`} />)}</div>
    </div>
  )
}

// ── Contact Form ──────────────────────────────────────────
function ContactForm() {
  const { t } = useLang()
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const serviceOptions = [
    { key: 'contact.service.ps', value: 'Project Support' },
    { key: 'contact.service.el', value: 'English Lessons' },
    { key: 'contact.service.ee', value: 'Events & Experiences' },
    { key: 'contact.service.other', value: 'Other' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    const subject = `Left Hand Lucy enquiry: ${form.service || 'General'}`
    const body = `Hi Lucy,\n\nLet's talk about how you can help.\n\nName: ${form.name}\nEmail: ${form.email}\nService: ${form.service || 'General'}\n\nMessage:\n${form.message}\n\nSent from lefthandlucy.com`
    window.location.href = `mailto:Lucy@lefthandlucy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setTimeout(() => { setSent(true); setSending(false) }, 500)
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-lucy-cream rounded-2xl p-10 text-center">
        <CheckCircle size={48} className="text-lucy-sage mx-auto mb-4" />
        <p className="text-lucy-charcoal font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{t('contact.sent')}</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="text" required placeholder={t('contact.name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full bg-lucy-cream border-2 border-transparent focus:border-lucy-sage rounded-xl px-5 py-3.5 text-sm text-lucy-charcoal placeholder:text-lucy-grey/60 outline-none transition-all" />
        <input type="email" required placeholder={t('contact.email')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full bg-lucy-cream border-2 border-transparent focus:border-lucy-sage rounded-xl px-5 py-3.5 text-sm text-lucy-charcoal placeholder:text-lucy-grey/60 outline-none transition-all" />
      </div>
      <div>
        <p className="text-lucy-grey text-xs font-bold uppercase tracking-wide mb-2">{t('contact.service')}</p>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map(s => (
            <button key={s.value} type="button" onClick={() => setForm({ ...form, service: s.value })}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${form.service === s.value ? 'bg-lucy-sage text-white scale-105' : 'bg-lucy-cream text-lucy-charcoal hover:bg-lucy-sage/10'}`}>
              {t(s.key)}
            </button>
          ))}
        </div>
      </div>
      <textarea required placeholder={t('contact.message')} rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
        className="w-full bg-lucy-cream border-2 border-transparent focus:border-lucy-sage rounded-xl px-5 py-3.5 text-sm text-lucy-charcoal placeholder:text-lucy-grey/60 outline-none transition-all resize-none" />
      <button type="submit" disabled={sending}
        className="w-full sm:w-auto bg-lucy-sage hover:bg-lucy-sage/90 text-white px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/20 text-sm flex items-center gap-2 justify-center disabled:opacity-50">
        <Send size={16} /> {sending ? '...' : t('contact.send')}
      </button>
    </form>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en')
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [activeService, setActiveService] = useState(0)
  const [pauseServiceSlider, setPauseServiceSlider] = useState(false)
  const t = (key: string) => translations[lang][key] || translations['en'][key] || key

  useEffect(() => {
    if (pauseServiceSlider) return
    const timer = window.setInterval(() => {
      setActiveService((current) => (current + 1) % SERVICES.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [pauseServiceSlider])

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="min-h-screen bg-white">
        <Nav />

        {/* ── HERO — Left-aligned, clean, Lucy bg ─────────── */}
        <section className="min-h-screen flex items-end relative overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/lucy-meet.jpg" alt="Lucy smiling in Madrid" fill className="object-cover object-[56%_24%] md:hidden" priority />
            <Image src="/images/lucy-hero.jpg" alt="Lucy smiling on a bench in Madrid" fill className="hidden md:block object-cover object-[72%_34%]" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/5 sm:from-black/80 sm:via-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pb-16 sm:pb-20 pt-24 w-full">
            <div className="max-w-xl">
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-lucy-sage font-bold text-xs tracking-[0.25em] uppercase mb-4">
                {t('hero.tags')}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-4 sm:mb-5 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Left Hand Lucy
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-white/80 text-xl sm:text-2xl italic mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('hero.tagline')}
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-white/80 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg">
                {t('hero.intro')}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3">
                <a href="#contact" className="bg-lucy-sage hover:bg-lucy-sage/90 text-white px-7 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/20 text-sm">{t('hero.cta2')}</a>
                <a href="#services" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-7 py-3 rounded-full font-bold transition-all text-sm">{t('hero.cta1')}</a>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-wrap gap-2 mt-5 sm:mt-6">
                {['Executive Assistant', 'Multilingual', 'Qualified Teacher', 'Event Planner'].map(tag => (
                  <span key={tag} className="bg-white/10 border border-white/15 backdrop-blur-sm text-white/80 px-3 py-1.5 rounded-full text-xs font-bold">{tag}</span>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── SERVICES — hero overlap frame ───────────────────────────── */}
        <section id="services" className="px-4 sm:px-8 -mt-10 sm:-mt-12 relative z-20 bg-white">
          <div
            id="serviceSpotlight"
            className="relative max-w-6xl mx-auto overflow-hidden rounded-[2.25rem] bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5"
            onMouseEnter={() => setPauseServiceSlider(true)}
            onMouseLeave={() => setPauseServiceSlider(false)}
            onFocus={() => setPauseServiceSlider(true)}
            onBlur={() => setPauseServiceSlider(false)}
          >
            <div className="absolute -top-10 left-8 h-24 w-24 rounded-full bg-lucy-gold/15 blur-2xl" />
            <div className="absolute -right-12 top-8 h-32 w-32 rounded-full bg-lucy-sage/15 blur-2xl" />
            <div className="relative px-4 py-7 sm:p-10">
              <div className="text-center mb-5 sm:mb-8">
                <p className="text-lucy-sage font-bold text-[11px] sm:text-sm tracking-[0.22em] uppercase mb-3">{t('services.mode')}</p>
                <h2 className="text-[2rem] leading-tight sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t('services.title')}</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-lucy-grey">Tap a tab to preview the service, or open the full detail.</p>
              </div>

              <div className="mb-4 rounded-full bg-lucy-cream p-1.5 shadow-inner" aria-label="Service tabs" role="tablist">
                <div className="grid grid-cols-3 gap-1">
                  {SERVICES.map((service, i) => {
                    const active = activeService === i
                    return (
                      <button
                        key={service.titleKey}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => { setActiveService(i); setPauseServiceSlider(true) }}
                        className={`rounded-full px-2 py-2.5 text-center text-[11px] font-black leading-tight transition-all sm:text-sm ${active ? 'bg-white text-lucy-charcoal shadow-md shadow-black/10' : 'text-lucy-charcoal/55 hover:text-lucy-charcoal'}`}
                      >
                        <span className="block text-[9px] tracking-[0.18em] opacity-45">0{i + 1}</span>
                        {t(service.titleKey)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.75rem] bg-lucy-charcoal p-5 text-white shadow-xl shadow-black/10 sm:p-8">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: SERVICES[activeService].color }} />
                <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full opacity-20" style={{ backgroundColor: SERVICES[activeService].color }} />
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="relative"
                >
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Service spotlight</p>
                  <h3 className="mb-3 text-3xl font-semibold leading-tight sm:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{t(SERVICES[activeService].titleKey)}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-white/72 sm:text-base">{t(SERVICES[activeService].descKey)}</p>
                  <div className="mb-5 grid gap-2">
                    {SERVICES[activeService].includes.slice(0, 3).map((item) => (
                      <div key={item} className="flex items-start gap-2 rounded-2xl bg-white/7 px-3 py-2 text-xs text-white/82 sm:text-sm">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: SERVICES[activeService].color }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setSelectedService(activeService)} className="inline-flex w-full items-center justify-between rounded-full bg-white px-5 py-4 text-sm font-black text-lucy-charcoal transition-transform active:scale-[0.98] sm:w-auto sm:min-w-48">
                    <span>See more</span>
                    <ArrowRight size={16} style={{ color: SERVICES[activeService].color }} />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO I HELP ───────────────────────────────────── */}
        <section className="py-20 sm:py-24 px-6 sm:px-8 bg-lucy-charcoal text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
              <div>
                <p className="text-lucy-gold font-bold text-sm tracking-[0.25em] uppercase mb-3">Who I help</p>
                <h2 className="text-3xl sm:text-4xl font-semibold leading-tight mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Calm support for busy people, growing confidence and memorable plans.</h2>
                <p className="text-white/65 leading-relaxed">Left Hand Lucy brings together executive support, teaching and event experience, so the help feels practical, personal and easy to work with.</p>
              </div>
              <div className="grid gap-4">
                {WHO_I_HELP.map((item, index) => (
                  <motion.div key={item} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="bg-white/8 border border-white/10 rounded-2xl p-5 flex gap-4">
                    <CheckCircle size={20} className="text-lucy-gold flex-shrink-0 mt-0.5" />
                    <p className="text-white/85 leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WAYS TO WORK ─────────────────────────────────── */}
        <section className="py-20 sm:py-24 px-6 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lucy-sage font-bold text-sm tracking-[0.25em] uppercase mb-3">Ways we can work together</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>In person, virtual and flexible around real life.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {WORKING_MODES.map((mode) => (
                <div key={mode.title} className="border border-black/5 rounded-3xl p-7 bg-white shadow-lg shadow-black/[0.03]">
                  <p className="text-lucy-sage font-bold text-lg mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{mode.title}</p>
                  <p className="text-lucy-grey text-sm leading-relaxed">{mode.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ────────────────────────────────────────── */}
        <section id="meet-lucy" className="py-20 sm:py-28 px-6 sm:px-8 bg-lucy-cream">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="relative">
                  <div className="rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-black/10 ring-1 ring-black/5 rotate-[-1.5deg] bg-white p-2">
                    <div className="h-full w-full overflow-hidden rounded-[1.55rem]">
                      <Image src="/images/lucy-meet.jpg" alt="Lucy smiling in Madrid" width={900} height={1100} className="w-full h-full object-cover object-[68%_32%]" />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                    <p className="text-lucy-charcoal font-bold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{t('about.badge')}</p>
                    <p className="text-lucy-grey text-xs">{t('about.badge.sub')}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">{t('about.label')}</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal mb-2 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('about.title1')}
                </h2>
                <h3 className="text-xl italic text-lucy-sage mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('about.title2')}</h3>
                <div className="space-y-4 text-lucy-grey leading-relaxed text-sm">
                  <p>{t('about.p1')}</p>
                  <p>{t('about.p2')}</p>
                  <p>{t('about.p3')}</p>
                  <p>{t('about.p4')}</p>
                </div>
                <a href="#contact" className="inline-flex items-center gap-2 mt-8 bg-lucy-sage hover:bg-lucy-sage/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/20 text-sm">
                  {t('about.cta')} <ArrowRight size={14} />
                </a>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5 flex items-center gap-1.5"><Globe size={12} className="text-lucy-sage" /> {t('about.tag.english')}</span>
                  <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5 flex items-center gap-1.5"><MapPin size={12} className="text-lucy-blush" /> {t('about.tag.madrid')}</span>
                  <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5 flex items-center gap-1.5"><BookOpen size={12} className="text-lucy-gold" /> {t('about.tag.teacher')}</span>
                  <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5 flex items-center gap-1.5"><Calendar size={12} className="text-lucy-sage" /> {t('about.tag.planner')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CONECTADOS — Video background ────────────────── */}
        <section className="py-20 sm:py-24 px-6 sm:px-8 relative overflow-hidden">
          <div className="absolute inset-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/65" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-4">
              <Users size={28} className="text-lucy-gold" />
            </div>
            <p className="text-lucy-gold font-bold text-sm tracking-wide uppercase mb-3">{t('conectados.label')}</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('conectados.title')}</h2>
            <p className="text-white/60 text-base mb-8 max-w-lg mx-auto">{t('conectados.desc')}</p>
            <a href="https://connect-cardos.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-lucy-gold hover:bg-lucy-gold/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 text-sm">
              {t('conectados.cta')} <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────── */}
        <section id="testimonials" className="py-20 sm:py-28 px-6 sm:px-8 bg-lucy-cream">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-3">
                <MessageSquare size={20} className="text-lucy-blush" />
              </div>
              <p className="text-lucy-blush font-bold text-sm tracking-wide uppercase mb-3">{t('testimonials.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t('testimonials.title')}</h2>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        {/* ── FAQS ────────────────────────────────────────── */}
        <section id="faqs" className="py-20 sm:py-24 px-6 sm:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lucy-sage font-bold text-sm tracking-[0.25em] uppercase mb-3">FAQs</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>A few useful things to know.</h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((item) => (
                <div key={item.q} className="bg-lucy-cream rounded-2xl p-6">
                  <h3 className="text-lucy-charcoal font-bold text-xs sm:text-base mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{item.q}</h3>
                  <p className="text-lucy-grey text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────── */}
        <section id="contact" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-3">
                <Send size={20} className="text-lucy-sage" />
              </div>
              <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">{t('contact.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('contact.title')}</h2>
              <p className="text-lucy-grey max-w-lg mx-auto">{t('contact.desc')}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {[
                { Icon: Mail, label: 'Email', value: 'Lucy@lefthandlucy.com', href: 'mailto:Lucy@lefthandlucy.com', color: '#7B9E87' },
                { Icon: MapPin, label: 'Location', value: 'Madrid, Spain', href: '#', color: '#E8B4B8' },
                { Icon: MessageSquare, label: 'Reply time', value: 'Usually 1-2 working days', href: '#contact', color: '#C8A96E' },
              ].map(c => {
                const CIcon = c.Icon
                return (
                  <a key={c.label} href={c.href} className="bg-lucy-cream rounded-2xl p-6 text-center hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: c.color + '15' }}>
                      <CIcon size={20} style={{ color: c.color }} />
                    </div>
                    <p className="text-lucy-grey text-xs font-bold uppercase tracking-wide mb-1">{c.label}</p>
                    <p className="text-lucy-charcoal font-medium text-sm group-hover:text-lucy-sage transition-colors">{c.value}</p>
                  </a>
                )
              })}
            </div>
            <ContactForm />
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="bg-lucy-charcoal py-12 px-6 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-white text-lg font-semibold italic mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Left Hand Lucy</p>
                <p className="text-white/40 text-sm">{t('footer.tagline')}</p>
              </div>
              <div className="flex items-center gap-6">
                <a href="#services" className="text-white/40 hover:text-white text-sm transition-colors">{t('nav.services')}</a>
                <a href="#meet-lucy" className="text-white/40 hover:text-white text-sm transition-colors">{t('nav.meet')}</a>
                <a href="https://connect-cardos.vercel.app" className="text-white/40 hover:text-white text-sm transition-colors">Conectados</a>
                <a href="#contact" className="text-white/40 hover:text-white text-sm transition-colors">{t('nav.contact')}</a>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-white/20 text-xs">{t('footer.rights')}</p>
              <p className="text-white/20 text-xs">Lucy@lefthandlucy.com · Madrid, Spain</p>
            </div>
          </div>
        </footer>

        {selectedService !== null && (() => {
          const service = SERVICES[selectedService]
          return (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/55 px-4 py-4 backdrop-blur-sm" onClick={() => setSelectedService(null)}>
              <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button type="button" aria-label="Close service details" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-lucy-cream text-lucy-charcoal">
                  <X size={18} />
                </button>
                <div className="mb-5 h-1.5 w-20 rounded-full" style={{ backgroundColor: service.color }} />
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em]" style={{ color: service.color }}>Service details</p>
                <h3 className="mb-4 pr-10 text-3xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t(service.titleKey)}</h3>
                <p className="mb-5 text-sm leading-relaxed text-lucy-grey">{t(service.descKey)}</p>
                <div className="rounded-2xl bg-lucy-cream p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-lucy-charcoal/60">What this can include</p>
                  <ul className="grid gap-2">
                    {service.includes.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-lucy-charcoal">
                        <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: service.color }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 flex gap-3">
                  <a href="#contact" onClick={() => setSelectedService(null)} className="flex-1 bg-lucy-charcoal px-5 py-4 text-center text-sm font-extrabold text-white" style={{ borderRadius: '18px 18px 18px 4px' }}>Let's talk?</a>
                  <button type="button" onClick={() => setSelectedService(null)} className="px-5 py-4 text-sm font-bold text-lucy-grey">Close</button>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </div>
    </LangContext.Provider>
  )
}
