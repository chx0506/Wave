import type { DayMode } from '@/domain/types'
import { useId, useMemo, type CSSProperties } from 'react'
import styles from './SideBayScene.module.css'

/** Side-view waterline: low tide sits lower on screen (larger y). */
function waterLineY(coverage: number, height: number): number {
  const low = height * 0.74
  const high = height * 0.42
  const t = Math.min(1, Math.max(0, (coverage - 0.1) / 0.9))
  return low - t * (low - high)
}

function waveSurfacePath(w: number, baseY: number, amp: number, freq: number, phase: number): string {
  const steps = 24
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w
    const y = baseY + amp * Math.sin((i / steps) * Math.PI * 2 * freq + phase)
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

export function SideBayScene({
  mode,
  coverage,
}: {
  mode: DayMode
  coverage: number
}) {
  const uid = useId().replace(/:/g, '')
  const w = 390
  const h = 844
  const waterY = useMemo(() => waterLineY(coverage, h), [coverage, h])

  const surfaceA = useMemo(() => waveSurfacePath(w, waterY, 5, 1.2, 0.2), [waterY, w])
  const surfaceB = useMemo(() => waveSurfacePath(w, waterY + 3, 3.5, 1.8, 1.4), [waterY, w])
  const waterBody = `${surfaceA} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={styles.svg}
      data-mode={mode}
      aria-hidden="true"
      style={{ '--water-y': `${((waterY / h) * 100).toFixed(2)}%` } as CSSProperties}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--coast-sky-top)" />
          <stop offset="55%" stopColor="var(--coast-sky-mid)" />
          <stop offset="100%" stopColor="var(--coast-sky-mid)" />
        </linearGradient>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--coast-water-light)" />
          <stop offset="45%" stopColor="var(--coast-water)" />
          <stop offset="100%" stopColor="var(--coast-water-deep)" />
        </linearGradient>
        <linearGradient id={`${uid}-sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--coast-sand)" />
          <stop offset="100%" stopColor="#eef5fa" />
        </linearGradient>
        <clipPath id={`${uid}-bay`}>
          <path d={`M0 ${h * 0.28} C ${w * 0.18} ${h * 0.34}, ${w * 0.22} ${h * 0.52}, ${w * 0.34} ${h * 0.58}
            L ${w * 0.66} ${h * 0.58} C ${w * 0.78} ${h * 0.52}, ${w * 0.82} ${h * 0.34}, ${w} ${h * 0.28}
            L ${w} ${h} L 0 ${h} Z`} />
        </clipPath>
      </defs>

      <rect width={w} height={h} fill={`url(#${uid}-sky)`} />

      {/* distant headlands */}
      <path
        d={`M0 ${h * 0.36} C ${w * 0.12} ${h * 0.3}, ${w * 0.2} ${h * 0.33}, ${w * 0.28} ${h * 0.4}
          L ${w * 0.28} ${h * 0.58} L 0 ${h * 0.58} Z`}
        fill="var(--coast-island)"
        opacity="0.55"
      />
      <path
        d={`M${w} ${h * 0.34} C ${w * 0.88} ${h * 0.28}, ${w * 0.8} ${h * 0.31}, ${w * 0.72} ${h * 0.38}
          L ${w * 0.72} ${h * 0.58} L ${w} ${h * 0.58} Z`}
        fill="var(--coast-island)"
        opacity="0.55"
      />

      {/* soft clouds */}
      <ellipse cx={w * 0.28} cy={h * 0.14} rx={42} ry={14} fill="var(--coast-cloud)" />
      <ellipse cx={w * 0.62} cy={h * 0.1} rx={36} ry={12} fill="var(--coast-cloud)" opacity="0.85" />

      {/* sand beach */}
      <path
        d={`M0 ${h * 0.58} C ${w * 0.15} ${h * 0.54}, ${w * 0.28} ${h * 0.62}, ${w * 0.5} ${h * 0.6}
          C ${w * 0.72} ${h * 0.58}, ${w * 0.85} ${h * 0.64}, ${w} ${h * 0.6}
          L ${w} ${h} L 0 ${h} Z`}
        fill={`url(#${uid}-sand)`}
      />

      {/* wet sand near waterline */}
      <path
        className={styles.wetSand}
        d={`M0 ${waterY + 18} C ${w * 0.25} ${waterY + 8}, ${w * 0.5} ${waterY + 14}, ${w} ${waterY + 10}
          L ${w} ${h * 0.6} C ${w * 0.72} ${h * 0.58}, ${w * 0.5} ${h * 0.6}, ${w * 0.28} ${h * 0.58}
          L 0 ${h * 0.58} Z`}
        fill="var(--coast-water-light)"
        opacity="0.22"
      />

      {/* water body clipped to bay */}
      <g clipPath={`url(#${uid}-bay)`}>
        <path className={styles.waterBody} d={waterBody} fill={`url(#${uid}-water)`} />
        <path className={styles.waveB} d={surfaceB} fill="none" stroke="var(--coast-ripple)" strokeWidth="2" />
        <path className={styles.waveA} d={surfaceA} fill="none" stroke="var(--coast-foam)" strokeWidth="2.5" opacity="0.85" />
      </g>

      {/* tide staff marks on left cliff */}
      <g className={styles.staff} opacity="0.55">
        <line x1={w * 0.06} y1={h * 0.42} x2={w * 0.1} y2={h * 0.42} stroke="var(--ink-faint)" strokeWidth="1.2" />
        <text x={w * 0.11} y={h * 0.42 + 4} fill="var(--ink-faint)" fontSize="10">
          高潮
        </text>
        <line x1={w * 0.06} y1={h * 0.74} x2={w * 0.1} y2={h * 0.74} stroke="var(--ink-faint)" strokeWidth="1.2" />
        <text x={w * 0.11} y={h * 0.74 + 4} fill="var(--ink-faint)" fontSize="10">
          低潮
        </text>
        <line
          className={styles.currentMark}
          x1={w * 0.04}
          y1={waterY}
          x2={w * 0.12}
          y2={waterY}
          stroke="var(--tide-deep)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
