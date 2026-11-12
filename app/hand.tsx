/**
 * The Left Hand Lucy signature: one left hand (palm towards you, thumb on the
 * right) drawn from a single set of shapes. Every gesture is the same palm and
 * five fingers in a different position, so poses share one silhouette and
 * ease naturally from one to the next. Only one gesture shows at a time.
 */
'use client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

export type HandPose = 'wave' | 'thumbsUp' | 'ok' | 'pointRight' | 'pointDown' | 'peace' | 'three' | 'palm' | 'fist'
export const HAND_POSES: HandPose[] = ['wave', 'thumbsUp', 'ok', 'pointRight', 'pointDown', 'peace', 'three', 'palm', 'fist']

type Digit = [angle: number, length: number]
interface Pose { rot: number; fingers: [Digit, Digit, Digit, Digit]; thumb: Digit }
const CURL: Digit = [0, 0.2]
// Fingers are listed little finger → index finger (left → right).
const POSES: Record<HandPose, Pose> = {
  wave:       { rot: -10, fingers: [[-15, 1], [-5, 1], [4, 1], [13, 1]], thumb: [50, 1] },
  thumbsUp:   { rot: -90, fingers: [CURL, CURL, CURL, CURL], thumb: [84, 1.05] },
  ok:         { rot: -6,  fingers: [[-16, 1], [-6, 1], [4, 1], [58, 0.72]], thumb: [31, 1.12] },
  pointRight: { rot: 90,  fingers: [CURL, CURL, CURL, [0, 1.05]], thumb: [20, 0.5] },
  pointDown:  { rot: 180, fingers: [CURL, CURL, CURL, [0, 1.05]], thumb: [20, 0.5] },
  peace:      { rot: 0,   fingers: [CURL, CURL, [-9, 1], [11, 1.04]], thumb: [18, 0.55] },
  three:      { rot: 0,   fingers: [CURL, [-11, 1], [0, 1], [11, 1.04]], thumb: [18, 0.55] },
  palm:       { rot: -76, fingers: [[-7, 1], [-2, 1], [2, 1], [7, 1]], thumb: [58, 1] },
  fist:       { rot: 0,   fingers: [CURL, CURL, CURL, CURL], thumb: [24, 0.6] },
}
const FINGERS = [{ x: 22.2, len: 12.5 }, { x: 27.9, len: 16.5 }, { x: 33.6, len: 18 }, { x: 39.3, len: 16 }]
const KNUCKLE_Y = 30

function SvgHand({ pose, className = '', title }: { pose: HandPose; className?: string; title?: string }) {
  const p = POSES[pose]
  const digit = (d: Digit, x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px`, transform: `rotate(${d[0]}deg) scaleY(${d[1]})` })
  return <svg className={`left-hand pose-${pose} ${className}`} viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
    <g className="hand-body" style={{ transformOrigin: '32px 34px', transform: `rotate(${p.rot}deg)` }}>
      <rect x="25.6" y="46" width="11.6" height="12.5" rx="3.4" />
      <rect x="19.7" y="27.2" width="22.1" height="23" rx="8.2" />
      {FINGERS.map((finger, i) => <line key={i} x1={finger.x} y1={KNUCKLE_Y} x2={finger.x} y2={KNUCKLE_Y - finger.len} style={digit(p.fingers[i], finger.x, KNUCKLE_Y)} />)}
      <line className="hand-thumb" x1="40.2" y1="42" x2="40.2" y2="29.5" style={digit(p.thumb, 40.2, 42)} />
    </g>
  </svg>
}

// ── Rendered hand (Blender) ──────────────────────────────────────────────
// public/hand/sheet.webp is a 9 × 9 grid rendered from assets-src/hand/hand.blend:
// one row per pose (HAND_POSES order), column 0 = relaxed open hand, column 8 = the pose.
// Changing pose plays the current row back to the open hand, then the new row forward.
const SHEET = '/hand/sheet.webp'
const FRAMES = 9
const FRAME_MS = 30 // ≈ 16 steps ≈ 480 ms per change
const cell = (row: number, col: number) => `${(col / (FRAMES - 1)) * 100}% ${(row / (HAND_POSES.length - 1)) * 100}%`

/**
 * The hand signature. Shows the rendered Blender hand once its sprite sheet has
 * loaded (the flat SVG hand is the lightweight first paint and the fallback).
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

  if (!ready) return <SvgHand pose={pose} className={className} title={title} />
  return <span ref={el} className={`hand-sprite ${className}`} data-pose={pose} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}
    style={{ backgroundImage: `url(${SHEET})`, backgroundSize: `${FRAMES * 100}% ${HAND_POSES.length * 100}%`, backgroundPosition: cell(shown.current.row, shown.current.col) }} />
}
