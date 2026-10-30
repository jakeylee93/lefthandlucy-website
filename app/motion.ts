'use client'
import { useEffect, type RefObject } from 'react'

const clamp = (value: number) => Math.min(1, Math.max(0, value))

function useReducedMotion(callback: (reduced: boolean) => void | (() => void)) {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cleanup = callback(query.matches)
    const onChange = () => { if (typeof cleanup === 'function') cleanup(); cleanup = callback(query.matches) }
    query.addEventListener('change', onChange)
    return () => { query.removeEventListener('change', onChange); if (typeof cleanup === 'function') cleanup() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/**
 * Writes scroll progress into CSS custom properties so the layers are moved by
 * CSS transforms only. Progress is derived from the current scroll position,
 * so scrolling back up plays every layer in reverse. Reduced motion: no values.
 *   --p : 0 when the element's top is at the viewport top, 1 when it has left.
 *   --q : 0 when the element enters at the bottom, 1 when it leaves at the top.
 */
export function useScrollLayers(refs: RefObject<HTMLElement | null>[]) {
  useReducedMotion(reduced => {
    const elements = refs.map(ref => ref.current).filter(Boolean) as HTMLElement[]
    if (reduced) { elements.forEach(el => { el.style.removeProperty('--p'); el.style.removeProperty('--q') }); return }
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom < -vh || rect.top > vh * 2) continue
        el.style.setProperty('--p', clamp(-rect.top / Math.max(rect.height, 1)).toFixed(4))
        el.style.setProperty('--q', clamp((vh - rect.top) / (vh + rect.height)).toFixed(4))
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  })
}

/** Gentle one-way fade-up for blocks marked .reveal. Content stays visible without JS or with reduced motion. */
export function useReveal() {
  useReducedMotion(reduced => {
    const root = document.documentElement
    if (reduced || !('IntersectionObserver' in window)) { root.classList.remove('motion-ok'); return }
    root.classList.add('motion-ok')
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target) }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    const observe = () => document.querySelectorAll('.reveal:not(.is-in)').forEach(el => observer.observe(el))
    observe()
    const mutations = new MutationObserver(observe)
    mutations.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutations.disconnect() }
  })
}

/**
 * Lucy can blank a field in the editor (it is saved as "<br />"). Containers
 * marked data-hide-empty are hidden when every editable field inside is blank,
 * so cleared badges or tags never leave an empty pill behind.
 */
export function useHideEmptyEditable() {
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      document.querySelectorAll<HTMLElement>('[data-hide-empty]').forEach(container => {
        const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-anyos]'))
        const empty = fields.length > 0 && fields.every(field => !(field.textContent || '').trim())
        if (empty) container.setAttribute('data-empty', '')
        else container.removeAttribute('data-empty')
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
    check()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [])
}
