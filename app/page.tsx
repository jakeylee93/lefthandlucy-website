'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, MapPin, ChevronLeft, ChevronRight, Star, MessageSquare, Menu, X, ExternalLink, Send, CheckCircle } from 'lucide-react'
import { translations, Lang } from './translations'
import Image from 'next/image'

// ── Language Context ──────────────────────────────────────
const LangContext = createContext<{ lang: Lang; t: (key: string) => string; setLang: (l: Lang) => void }>({
  lang: 'en', t: (k) => k, setLang: () => {},
})
function useLang() { return useContext(LangContext) }

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪' }

// ── Service modal data ────────────────────────────────────
const SERVICE_TILES = [
  {
    emoji: '💼',
    titleKey: 'services.ps.title',
    tagline: 'The extra pair of hands you need',
    color: '#C8A96E',
    modal: {
      description: "When life gets busy, I step in. Whether it's managing your inbox, organising your calendar, researching suppliers, or keeping a project on track — I handle the details so you can focus on the big picture.",
      secondPara: "I've supported high net worth executives and small business owners alike. No task is too small, no project too complex. I bring calm, structure, and reliability to everything I do.",
      includes: ['Email & inbox management', 'Calendar & scheduling', 'Research & analysis', 'Task coordination & deadlines', 'Document preparation', 'Travel arrangements'],
    }
  },
  {
    emoji: '📚',
    titleKey: 'services.el.title',
    tagline: 'Build confidence, one lesson at a time',
    color: '#E8B4B8',
    modal: {
      description: "English coaching designed around you. Whether you're preparing for a meeting, helping your child with school, or simply want to feel more confident in conversation — I adapt every lesson to your goals.",
      secondPara: "As a qualified teacher (QTS), I bring structure and creativity to every session. Lessons are relaxed, engaging, and always tailored to your level and learning style. Available in person in Madrid or online worldwide.",
      includes: ['Conversational English', 'Business & professional English', 'Children & young adults', 'Exam preparation (Cambridge, IELTS)', 'Pronunciation & accent coaching', 'Flexible scheduling'],
    }
  },
  {
    emoji: '🎉',
    titleKey: 'services.ep.title',
    tagline: 'From first idea to final toast',
    color: '#7B9E87',
    modal: {
      description: "Whether it's an intimate dinner, a milestone birthday, or a full-scale celebration — I bring calm creativity and meticulous organisation to every event. You enjoy the day; I handle everything else.",
      secondPara: "From venue sourcing and supplier coordination to on-the-day management, I take the stress out of planning so you can focus on what matters: being present with your guests.",
      includes: ['Venue sourcing & coordination', 'Budget planning & management', 'Vendor & supplier liaison', 'Creative theming & styling', 'On-the-day coordination', 'Post-event wrap-up'],
    }
  },
  {
    emoji: '🌍',
    titleKey: 'services.lang.title',
    tagline: 'Spanish, French & beyond',
    color: '#6B8EC4',
    modal: {
      description: "Moving to a new country? Need to brush up before a trip? I offer language support beyond English — helping you get comfortable with Spanish for life in Madrid, or French and German for work and travel.",
      secondPara: "Sessions are practical and conversation-focused. No boring textbooks — just real situations, real confidence, and a patient teacher who's been through the expat experience herself.",
      includes: ['Spanish for daily life', 'French conversation practice', 'German basics & travel prep', 'Expat survival language skills', 'Cultural tips & integration support', 'Online or in-person'],
    }
  },
  {
    emoji: '🎾',
    titleKey: 'services.padel.title',
    tagline: 'Get active, meet people',
    color: '#E07B5A',
    modal: {
      description: "Padel is the fastest-growing sport in Spain — and the best way to meet new people. I organise regular padel meetups for all levels, from complete beginners to experienced players.",
      secondPara: "It's social, it's fun, and it's a brilliant way to stay active while making real connections. All equipment can be provided, and everyone's welcome.",
      includes: ['Weekly group sessions', 'All levels welcome', 'Equipment available', 'Social drinks afterwards', 'Madrid-based courts', 'Great way to meet people'],
    }
  },
  {
    emoji: '🤝',
    titleKey: 'services.community.title',
    tagline: 'Connect with your people',
    color: '#9B7EC8',
    modal: {
      description: "Through Conectados, I bring together expats and locals in Madrid for paint nights, food walks, wine tastings, cultural tours, and more. Life's better when you know your people.",
      secondPara: "Whether you've just arrived in Madrid or have been here for years, there's always room for new connections. Events are relaxed, inclusive, and designed to help you feel at home.",
      includes: ['Paint & sip evenings', 'Food & tapas walks', 'Wine tasting socials', 'Cultural tours & day trips', 'Networking events', 'Open to everyone'],
    }
  },
]

const TESTIMONIALS = [
  { text: "I moved to Madrid recently, and Lucy's lessons helped me feel at home so quickly. Her explanations are simple, her examples practical, and she makes learning fun. I feel far more confident speaking now.", name: 'Amelia Grant', role: 'English student', service: 'English Lessons' },
  { text: "I've tried a few English tutors over the years, but Lucy stands out immediately. Her teaching style is clear, patient, and completely tailored to what I need. I genuinely look forward to our sessions each week.", name: 'Marco Hernández', role: 'Professional in Madrid', service: 'English Lessons' },
  { text: "Lucy is an absolute gem. She took my scattered ideas and turned them into a beautifully organised event that felt effortless from start to finish. Her calm approach and attention to detail made the whole experience stress-free.", name: 'Sophie Aldridge', role: 'Private event client', service: 'Event Planning' },
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
    { l: t('nav.faq'), h: '#about' },
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
              <a key={i.l} href={i.h} className={`text-sm font-medium transition-colors ${scrolled ? 'text-lucy-grey hover:text-lucy-charcoal' : 'text-white/70 hover:text-white'}`}>{i.l}</a>
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

// ── Service Modal ─────────────────────────────────────────
function ServiceModal({ service, onClose }: { service: typeof SERVICE_TILES[0] | null; onClose: () => void }) {
  const { t } = useLang()
  if (!service) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-black/5 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: service.color + '15' }}>
                  {service.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t(service.titleKey)}</h3>
                  <p className="text-xs text-lucy-grey italic">{service.tagline}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-lucy-cream rounded-full flex items-center justify-center text-lucy-grey hover:text-lucy-charcoal transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <p className="text-lucy-charcoal text-sm leading-relaxed mb-4">{service.modal.description}</p>
            <p className="text-lucy-grey text-sm leading-relaxed mb-6">{service.modal.secondPara}</p>

            <h4 className="text-xs font-bold text-lucy-grey uppercase tracking-wide mb-3">What&apos;s included</h4>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {service.modal.includes.map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-lucy-charcoal">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: service.color }} />
                  {item}
                </div>
              ))}
            </div>

            <a href="#contact" onClick={onClose}
              className="block w-full text-center py-3.5 rounded-full font-bold text-white text-sm transition-all hover:scale-[1.02] shadow-lg"
              style={{ backgroundColor: service.color }}>
              Enquire about this →
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
    { key: 'contact.service.ep', value: 'Event Planning' },
    { key: 'contact.service.padel', value: 'Padel Meetups' },
    { key: 'contact.service.other', value: 'Other' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
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
  const [activeService, setActiveService] = useState<typeof SERVICE_TILES[0] | null>(null)
  const t = (key: string) => translations[lang][key] || translations['en'][key] || key

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="min-h-screen bg-white">
        <Nav />

        {/* ── HERO — Full screen, centered text, minimal ──── */}
        <section className="h-screen relative overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/lucy.jpg" alt="Lucy" fill className="object-cover object-[center_20%]" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 sm:pb-24 px-6 text-center">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm font-bold tracking-[0.35em] uppercase mb-5"
              style={{ color: '#E07B5A' }}>
              {t('hero.tags')}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#E07B5A' }}>
              Left Hand Lucy
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/60 text-sm sm:text-base max-w-md italic mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('hero.tagline')}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-white/50 text-xs sm:text-sm max-w-lg leading-relaxed">
              {t('hero.intro')}
            </motion.p>
          </div>
        </section>

        {/* ── SERVICES — 6 clickable tiles ─────────────────── */}
        <section id="services" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">{t('services.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t('services.title')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {SERVICE_TILES.map((s, i) => (
                <motion.button
                  key={s.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveService(s)}
                  className="group bg-lucy-cream rounded-2xl p-6 sm:p-8 text-left hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="text-3xl sm:text-4xl mb-4">{s.emoji}</div>
                  <h3 className="text-base sm:text-lg font-bold text-lucy-charcoal mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>{t(s.titleKey)}</h3>
                  <p className="text-lucy-grey text-xs sm:text-sm leading-relaxed">{s.tagline}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-2" style={{ color: s.color }}>
                    Find out more <ArrowRight size={12} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Service Modal */}
        <ServiceModal service={activeService} onClose={() => setActiveService(null)} />

        {/* ── ABOUT ────────────────────────────────────────── */}
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
                  {['about.tag.english', 'about.tag.madrid', 'about.tag.teacher', 'about.tag.planner'].map(key => (
                    <span key={key} className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5">{t(key)}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CONECTADOS — Video background ────────────────── */}
        <section className="py-20 sm:py-24 px-6 sm:px-8 relative overflow-hidden">
          <div className="absolute inset-0">
            <video
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
              poster=""
            >
              <source src="https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/65" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
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
              <p className="text-lucy-blush font-bold text-sm tracking-wide uppercase mb-3">{t('testimonials.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{t('testimonials.title')}</h2>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────── */}
        <section id="contact" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">{t('contact.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('contact.title')}</h2>
              <p className="text-lucy-grey max-w-lg mx-auto">{t('contact.desc')}</p>
            </div>
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
