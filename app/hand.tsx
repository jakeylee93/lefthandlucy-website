/**
 * The Left Hand Lucy signature: one left hand (palm towards you, thumb on the
 * right) drawn from a single set of shapes. Every gesture is the same palm and
 * five fingers in a different position, so poses share one silhouette and
 * ease naturally from one to the next. Only one gesture shows at a time.
 */
import type { CSSProperties } from 'react'

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

export function LeftHand({ pose, className = '', title }: { pose: HandPose; className?: string; title?: string }) {
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
