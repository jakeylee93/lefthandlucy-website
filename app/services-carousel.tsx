'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SERVICES } from './site-data'

type Translate = (key: string) => string

/** Swipeable service cards: native horizontal scroll-snap, with tabs, arrows and a counter. */
export function ServicesCarousel({ t, onChoose }: { t: Translate; onChoose: (id: string) => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const cards = Array.from(el.children) as HTMLElement[]
      const left = el.scrollLeft
      let best = 0
      cards.forEach((card, i) => { if (Math.abs(card.offsetLeft - el.offsetLeft - left) < Math.abs(cards[best].offsetLeft - el.offsetLeft - left)) best = i })
      setActive(best)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [])

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
    <div className="carousel-tabs" role="tablist">
      {SERVICES.map((item, i) => <button key={item.id} role="tab" aria-selected={active === i} aria-controls={`service-${item.id}`} onClick={() => go(i)}><span className="tab-num">0{i + 1}</span><span data-anyos={`services.${item.id}.title`}>{t(`services.${item.id}.title`)}</span></button>)}
    </div>
    <div className="carousel-track" ref={track} tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) } }}>
      {SERVICES.map((item, index) => <article key={item.id} id={`service-${item.id}`} className={`service-card service-${item.id}${active === index ? ' is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${SERVICES.length}`}>
        <div className="service-card-main">
          <span className="service-number" aria-hidden="true">0{index + 1}</span>
          <h3 data-anyos={`services.${item.id}.title`}>{t(`services.${item.id}.title`)}</h3>
          <p data-anyos={`services.${item.id}.desc`}>{t(`services.${item.id}.desc`)}</p>
          <a href="#contact" className="button button-primary" onClick={() => onChoose(item.id)}><span data-anyos={`services.${item.id}.cta`}>Get in touch</span><ArrowRight size={16} /></a>
        </div>
        <ul className="service-includes">{item.includes.map((entry, i) => <li key={entry}><span data-anyos={`services.${item.id}.item${i + 1}`}>{entry}</span></li>)}</ul>
      </article>)}
    </div>
    <div className="carousel-controls">
      <button className="carousel-arrow" aria-label="Previous service" onClick={() => go(active - 1)} disabled={active === 0}><ArrowLeft size={18} /></button>
      <div className="carousel-progress" aria-hidden="true">{SERVICES.map((item, i) => <span key={item.id} className={i === active ? 'is-active' : ''} />)}</div>
      <span className="carousel-count" aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}</span>
      <button className="carousel-arrow" aria-label="Next service" onClick={() => go(active + 1)} disabled={active === SERVICES.length - 1}><ArrowRight size={18} /></button>
    </div>
  </div>
}
