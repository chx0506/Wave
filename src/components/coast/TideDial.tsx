import { PHASE_TIDE_LABEL } from '@/domain/copy'
import { tideHeightForCycleDay } from '@/domain/cycle'
import type { CycleConfig, DaySnapshot } from '@/domain/types'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { PaperWaveRelief } from './PaperWaveRelief'
import styles from './TideDial.module.css'

const CX = 160
const CY = 160
const MOON_R = 150
const TRACK_OUTER = 128
const TRACK_INNER = 108
const BOWL_R = 93

/** Mock dial cream + sky blue — from yuechao paper home comp (#f9dab4 / #a4c7e3). */
const PAPER = '#f9dab4'
const PAPER_SOFT = '#fce6c8'
const PAPER_DEEP = '#e8c49a'
const BLUE_SHADE = '#a4c7e3'
const BLUE_DEEP = '#7eb4dc'

function polar(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function dayAngle(day: number, cycleLength: number) {
  return (day / cycleLength) * 360
}

function angleFromPoint(clientX: number, clientY: number, rect: DOMRect) {
  const x = clientX - (rect.left + rect.width / 2)
  const y = clientY - (rect.top + rect.height / 2)
  let deg = (Math.atan2(y, x) * 180) / Math.PI + 90
  if (deg < 0) deg += 360
  return deg
}

function dayFloatFromAngle(angleDeg: number, cycleLength: number) {
  let raw = (angleDeg / 360) * cycleLength
  if (raw <= 0) raw += cycleLength
  if (raw > cycleLength) raw -= cycleLength
  return raw
}

function dayFromAngle(angleDeg: number, cycleLength: number) {
  const raw = Math.round((angleDeg / 360) * cycleLength)
  if (raw <= 0) return cycleLength
  if (raw > cycleLength) return 1
  return raw
}

/**
 * Raised paper moon — cream = lit face, blue = night face (mock palette).
 * Phases are exaggerated so the ring clearly reads as a lunar cycle.
 */
function MoonPhase({ index, x, y }: { index: number; x: number; y: number }) {
  const r = 9.2
  const fr = r - 1.15
  const lit = PAPER
  const shade = BLUE_SHADE
  const uid = `moonClip-${index}`

  type Spec =
    | { kind: 'solid'; fill: string }
    | { kind: 'quarter'; litRight: boolean }
    | { kind: 'overlap'; base: string; cover: string; ox: number }

  // 0 new → 2 first quarter → 4 full → 6 last quarter
  const specs: Spec[] = [
    { kind: 'solid', fill: shade },
    { kind: 'overlap', base: lit, cover: shade, ox: -fr * 0.72 },
    { kind: 'quarter', litRight: true },
    { kind: 'overlap', base: lit, cover: shade, ox: -fr * 1.22 },
    { kind: 'solid', fill: lit },
    { kind: 'overlap', base: lit, cover: shade, ox: fr * 1.22 },
    { kind: 'quarter', litRight: false },
    { kind: 'overlap', base: lit, cover: shade, ox: fr * 0.72 },
  ]
  const spec = specs[index]

  let face: ReactNode
  if (spec.kind === 'solid') {
    face = <circle r={fr} fill={spec.fill} />
  } else if (spec.kind === 'quarter') {
    face = (
      <>
        <circle r={fr} fill={spec.litRight ? shade : lit} />
        <path
          d={
            spec.litRight
              ? `M 0 ${-fr} A ${fr} ${fr} 0 0 1 0 ${fr} Z`
              : `M 0 ${-fr} A ${fr} ${fr} 0 0 0 0 ${fr} Z`
          }
          fill={spec.litRight ? lit : shade}
        />
      </>
    )
  } else {
    face = (
      <>
        <circle r={fr} fill={spec.base} />
        <circle cx={spec.ox} r={fr} fill={spec.cover} />
      </>
    )
  }

  return (
    <g transform={`translate(${x} ${y})`} filter="url(#moonLift)">
      <circle r={r + 1.1} fill="#fff6e8" opacity="0.95" />
      <circle r={r} fill="#fffefb" stroke={PAPER_SOFT} strokeWidth="1.15" />
      <clipPath id={uid}>
        <circle r={fr} />
      </clipPath>
      <g clipPath={`url(#${uid})`}>{face}</g>
    </g>
  )
}

function arcDash(fraction: number, radius: number) {
  const circ = 2 * Math.PI * radius
  const len = Math.max(0, Math.min(1, fraction)) * circ
  return { circ, len }
}

export function TideDial({
  snapshot,
  cycleLength,
  cycleConfig,
  dayFloat: dayFloatProp,
  onScrubDay,
  onPreviewDay,
}: {
  snapshot: DaySnapshot
  cycleLength: number
  cycleConfig: CycleConfig
  /** Continuous cycle day 1…length — drives rings/waves while scrubbing */
  dayFloat?: number
  onScrubDay?: (dayFloat: number) => void
  lowTideDay?: number
  highTideDay?: number
  onPreviewDay: (cycleDay: number) => void
}) {
  const dialRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [internalDayFloat, setInternalDayFloat] = useState(
    () => dayFloatProp ?? snapshot.cycleDay,
  )

  const dayFloat = dayFloatProp ?? internalDayFloat
  const visualDayFrac = Math.min(1, Math.max(0, dayFloat / cycleLength))
  const visualTide = tideHeightForCycleDay(dayFloat, cycleConfig)

  useEffect(() => {
    if (dragging.current) return
    if (dayFloatProp == null) {
      setInternalDayFloat(snapshot.cycleDay)
    }
  }, [snapshot.cycleDay, dayFloatProp])

  // Same progress for both rings — aligned tips
  const dayFrac = visualDayFrac
  const outer = arcDash(dayFrac, TRACK_OUTER)
  const inner = arcDash(dayFrac, TRACK_INNER)
  const tipAngle = dayFrac * 360
  const tipOuter = polar(TRACK_OUTER, tipAngle)
  const tipInner = polar(TRACK_INNER, tipAngle)

  const applyPointer = (clientX: number, clientY: number) => {
    const el = dialRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const angle = angleFromPoint(clientX, clientY, rect)
    const dayF = dayFloatFromAngle(angle, cycleLength)
    const next = dayFromAngle(angle, cycleLength)
    if (dayFloatProp == null) setInternalDayFloat(dayF)
    onScrubDay?.(dayF)
    if (next !== snapshot.cycleDay) onPreviewDay(next)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dialRef.current?.setPointerCapture(e.pointerId)
    dragging.current = true
    setIsDragging(true)
    applyPointer(e.clientX, e.clientY)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    applyPointer(e.clientX, e.clientY)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const committed = Math.round(
      Math.min(cycleLength, Math.max(1, dayFloat)),
    )
    onPreviewDay(committed)
    onScrubDay?.(committed)
    if (dayFloatProp == null) setInternalDayFloat(committed)
  }

  const ease = isDragging ? 'none' : 'stroke-dasharray 0.32s var(--ease)'

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
      <div className={styles.plate} aria-hidden="true" />

      <div className={styles.bowl} aria-hidden="true">
        <PaperWaveRelief tide={visualTide} dragging={isDragging} />
      </div>

      <svg className={styles.svg} viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          <linearGradient id="grooveBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d7e8f4" />
            <stop offset="100%" stopColor="#bdd2e7" />
          </linearGradient>
          <linearGradient id="groovePaper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff6e8" />
            <stop offset="100%" stopColor="#f9dab4" />
          </linearGradient>
          <linearGradient id="progressOuter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bdd2e7" />
            <stop offset="100%" stopColor="#8db7db" />
          </linearGradient>
          <linearGradient id="progressInner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fce6c8" />
            <stop offset="48%" stopColor={PAPER} />
            <stop offset="100%" stopColor={PAPER_DEEP} />
          </linearGradient>
          <filter id="moonLift" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="1.2"
              stdDeviation="1"
              floodColor="#d4b896"
              floodOpacity="0.36"
            />
          </filter>
          <filter id="ringShadow" x="-8%" y="-8%" width="116%" height="116%">
            <feDropShadow
              dx="0"
              dy="1.4"
              stdDeviation="1.2"
              floodColor="#8db7db"
              floodOpacity="0.22"
            />
          </filter>
          <filter id="tipLift" x="-70%" y="-70%" width="240%" height="240%">
            <feDropShadow
              dx="0"
              dy="1.2"
              stdDeviation="1"
              floodColor="#5a8fb8"
              floodOpacity="0.36"
            />
          </filter>
          <filter id="tipPaper" x="-70%" y="-70%" width="240%" height="240%">
            <feDropShadow
              dx="0"
              dy="1.1"
              stdDeviation="0.9"
              floodColor="#d4b896"
              floodOpacity="0.45"
            />
          </filter>
        </defs>

        <circle
          cx={CX}
          cy={CY}
          r={(TRACK_OUTER + MOON_R) / 2}
          fill="none"
          stroke="#f4f9fc"
          strokeWidth={MOON_R - TRACK_OUTER + 6}
          opacity="0.55"
          filter="url(#ringShadow)"
        />

        {/* Dashed moon guide — soft paper beige */}
        <circle
          cx={CX}
          cy={CY}
          r={MOON_R}
          fill="none"
          stroke={PAPER_SOFT}
          strokeWidth="1.15"
          strokeDasharray="1.4 5.2"
          opacity="0.85"
        />

        {/* Day dots between moons */}
        {Array.from({ length: cycleLength }, (_, i) => {
          const day = i + 1
          const angle = dayAngle(day, cycleLength)
          const nearMoon = Array.from({ length: 8 }, (_, m) => m * 45).some(
            (moonAng) => {
              const d = Math.abs(angle - moonAng)
              return Math.min(d, 360 - d) < 12
            },
          )
          if (nearMoon) return null
          const p = polar(MOON_R, angle)
          return (
            <circle
              key={day}
              cx={p.x}
              cy={p.y}
              r="1.8"
              fill={PAPER}
              opacity="0.9"
            />
          )
        })}

        {/* Paper moon discs — rice-beige / blue phases */}
        {Array.from({ length: 8 }, (_, i) => {
          const p = polar(MOON_R, (i / 8) * 360)
          return <MoonPhase key={i} index={i} x={p.x} y={p.y} />
        })}

        {/* Dual recessed grooves */}
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_OUTER}
          fill="none"
          stroke="url(#grooveBlue)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_INNER}
          fill="none"
          stroke="url(#groovePaper)"
          strokeWidth="10.5"
          strokeLinecap="round"
        />
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_OUTER + 5.6}
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="1.1"
        />
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_OUTER - 5.6}
          fill="none"
          stroke="rgba(145,186,220,0.32)"
          strokeWidth="1"
        />
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_INNER + 4.9}
          fill="none"
          stroke="rgba(255,253,248,0.95)"
          strokeWidth="1"
        />
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_INNER - 4.9}
          fill="none"
          stroke="rgba(249,218,180,0.5)"
          strokeWidth="0.9"
        />

        {/* Outer progress — cycle day (blue) */}
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_OUTER}
          fill="none"
          stroke="url(#progressOuter)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${outer.len} ${outer.circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: ease }}
        />

        {/* Inner progress — same dayFrac (paper beige), tips aligned */}
        <circle
          cx={CX}
          cy={CY}
          r={TRACK_INNER}
          fill="none"
          stroke="url(#progressInner)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeDasharray={`${inner.len} ${inner.circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: ease }}
        />

        {/* Aligned tip discs */}
        <circle
          cx={tipInner.x}
          cy={tipInner.y}
          r="4.2"
          fill={PAPER}
          stroke="#fffef8"
          strokeWidth="1.7"
          filter="url(#tipPaper)"
        />
        <circle
          cx={tipOuter.x}
          cy={tipOuter.y}
          r="5.2"
          fill={BLUE_DEEP}
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#tipLift)"
        />

        {/* Bowl paper rim */}
        <circle
          cx={CX}
          cy={CY}
          r={BOWL_R}
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="2.6"
        />
        <circle
          cx={CX}
          cy={CY}
          r={BOWL_R}
          fill="none"
          stroke="rgba(168,203,230,0.28)"
          strokeWidth="1"
        />
      </svg>

      <div className={styles.label}>
        <p className={styles.phase}>{PHASE_TIDE_LABEL[snapshot.phase]}</p>
        <p className={styles.day}>· 第 {snapshot.cycleDay} 天 ·</p>
      </div>
    </div>
  )
}
