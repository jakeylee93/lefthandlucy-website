'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, GraduationCap, Luggage, PartyPopper, PenLine, Plane } from 'lucide-react'
import { SERVICES } from './site-data'
import { More } from './more'

type Translate = (key: string) => string
// Line icons tied to each service: planning and writing, teaching, events and travel.
const ICONS = { ps: [CalendarDays, PenLine], el: [GraduationCap, BookOpen], ee: [PartyPopper, Plane, Luggage] } as const

/** One service per screen: swipe, tap a name, or use the arrows. Native horizontal scroll-snap. */
export function ServicesCarousel({ t, onChoose, onActive, includes, edit, heading }: { t: Translate; onChoose: (id: string) => void; onActive?: (id: string) => void; includes?: Record<string, string[]>; edit?: boolean; heading: ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const cards = Array.from(el.children) as HTMLElement[]
      let best = 0
      cards.forEach((card, i) => { if (Math.abs(card.offsetLeft - el.offsetLeft - el.scrollLeft) < Math.abs(cards[best].offsetLeft - el.offsetLeft - el.scrollLeft)) best = i })
      setActive(best)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [])
  useEffect(() => { onActive?.(SERVICES[active].id) }, [active, onActive])

  const go = (index: number) => {
    const el = track.current
    if (!el) return
    const target = Math.max(0, Math.min(SERVICES.length - 1, index))
    const card = el.children[target] as HTMLElement
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: smooth ? 'smooth' : 'auto' })
    setActive(target)
  }

  return <div className="carousel" role="region" aria-roledescription="carousel" aria-label={t('services.title')}>
    <div className="carousel-head">
      <div className="section-heading">{heading}</div>
      <div className="carousel-controls">
        <button className="carousel-arrow" aria-label="Previous service" onClick={() => go(active - 1)} disabled={active === 0}><ArrowLeft size={17} /></button>
        <span className="carousel-count" aria-live="polite">{active + 1} / {SERVICES.length}</span>
        <button className="carousel-arrow" aria-label="Next service" onClick={() => go(active + 1)} disabled={active === SERVICES.length - 1}><ArrowRight size={17} /></button>
      </div>
    </div>
    <div className="carousel-tabs" role="tablist">
      {SERVICES.map((item, i) => <button key={item.id} role="tab" aria-selected={active === i} aria-controls={`service-${item.id}`} onClick={() => go(i)}><span data-anyos={`services.${item.id}.title`}>{t(`services.${item.id}.title`)}</span></button>)}
    </div>
    <div className="carousel-track" ref={track} tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) } }}>
      {SERVICES.map((item, index) => {
        const cta = t(`services.${item.id}.cta`)
        const Icons = ICONS[item.id as keyof typeof ICONS]
        return <article key={item.id} id={`service-${item.id}`} className={`service-card service-${item.id}${active === index ? ' is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${SERVICES.length}`}>
          <div className="service-icons" aria-hidden="true">{Icons.map((Icon, i) => <Icon key={i} strokeWidth={1.5} style={{ '--i': i } as CSSProperties} />)}</div>
          <div className="service-card-main">
            <span className="service-number" aria-hidden="true">0{index + 1}</span>
            <h3 data-anyos={`services.${item.id}.title`}>{t(`services.${item.id}.title`)}</h3>
            <p data-anyos={`services.${item.id}.desc`}>{t(`services.${item.id}.desc`)}</p>
            <a href="#contact" className="button button-primary" onClick={() => onChoose(item.id)}><span data-anyos={`services.${item.id}.cta`}>{cta === `services.${item.id}.cta` ? 'Get in touch' : cta}</span><ArrowRight size={16} /></a>
          </div>
          <More id={`included-${item.id}`} label={t('more.included')} less={t('more.less')} desktopOpen className="service-more">
            {/* Saved AnyVendor rows replace the built-in list (the owner can add or remove lines). */}
            <ul className="service-includes">{includes?.[item.id] ? includes[item.id].map((entry, i) => <li key={i}><span {...(edit ? { 'data-av-field': `services.${item.id}_includes.${i}.text` } : {})}>{entry}</span></li>) : item.includes.map((entry, i) => <li key={entry}><span data-anyos={`services.${item.id}.item${i + 1}`}>{entry}</span></li>)}</ul>
          </More>
        </article>
      })}
    </div>
  </div>
}
