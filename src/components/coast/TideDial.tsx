import { PHASE_TIDE_LABEL } from '@/domain/copy'
import type { DaySnapshot } from '@/domain/types'
import { useRef, type PointerEvent } from 'react'
import styles from './TideDial.module.css'

const CX = 160
const CY = 160
const MOON_R = 148
const RING_OUTER = 128
const RING_INNER = 112
const BOWL_R = 98

function polar(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function angleFromPoint(clientX: number, clientY: number, rect: DOMRect) {
  const x = clientX - (rect.left + rect.width / 2)
  const y = clientY - (rect.top + rect.height / 2)
  let deg = (Math.atan2(y, x) * 180) / Math.PI + 90
  if (deg < 0) deg += 360
  return deg
}

/** Classic moon-phase discs around the dial. */
function MoonPhase({ index, x, y }: { index: number; x: number; y: number }) {
  const t = index / 7
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="7" fill="#fff" stroke="var(--tide)" strokeWidth="0.9" />
      {t < 0.08 ? (
        <circle r="6.2" fill="var(--tide-soft)" opacity="0.55" />
      ) : t > 0.92 ? (
        <circle r="6.2" fill="var(--tide)" opacity="0.75" />
      ) : (
        <path
          d={
            t < 0.5
              ? `M 0 -6.2 A 6.2 6.2 0 0 1 0 6.2 A ${6.2 * (1 - t * 2)} 6.2 0 0 0 0 -6.2`
              : `M 0 -6.2 A 6.2 6.2 0 0 1 0 6.2 A ${6.2 * ((t - 0.5) * 2)} 6.2 0 0 1 0 -6.2`
          }
          fill="var(--tide)"
          opacity="0.7"
        />
      )}
    </g>
  )
}

/** Soft illustrated wave crest in the lower bowl — light-blue ink style. */
function WaveArt({ tideHeight }: { tideHeight: number }) {
  const lift = (1 - tideHeight) * 28
  return (
    <g
      className={styles.waveArt}
      style={{ ['--tide-lift' as string]: `${lift}px` }}
    >
      {/* deep water body */}
      <path
        d="M62 188
           C78 176, 96 204, 118 186
           C138 170, 152 198, 176 182
           C198 168, 214 192, 258 178
           L258 268 L62 268 Z"
        fill="url(#waveBody)"
      />
      {/* mid crest */}
      <path
        d="M70 192
           C88 168, 104 210, 124 184
           C142 162, 156 208, 178 178
           C196 156, 214 198, 250 174
           L250 210
           C220 198, 200 220, 176 204
           C154 226, 136 198, 118 214
           C98 230, 84 206, 70 218 Z"
        fill="url(#waveMid)"
        opacity="0.92"
      />
      {/* foam curls */}
      <path
        d="M96 186 C104 174, 112 190, 120 180 C128 170, 134 188, 144 178"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M158 176 C166 164, 174 184, 184 170 C192 160, 200 178, 212 168"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="112" cy="182" r="3.2" fill="#fff" opacity="0.9" />
      <circle cx="130" cy="176" r="2.4" fill="#fff" opacity="0.75" />
      <circle cx="190" cy="170" r="3" fill="#fff" opacity="0.85" />
      <circle cx="208" cy="166" r="2.2" fill="#fff" opacity="0.7" />
      {/* soft spray dots */}
      <g fill="var(--tide-soft)" opacity="0.45">
        <circle cx="100" cy="198" r="1.6" />
        <circle cx="148" cy="190" r="1.3" />
        <circle cx="170" cy="186" r="1.5" />
        <circle cx="226" cy="180" r="1.4" />
      </g>
    </g>
  )
}

export function TideDial({
  snapshot,
  cycleLength,
  onPreviewDay,
}: {
  snapshot: DaySnapshot
  cycleLength: number
  onPreviewDay: (cycleDay: number) => void
}) {
  const dialRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ angle: number; day: number } | null>(null)

  const progress = (snapshot.cycleDay / cycleLength) * 360
  const ringSweep = 48 + snapshot.tideHeight * 220

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = dialRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    const rect = el.getBoundingClientRect()
    dragRef.current = {
      angle: angleFromPoint(e.clientX, e.clientY, rect),
      day: snapshot.cycleDay,
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current
    const el = dialRef.current
    if (!start || !el) return
    const rect = el.getBoundingClientRect()
    const ang = angleFromPoint(e.clientX, e.clientY, rect)
    let delta = ang - start.angle
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    if (Math.abs(delta) < 8) return
    const dayDelta = Math.round(delta / (360 / cycleLength))
    const next =
      ((((start.day - 1 + dayDelta) % cycleLength) + cycleLength) % cycleLength) + 1
    if (next !== snapshot.cycleDay) onPreviewDay(next)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <div
      ref={dialRef}
      className={styles.dial}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-label="周期潮位圆盘"
      aria-valuemin={1}
      aria-valuemax={cycleLength}
      aria-valuenow={snapshot.cycleDay}
      aria-valuetext={`${PHASE_TIDE_LABEL[snapshot.phase]}，第 ${snapshot.cycleDay} 天`}
    >
      <svg className={styles.svg} viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          <linearGradient id="ringWash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--coast-water-light)" stopOpacity="0.95" />
            <stop offset="55%" stopColor="var(--tide)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--tide-deep)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="waveBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--coast-water-light)" />
            <stop offset="45%" stopColor="var(--coast-water)" />
            <stop offset="100%" stopColor="var(--coast-water-deep)" />
          </linearGradient>
          <linearGradient id="waveMid" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#d7eefb" />
            <stop offset="40%" stopColor="var(--coast-water)" />
            <stop offset="100%" stopColor="var(--tide-deep)" />
          </linearGradient>
          <clipPath id="bowlClip">
            <circle cx={CX} cy={CY} r={BOWL_R} />
          </clipPath>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* outer dotted moon track */}
        <circle
          cx={CX}
          cy={CY}
          r={MOON_R}
          fill="none"
          stroke="var(--tide)"
          strokeWidth="1.2"
          strokeDasharray="1.8 5.5"
          opacity="0.45"
        />

        {Array.from({ length: 8 }, (_, i) => {
          const p = polar(MOON_R, (360 / 8) * i)
          return <MoonPhase key={i} index={i} x={p.x} y={p.y} />
        })}

        {/* soft double watercolor rings */}
        <circle
          cx={CX}
          cy={CY}
          r={RING_OUTER}
          fill="none"
          stroke="url(#ringWash)"
          strokeWidth="14"
          opacity="0.55"
          filter="url(#softBlur)"
        />
        <circle
          cx={CX}
          cy={CY}
          r={RING_INNER}
          fill="none"
          stroke="url(#ringWash)"
          strokeWidth="11"
          opacity="0.72"
          strokeDasharray={`${(ringSweep / 360) * 2 * Math.PI * RING_INNER} ${2 * Math.PI * RING_INNER}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dasharray 0.45s var(--ease)' }}
        />

        {/* progress tip */}
        {(() => {
          const tip = polar(RING_INNER, progress)
          return (
            <circle
              cx={tip.x}
              cy={tip.y}
              r="5"
              fill="var(--tide-deep)"
              stroke="#fff"
              strokeWidth="1.5"
            />
          )
        })()}

        {/* inner bowl */}
        <circle cx={CX} cy={CY} r={BOWL_R} fill="#f7fbff" />
        <g clipPath="url(#bowlClip)">
          <WaveArt tideHeight={snapshot.tideHeight} />
        </g>
        <circle
          cx={CX}
          cy={CY}
          r={BOWL_R}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
        />
      </svg>

      <div className={styles.label}>
        <p className={styles.phase}>{PHASE_TIDE_LABEL[snapshot.phase]}</p>
        <p className={styles.day}>· 第 {snapshot.cycleDay} 天 ·</p>
      </div>
    </div>
  )
}
