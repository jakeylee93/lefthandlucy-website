'use client'
import { useEffect, useState } from 'react'
import type { Lang } from './translations'

type Section = { id: string; title: string; body: string; image?: string; imageAlt?: string; items?: { title: string; body: string }[]; cta?: string; href?: string; language?: string }
const safeHref = (value: string) => /^(https:\/\/|mailto:|tel:|#[a-z])/i.test(value) ? value : '#contact'

export function SiteSections({ lang }: { lang: Lang }) {
  const [sections, setSections] = useState<Section[]>([])
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('https://platform.anyos.co.uk/api/site-cms/left-hand-lucy/content', { cache: 'no-store' })
        const data = await response.json()
        const parsed = JSON.parse(data.content?.['__sections'] || '[]')
        if (active && Array.isArray(parsed)) setSections(parsed.filter((item: Section) => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.body === 'string').slice(0, 20).map(item => ({ ...item, image: typeof item.image === 'string' ? item.image : '', imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : '', cta: typeof item.cta === 'string' ? item.cta : '', href: typeof item.href === 'string' ? item.href : '', items: Array.isArray(item.items) ? item.items.filter((entry: Section) => entry && typeof entry.title === 'string' && typeof entry.body === 'string') : [] })))
      } catch { /* Existing site remains available if CMS is temporarily offline. */ }
    }
    void load()
    window.addEventListener('focus', load)
    return () => { active = false; window.removeEventListener('focus', load) }
  }, [])
  return <>{sections.filter(section => !section.language || section.language === lang).map(section => <section key={section.id} id={`section-${section.id}`} className="section-space custom-section"><div className="container"><div className="section-heading"><h2>{section.title}</h2></div><p className="custom-body">{section.body}</p>{section.image?.startsWith('https://') && <img className="custom-image" src={section.image} alt={section.imageAlt || ''} loading="lazy" />}{Array.isArray(section.items) && <div className="custom-columns">{section.items.slice(0, 12).map((item, index) => <article className="custom-item" key={index}><h3>{item.title}</h3><p className="custom-body">{item.body}</p></article>)}</div>}{section.cta && <a className="button button-primary" href={safeHref(section.href || '#contact')}>{section.cta}</a>}</div></section>)}</>
}
