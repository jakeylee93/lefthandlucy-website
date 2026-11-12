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

/**
 * Section links (menu, "Next", dots) glide the chapter container to their target.
 * Everything else is the browser's own scrolling and CSS scroll-snap, so the
 * magnet works in both directions and never fights the visitor. The glide is
 * cancelled the instant the visitor scrolls, touches, clicks or presses a key;
 * snapping is paused only for the glide itself and restored on finish or cancel.
 */
export function useSectionScroll(scroller: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const box = scroller.current
    if (!box) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let origin = 0   // where the current glide started
    let goal = -1    // where it is heading (-1: no glide)
    const finish = () => { if (frame) cancelAnimationFrame(frame); frame = 0; goal = -1; box.style.removeProperty('scroll-snap-type') }
    const glide = (target: number) => {
      finish()
      origin = box.scrollTop; goal = target
      const start = box.scrollTop
      const distance = target - start
      if (Math.abs(distance) < 1) return
      if (reduced.matches) { box.scrollTop = target; return }
      const duration = Math.min(620, 300 + Math.abs(distance) * 0.18)
      const began = performance.now()
      box.style.scrollSnapType = 'none'
      const step = (now: number) => {
        const progress = Math.min(1, (now - began) / duration)
        box.scrollTop = start + distance * (1 - Math.pow(1 - progress, 3))
        if (progress < 1) frame = requestAnimationFrame(step)
        else finish()
      }
      frame = requestAnimationFrame(step)
    }
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const id = link?.getAttribute('href')?.slice(1)
      const target = id ? document.getElementById(id) : null
      if (!link || !target || !box.contains(target)) return
      event.preventDefault()
      history.replaceState(null, '', `#${id}`)
      // Let the click's own state changes (closing the menu) apply first.
      requestAnimationFrame(() => glide(Math.min(target.offsetTop, box.scrollHeight - box.clientHeight)))
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    const cancel = () => { if (frame) finish() }

    // A notched mouse wheel moves in ~100px steps, which native snapping would pull
    // straight back. So one notch = one chapter in the direction turned. A notch the
    // other way during the move turns it round at once; extra notches the same way
    // are simply absorbed until it lands. Trackpads and touch are left fully native.
    const tops = () => Array.from(box.querySelectorAll<HTMLElement>('.chapter')).map(chapter => chapter.offsetTop)
    const onWheel = (event: WheelEvent) => {
      const legacy = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
      const notched = event.deltaMode === 1 || (Math.abs(event.deltaY) >= 50 && Number.isInteger(event.deltaY) && typeof legacy === 'number' && legacy !== 0 && Math.abs(legacy) % 120 === 0)
      if (!notched || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) { cancel(); return }
      const down = event.deltaY > 0
      if (goal >= 0) {                                 // a move is under way
        event.preventDefault()
        if (down !== goal > origin) glide(origin)      // other way: turn round now (same way: already going there)
        return
      }
      if (getComputedStyle(box).scrollSnapType === 'none' || box.classList.contains('is-relaxed') || reduced.matches) return
      if ((event.target as HTMLElement | null)?.closest('textarea, select')) return
      event.preventDefault()
      const all = tops()
      const here = all.reduce((best, top) => Math.abs(top - box.scrollTop) < Math.abs(best - box.scrollTop) ? top : best, all[0] ?? 0)
      const next = down ? all.find(top => top > here + 1) : [...all].reverse().find(top => top < here - 1)
      if (next !== undefined) glide(next)
    }
    // Chapters taller than the screen (enlarged text, an opened "more"): relax snapping so every part stays reachable.
    const relax = () => box.classList.toggle('is-relaxed', Array.from(box.querySelectorAll<HTMLElement>('.chapter')).some(chapter => chapter.offsetHeight > box.clientHeight + 1))
    const sizes = new ResizeObserver(relax)
    box.querySelectorAll('.chapter').forEach(chapter => sizes.observe(chapter))
    sizes.observe(box)
    // Keys scroll the chapters even before anything inside has focus.
    if (document.activeElement === document.body) box.focus({ preventScroll: true })
    box.addEventListener('wheel', onWheel, { passive: false })
    box.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', cancel)
    window.addEventListener('mousedown', cancel)
    document.addEventListener('click', onClick)
    return () => { finish(); sizes.disconnect(); box.removeEventListener('wheel', onWheel); box.removeEventListener('touchstart', cancel); window.removeEventListener('keydown', cancel); window.removeEventListener('mousedown', cancel); document.removeEventListener('click', onClick) }
  }, [scroller])
}
