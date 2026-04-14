'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, BookOpen, Calendar, Briefcase, ChevronLeft, ChevronRight, Star, MessageSquare, Menu, X, ExternalLink, Send, CheckCircle } from 'lucide-react'
import { translations, Lang } from './translations'
import Image from 'next/image'

// ── Language Context ──────────────────────────────────────
const LangContext = createContext<{ lang: Lang; t: (key: string) => string; setLang: (l: Lang) => void }>({
  lang: 'en', t: (k) => k, setLang: () => {},
})

function useLang() { return useContext(LangContext) }

// ── Data ──────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Briefcase,
    titleKey: 'services.ps.title',
    descKey: 'services.ps.desc',
    features: ['Administrative support', 'Research & analysis', 'Calendar & schedule management', 'Task coordination', 'Deadline tracking'],
    color: '#C8A96E',
    href: '#contact',
  },
  {
    icon: BookOpen,
    titleKey: 'services.el.title',
    descKey: 'services.el.desc',
    features: ['Conversational English', 'Business & professional English', 'Children & young adults', 'Exam preparation', 'Flexible online or in-person'],
    color: '#E8B4B8',
    href: '#contact',
  },
  {
    icon: Calendar,
    titleKey: 'services.ep.title',
    descKey: 'services.ep.desc',
    features: ['Venue sourcing & coordination', 'Budget management', 'Vendor & supplier liaison', 'On-the-day management', 'Creative theming & styling'],
    color: '#7B9E87',
    href: '#contact',
  },
]

const TESTIMONIALS = [
  { text: "I moved to Madrid recently, and Lucy's lessons helped me feel at home so quickly. Her explanations are simple, her examples practical, and she makes learning fun. I feel far more confident speaking now.", name: 'Amelia Grant', role: 'English student', service: 'English Lessons' },
  { text: "I've tried a few English tutors over the years, but Lucy stands out immediately. Her teaching style is clear, patient, and completely tailored to what I need. I genuinely look forward to our sessions each week.", name: 'Marco Hernández', role: 'Professional in Madrid', service: 'English Lessons' },
  { text: "Lucy is an absolute gem. She took my scattered ideas and turned them into a beautifully organised event that felt effortless from start to finish. Her calm approach and attention to detail made the whole experience stress-free.", name: 'Sophie Aldridge', role: 'Private event client', service: 'Event Planning' },
  { text: "I was drowning in admin and deadlines. Lucy stepped in and within a week everything was organised and running smoothly. She's incredibly reliable and nothing is too much trouble.", name: 'David Chen', role: 'Small business owner', service: 'Project Support' },
  { text: "My daughter's confidence in English has absolutely soared since starting lessons with Lucy. She makes it feel like fun, not work. We couldn't be happier.", name: 'Isabel Moreno', role: 'Parent', service: 'English Lessons' },
]

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪' }

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
    { l: t('nav.faq'), h: '#about' },
    { l: t('nav.contact'), h: '#contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2">
            <span className={`text-xl font-semibold italic ${scrolled ? 'text-lucy-charcoal' : 'text-white'}`} style={{ fontFamily: 'var(--font-heading)' }}>Left Hand Lucy</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(i => (
              <a key={i.l} href={i.h} className={`text-sm font-medium transition-colors ${scrolled ? 'text-lucy-grey hover:text-lucy-charcoal' : 'text-white/70 hover:text-white'}`}>{i.l}</a>
            ))}
            {/* Language switcher */}
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
            <a href="#contact" className="bg-lucy-sage hover:bg-lucy-sage/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105">{t('nav.contact')}</a>
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
          <a href="#contact" className="block mt-2 bg-lucy-sage text-white px-5 py-3 rounded-full text-center font-bold" onClick={() => setOpen(false)}>{t('nav.contact')}</a>
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
  useEffect(() => { const t = setInterval(next, 6000); return () => clearInterval(t) }, [])
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
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"><ChevronLeft size={18} className="text-lucy-charcoal" /></button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"><ChevronRight size={18} className="text-lucy-charcoal" /></button>
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
    { key: 'contact.service.ep', value: 'Event Planning' },
    { key: 'contact.service.padel', value: 'Padel Meetups' },
    { key: 'contact.service.other', value: 'Other' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    // For now, open mailto with form data — can be upgraded to API route later
    const subject = `Website Enquiry: ${form.service || 'General'}`
    const body = `Name: ${form.name}\nEmail: ${form.email}\nService: ${form.service}\n\n${form.message}`
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
  const t = (key: string) => translations[lang][key] || translations['en'][key] || key

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="min-h-screen bg-white">
        <Nav />

        {/* HERO — Full screen Lucy photo */}
        <section className="min-h-screen relative overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image src="/images/lucy.jpg" alt="Lucy" fill className="object-cover object-top" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 min-h-screen flex flex-col justify-end pb-16 sm:pb-20 pt-24">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-white/60 font-bold text-xs sm:text-sm tracking-[0.3em] uppercase mb-6">
              {t('hero.tags')}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('hero.title')}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/50 text-sm sm:text-base italic max-w-lg mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('hero.tagline')}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-white/70 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
              {t('hero.intro')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-3">
              <a href="#services" className="bg-lucy-sage hover:bg-lucy-sage/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/30 text-sm">
                {t('hero.cta1')}
              </a>
              <a href="#contact" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-7 py-3.5 rounded-full font-bold transition-all text-sm">
                {t('hero.cta2')}
              </a>
            </motion.div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">{t('services.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t('services.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {SERVICES.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div key={s.titleKey} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="group bg-lucy-cream rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: s.color + '15' }}>
                      <Icon size={24} style={{ color: s.color }} />
                    </div>
                    <h3 className="text-xl font-semibold text-lucy-charcoal mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t(s.titleKey)}</h3>
                    <p className="text-lucy-grey text-sm leading-relaxed mb-5">{t(s.descKey)}</p>
                    <ul className="space-y-2 mb-6">
                      {s.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm text-lucy-charcoal">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: s.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a href={s.href} className="inline-flex items-center gap-1 text-sm font-bold transition-colors group-hover:gap-2" style={{ color: s.color }}>
                      {t('services.learnmore')} <ArrowRight size={14} />
                    </a>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-20 sm:py-28 px-6 sm:px-8 bg-lucy-cream">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="relative">
                  <div className="rounded-3xl overflow-hidden aspect-[4/5]">
                    <Image src="/images/lucy.jpg" alt="Lucy" width={600} height={750} className="w-full h-full object-cover object-top" />
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
                <div className="space-y-4 text-lucy-grey leading-relaxed">
                  <p>{t('about.p1')}</p>
                  <p>{t('about.p2')}</p>
                  <p>{t('about.p3')}</p>
                  <p>{t('about.p4')}</p>
                </div>
                <a href="#contact" className="inline-flex items-center gap-2 mt-8 bg-lucy-sage hover:bg-lucy-sage/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/20 text-sm">
                  {t('about.cta')} <ArrowRight size={14} />
                </a>
                <div className="flex flex-wrap gap-3 mt-6">
                  {['about.tag.english', 'about.tag.madrid', 'about.tag.teacher', 'about.tag.planner'].map(key => (
                    <span key={key} className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5">{t(key)}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CONECTADOS BANNER */}
        <section className="py-16 px-6 sm:px-8 bg-lucy-charcoal relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <p className="text-lucy-gold font-bold text-sm tracking-wide uppercase mb-3">{t('conectados.label')}</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('conectados.title')}</h2>
            <p className="text-white/60 text-base mb-8 max-w-lg mx-auto">{t('conectados.desc')}</p>
            <a href="https://connect-cardos.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-lucy-gold hover:bg-lucy-gold/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 text-sm">
              {t('conectados.cta')} <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-20 sm:py-28 px-6 sm:px-8 bg-lucy-cream">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lucy-blush font-bold text-sm tracking-wide uppercase mb-3">{t('testimonials.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t('testimonials.title')}</h2>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">{t('contact.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('contact.title')}</h2>
              <p className="text-lucy-grey max-w-lg mx-auto">{t('contact.desc')}</p>
            </div>

            {/* Contact cards */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Mail, label: 'Email', value: 'Lucy@lefthandlucy.com', href: 'mailto:Lucy@lefthandlucy.com', color: '#7B9E87' },
                { icon: MapPin, label: 'Location', value: 'Madrid, Spain', href: '#', color: '#E8B4B8' },
                { icon: MessageSquare, label: 'WhatsApp', value: 'Message me', href: 'https://wa.me/message', color: '#C8A96E' },
              ].map(c => {
                const Icon = c.icon
                return (
                  <a key={c.label} href={c.href} className="bg-lucy-cream rounded-2xl p-6 text-center hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: c.color + '15' }}>
                      <Icon size={20} style={{ color: c.color }} />
                    </div>
                    <p className="text-lucy-grey text-xs font-bold uppercase tracking-wide mb-1">{c.label}</p>
                    <p className="text-lucy-charcoal font-medium text-sm group-hover:text-lucy-sage transition-colors">{c.value}</p>
                  </a>
                )
              })}
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-lucy-charcoal py-12 px-6 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-white text-lg font-semibold italic mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Left Hand Lucy</p>
                <p className="text-white/40 text-sm">{t('footer.tagline')}</p>
              </div>
              <div className="flex items-center gap-6">
                <a href="#services" className="text-white/40 hover:text-white text-sm transition-colors">{t('nav.services')}</a>
                <a href="#about" className="text-white/40 hover:text-white text-sm transition-colors">{t('about.label')}</a>
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
      </div>
    </LangContext.Provider>
  )
}
