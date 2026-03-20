'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, BookOpen, Calendar, Briefcase, ChevronLeft, ChevronRight, Star, Heart, MessageSquare, Menu, X, ExternalLink } from 'lucide-react'

const SERVICES = [
  {
    icon: Calendar,
    title: 'Event Planning',
    desc: "From intimate gatherings to full-scale occasions, I bring calm structure and thoughtful creativity to every detail. I'll organise, coordinate, and guide your event from idea to execution.",
    features: ['Venue sourcing & coordination', 'Budget management', 'Vendor & supplier liaison', 'On-the-day management', 'Creative theming & styling'],
    color: '#7B9E87',
    href: '/services/event-planning',
  },
  {
    icon: BookOpen,
    title: 'English Lessons',
    desc: "English coaching designed to build confidence. Whether you want to improve conversation, writing, or professional communication, I adapt to your goals and learning style.",
    features: ['Conversational English', 'Business & professional English', 'Children & young adults', 'Exam preparation', 'Flexible online or in-person'],
    color: '#E8B4B8',
    href: '/services/english-lessons',
  },
  {
    icon: Briefcase,
    title: 'Project Support',
    desc: "When life gets busy, I can help. From admin and research to scheduling and task organisation, I'll help you stay on track, meet deadlines, and keep projects moving.",
    features: ['Administrative support', 'Research & analysis', 'Calendar & schedule management', 'Task coordination', 'Deadline tracking'],
    color: '#C8A96E',
    href: '/services/project-support',
  },
]

const TESTIMONIALS = [
  { text: "I moved to Madrid recently, and Lucy's lessons helped me feel at home so quickly. Her explanations are simple, her examples practical, and she makes learning fun. I feel far more confident speaking now.", name: 'Amelia Grant', role: 'English student', service: 'English Lessons' },
  { text: "I've tried a few English tutors over the years, but Lucy stands out immediately. Her teaching style is clear, patient, and completely tailored to what I need. I genuinely look forward to our sessions each week.", name: 'Marco Hernández', role: 'Professional in Madrid', service: 'English Lessons' },
  { text: "Lucy is an absolute gem. She took my scattered ideas and turned them into a beautifully organised event that felt effortless from start to finish. Her calm approach and attention to detail made the whole experience stress-free.", name: 'Sophie Aldridge', role: 'Private event client', service: 'Event Planning' },
  { text: "I was drowning in admin and deadlines. Lucy stepped in and within a week everything was organised and running smoothly. She's incredibly reliable and nothing is too much trouble.", name: 'David Chen', role: 'Small business owner', service: 'Project Support' },
  { text: "My daughter's confidence in English has absolutely soared since starting lessons with Lucy. She makes it feel like fun, not work. We couldn't be happier.", name: 'Isabel Moreno', role: 'Parent', service: 'English Lessons' },
]

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/" className="flex items-center gap-2">
            <span className="text-lucy-charcoal text-xl font-semibold italic" style={{ fontFamily: 'var(--font-heading)' }}>Left Hand Lucy</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[{ l: 'Services', h: '#services' }, { l: 'About', h: '#about' }, { l: 'Testimonials', h: '#testimonials' }, { l: 'Conectados', h: 'https://connect-cardos.vercel.app' }].map(i => (
              <a key={i.l} href={i.h} className="text-lucy-grey hover:text-lucy-charcoal text-sm font-medium transition-colors">{i.l}</a>
            ))}
            <a href="#contact" className="bg-lucy-sage hover:bg-lucy-sage/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105">Let's Talk</a>
          </div>
          <button className="md:hidden text-lucy-charcoal" onClick={() => setOpen(!open)}>{open ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-black/5 px-6 py-4">
          {[{ l: 'Services', h: '#services' }, { l: 'About', h: '#about' }, { l: 'Testimonials', h: '#testimonials' }, { l: 'Conectados', h: 'https://connect-cardos.vercel.app' }].map(i => (
            <a key={i.l} href={i.h} className="block py-2 text-lucy-grey text-base font-medium" onClick={() => setOpen(false)}>{i.l}</a>
          ))}
          <a href="#contact" className="block mt-2 bg-lucy-sage text-white px-5 py-3 rounded-full text-center font-bold" onClick={() => setOpen(false)}>Let's Talk</a>
        </div>
      )}
    </nav>
  )
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0)
  const next = () => setActive(a => (a + 1) % TESTIMONIALS.length)
  const prev = () => setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  useEffect(() => { const t = setInterval(next, 6000); return () => clearInterval(t) }, [])
  const t = TESTIMONIALS[active]
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center px-8">
          <div className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-lucy-gold text-lucy-gold" />)}</div>
          <p className="text-lucy-charcoal text-lg sm:text-xl leading-relaxed mb-6 italic" style={{ fontFamily: 'var(--font-heading)' }}>&ldquo;{t.text}&rdquo;</p>
          <p className="text-lucy-charcoal font-bold text-sm">{t.name}</p>
          <p className="text-lucy-grey text-xs mt-1">{t.role} · {t.service}</p>
        </motion.div>
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"><ChevronLeft size={18} className="text-lucy-charcoal" /></button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"><ChevronRight size={18} className="text-lucy-charcoal" /></button>
      </div>
      <div className="flex justify-center gap-2 mt-8">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all ${i === active ? 'bg-lucy-sage w-6' : 'bg-black/10 w-2'}`} />)}</div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* HERO */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-lucy-cream">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lucy-sage/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lucy-blush/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-24 pb-16 relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-6">Madrid-based freelancer</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-6 text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
              A trusted hand for life&apos;s busy corners
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lucy-grey text-lg leading-relaxed mb-8 max-w-lg">
              I&apos;m Lucy — a qualified teacher, event planner, and organiser based in Madrid. I help people learn, celebrate, and get things done.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3 mb-10">
              <a href="#services" className="bg-lucy-sage hover:bg-lucy-sage/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/20 text-sm">Explore Services</a>
              <a href="#contact" className="bg-white text-lucy-charcoal border-2 border-lucy-charcoal/10 hover:border-lucy-charcoal/20 px-7 py-3.5 rounded-full font-bold transition-all text-sm">Get in Touch</a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 text-sm text-lucy-grey">
              <MapPin size={14} className="text-lucy-sage" />
              <span>Based in Madrid, Spain</span>
              <span className="mx-2 text-black/10">·</span>
              <span>Available worldwide online</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">What I Do</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>Another string to your bow</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group bg-lucy-cream rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: s.color + '15' }}>
                    <Icon size={24} style={{ color: s.color }} />
                  </div>
                  <h3 className="text-xl font-semibold text-lucy-charcoal mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{s.title}</h3>
                  <p className="text-lucy-grey text-sm leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {s.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-lucy-charcoal">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: s.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={s.href} className="inline-flex items-center gap-1 text-sm font-bold transition-colors group-hover:gap-2" style={{ color: s.color }}>
                    Learn more <ArrowRight size={14} />
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
                <div className="bg-lucy-sage/10 rounded-3xl aspect-[4/5] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-lucy-sage/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Heart size={32} className="text-lucy-sage" />
                    </div>
                    <p className="text-lucy-sage text-sm font-medium">Photo coming soon</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                  <p className="text-lucy-charcoal font-bold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Qualified Teacher</p>
                  <p className="text-lucy-grey text-xs">QTS · Madrid-based</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">About Lucy</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal mb-6 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Making things happen,<br /><span className="italic text-lucy-sage">one step at a time</span>
              </h2>
              <div className="space-y-4 text-lucy-grey leading-relaxed">
                <p>I&apos;m a qualified teacher and event planner who moved to Madrid for the sunshine and stayed for the people. With years of experience in education and organisation, I help expats and locals navigate life&apos;s busy corners.</p>
                <p>Whether you need to polish your English, plan an unforgettable celebration, or just get on top of your to-do list — I&apos;m your person. I bring the same energy to every project: calm, creative, and completely committed.</p>
                <p>I also run <a href="https://connect-cardos.vercel.app" className="text-lucy-sage font-bold hover:underline">Conectados</a> — community events for expats and locals in Madrid. Because life&apos;s better when you know your people.</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5">🇬🇧 Native English</span>
                <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5">🇪🇸 Based in Madrid</span>
                <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5">📚 Qualified Teacher</span>
                <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-lucy-charcoal border border-black/5">🎉 Event Planner</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONECTADOS BANNER */}
      <section className="py-16 px-6 sm:px-8 bg-lucy-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-lucy-gold font-bold text-sm tracking-wide uppercase mb-3">Community Events</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Looking for something social?</h2>
          <p className="text-white/60 text-base mb-8 max-w-lg mx-auto">Join Conectados — my community events for expats and locals in Madrid. Paint nights, food walks, wine socials, and more.</p>
          <a href="https://connect-cardos.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-lucy-gold hover:bg-lucy-gold/90 text-white px-7 py-3.5 rounded-full font-bold transition-all hover:scale-105 text-sm">
            Explore Conectados <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 sm:py-28 px-6 sm:px-8 bg-lucy-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lucy-blush font-bold text-sm tracking-wide uppercase mb-3">Kind Words</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>What people say</h2>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 sm:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lucy-sage font-bold text-sm tracking-wide uppercase mb-3">Get in Touch</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-lucy-charcoal mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Let&apos;s talk about what you need</h2>
            <p className="text-lucy-grey max-w-lg mx-auto">Whether you have a question, want to book a lesson, or need help planning something special — I&apos;d love to hear from you.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, label: 'Email', value: 'Lucy@lefthandlucy.com', href: 'mailto:Lucy@lefthandlucy.com', color: '#7B9E87' },
              { icon: MapPin, label: 'Location', value: 'Madrid, Spain', href: '#', color: '#E8B4B8' },
              { icon: MessageSquare, label: 'WhatsApp', value: 'Message me', href: '#', color: '#C8A96E' },
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
          <div className="text-center">
            <a href="mailto:Lucy@lefthandlucy.com" className="inline-flex items-center gap-2 bg-lucy-sage hover:bg-lucy-sage/90 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-lucy-sage/20">
              <Mail size={18} /> Send Lucy a Message
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-lucy-charcoal py-12 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-white text-lg font-semibold italic mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Left Hand Lucy</p>
              <p className="text-white/40 text-sm">Another string to your bow</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#services" className="text-white/40 hover:text-white text-sm transition-colors">Services</a>
              <a href="#about" className="text-white/40 hover:text-white text-sm transition-colors">About</a>
              <a href="https://connect-cardos.vercel.app" className="text-white/40 hover:text-white text-sm transition-colors">Conectados</a>
              <a href="#contact" className="text-white/40 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-white/20 text-xs">&copy; 2026 Left Hand Lucy. All rights reserved.</p>
            <p className="text-white/20 text-xs">Lucy@lefthandlucy.com · Madrid, Spain</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
