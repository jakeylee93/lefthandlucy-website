/** The Left Hand Lucy signature: one hand-drawn fine-line left hand, nine gestures, one shown at a time. */
'use client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

export type HandPose = 'wave' | 'thumbsUp' | 'ok' | 'pointRight' | 'pointDown' | 'peace' | 'three' | 'palm' | 'fist'
export const HAND_POSES: HandPose[] = ['wave', 'thumbsUp', 'ok', 'pointRight', 'pointDown', 'peace', 'three', 'palm', 'fist']

// ── Line-ink hand ────────────────────────────────────────────────────────
// public/hand/sheet.webp is a 9 × 9 grid built by assets-src/hand/build.py (see its README):
// one row per pose (HAND_POSES order), column 0 = relaxed open hand, column 8 = the pose.
// Changing pose plays the current row back to the open hand, then the new row forward.
const SHEET = '/hand/sheet.webp'
const FRAMES = 9
const FRAME_MS = 30 // ≈ 16 steps ≈ 480 ms per change
const cell = (row: number, col: number) => `${(col / (FRAMES - 1)) * 100}% ${(row / (HAND_POSES.length - 1)) * 100}%`

/**
 * The hand signature: the fine-line ink left hand (palm towards you, thumb on your left).
 * It only animates on a pose change, never in a loop; with reduced motion, or
 * while the tab is hidden, it switches straight to the final still.
 */
export function LeftHand({ pose, className = '', title }: { pose: HandPose; className?: string; title?: string }) {
  const [ready, setReady] = useState(false)
  const el = useRef<HTMLSpanElement>(null)
  const shown = useRef<{ row: number; col: number }>({ row: HAND_POSES.indexOf(pose), col: FRAMES - 1 })

  useEffect(() => {
    // Fetch the sheet after the page has settled, so it never competes with first paint.
    const load = () => { const image = new Image(); image.onload = () => setReady(true); image.src = SHEET }
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
    const timer = idle ? idle(load) : window.setTimeout(load, 1200)
    return () => { if (!idle) window.clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const node = el.current
    if (!ready || !node) return
    const target = HAND_POSES.indexOf(pose)
    const paint = (row: number, col: number) => { shown.current = { row, col }; node.style.backgroundPosition = cell(row, col) }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden || shown.current.row === target) { paint(target, FRAMES - 1); return }
    let timer = 0
    const step = () => {
      const { row, col } = shown.current
      if (row !== target) { if (col > 0) paint(row, col - 1); else paint(target, 0) }   // back to the open hand, then switch row
      else if (col < FRAMES - 1) paint(row, col + 1)
      if (shown.current.row !== target || shown.current.col < FRAMES - 1) timer = window.setTimeout(step, FRAME_MS)
    }
    timer = window.setTimeout(step, FRAME_MS)
    return () => window.clearTimeout(timer)
  }, [pose, ready])

  // First paint is the small still for this pose (4–8 KB); the sheet replaces it once loaded.
  const style: CSSProperties = ready
    ? { backgroundImage: `url(${SHEET})`, backgroundSize: `${FRAMES * 100}% ${HAND_POSES.length * 100}%`, backgroundPosition: cell(shown.current.row, shown.current.col) }
    : { backgroundImage: `url(/hand/poster-${pose}.webp)`, backgroundSize: 'contain', backgroundPosition: 'center' }
  return <span ref={el} className={`hand-sprite ${className}`} data-pose={pose} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style} />
}
