import { PHASE_TIDE_LABEL } from '@/domain/copy'
import type { Phase } from '@/domain/types'
import styles from './StatsCharts.module.css'

export type CycleBar = {
  label: string
  days: number
}

export type CurvePoint = {
  day: number
  value: number
  label?: string
}

export type FreqBar = {
  label: string
  count: number
}

const PHASE_TINT: Record<Phase, string> = {
  menstrual: '#d4b8c8',
  follicular: '#9fc8e8',
  ovulatory: '#7eb4dc',
  luteal: '#b7c9d8',
}

/** Concentric paper ring showing progress through the current cycle. */
export function CycleProgressRing({
  cycleDay,
  cycleLength,
  phase,
}: {
  cycleDay: number
  cycleLength: number
  phase: Phase
}) {
  const size = 118
  const stroke = 11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const progress = Math.min(1, Math.max(0, cycleDay / cycleLength))
  const dash = c * progress
  const tint = PHASE_TINT[phase]

  return (
    <div className={styles.ringWrap}>
      <svg
        className={styles.ringSvg}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
      >
        <defs>
          <filter id="ringSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="1.2"
              stdDeviation="1.4"
              floodColor="#6fa8d4"
              floodOpacity="0.28"
            />
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(159,200,232,0.22)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tint}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="url(#ringSoft)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - stroke / 2 - 6}
          fill="#f7fafc"
          stroke="rgba(145,186,220,0.18)"
          strokeWidth="1"
        />
      </svg>
      <div className={styles.ringLabel}>
        <p className={styles.ringDay}>第{cycleDay}天</p>
        <p className={styles.ringPhase}>{PHASE_TIDE_LABEL[phase]}</p>
      </div>
    </div>
  )
}

/** Soft visual ceiling so one long gap does not crush the rest of the chart. */
const CYCLE_BAR_TRACK = 72
const CYCLE_VISUAL_CAP = 50

/** Vertical bar chart of recent cycle lengths. */
export function CycleLengthBars({
  bars,
  average,
}: {
  bars: CycleBar[]
  average: number | null
}) {
  if (bars.length === 0) {
    return <p className={styles.emptyHint}>记录更多经期后，这里会画出周期长度变化。</p>
  }

  const withinCap = bars
    .map((b) => b.days)
    .filter((d) => d <= CYCLE_VISUAL_CAP)
  const scaleMax = Math.max(
    30,
    average ?? 0,
    ...(withinCap.length > 0 ? withinCap : [CYCLE_VISUAL_CAP]),
  )

  const avgPct =
    average != null
      ? Math.min(100, Math.max(0, (average / scaleMax) * 100))
      : null

  return (
    <div className={styles.barChart}>
      <div
        className={styles.barPlot}
        style={{ ['--bar-cols' as string]: String(bars.length) }}
      >
        <div className={styles.barTracks}>
          {avgPct != null ? (
            <div
              className={styles.avgLine}
              style={{ ['--avg-pct' as string]: String(avgPct) }}
              title={`均值 ${average} 天`}
            />
          ) : null}
          {bars.map((bar) => {
            const capped = bar.days > scaleMax
            const ratio = Math.min(bar.days, scaleMax) / scaleMax
            const h = Math.max(10, Math.round(ratio * CYCLE_BAR_TRACK))
            return (
              <div key={bar.label} className={styles.barCol}>
                <span className={styles.barValue}>{bar.days}</span>
                <div className={styles.barTrack}>
                  <div
                    className={
                      capped
                        ? `${styles.barFill} ${styles.barFillOutlier}`
                        : styles.barFill
                    }
                    style={{ height: h }}
                    title={`${bar.label}: ${bar.days} 天`}
                  />
                </div>
                <span className={styles.barLabel}>{bar.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Soft area + line curve (paper-layer feel). */
export function BodyCurveChart({
  points,
  unitLabel = '精力',
}: {
  points: CurvePoint[]
  unitLabel?: string
}) {
  if (points.length < 2) {
    return <p className={styles.emptyHint}>持续记录后，这里会呈现身体曲线。</p>
  }

  const W = 300
  const H = 112
  const padX = 8
  const padY = 14
  const plotW = W - padX * 2
  const plotH = H - padY * 2
  const minD = Math.min(...points.map((p) => p.day))
  const maxD = Math.max(...points.map((p) => p.day))
  const span = Math.max(1, maxD - minD)

  const coords = points.map((p) => {
    const x = padX + ((p.day - minD) / span) * plotW
    const y = padY + (1 - p.value) * plotH
    return { x, y, ...p }
  })

  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L ${coords[coords.length - 1].x.toFixed(1)} ${(padY + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padY + plotH).toFixed(1)} Z`

  return (
    <div className={styles.curveWrap}>
      <div className={styles.curveHead}>
        <span className={styles.curveUnit}>{unitLabel}</span>
        <span className={styles.curveHint}>按周期日</span>
      </div>
      <svg
        className={styles.curveSvg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${unitLabel}曲线`}
      >
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fc8e8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9fc8e8" stopOpacity="0.02" />
          </linearGradient>
          <filter id="curveLift" x="-8%" y="-8%" width="116%" height="120%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.2"
              floodColor="#6fa8d4"
              floodOpacity="0.22"
            />
          </filter>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padY + t * plotH}
            y2={padY + t * plotH}
            stroke="rgba(145,186,220,0.22)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}
        <path d={area} fill="url(#curveFill)" />
        <path
          d={line}
          fill="none"
          stroke="#6fa8d4"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#curveLift)"
        />
        {coords.map((c) => (
          <circle
            key={c.day}
            cx={c.x}
            cy={c.y}
            r="3.2"
            fill="#f7fafc"
            stroke="#6fa8d4"
            strokeWidth="1.4"
          />
        ))}
      </svg>
      <div className={styles.curveAxis}>
        <span>D{minD}</span>
        <span>D{Math.round((minD + maxD) / 2)}</span>
        <span>D{maxD}</span>
      </div>
    </div>
  )
}

/** Horizontal frequency bars (symptoms / clues). */
export function FrequencyBars({ items }: { items: FreqBar[] }) {
  if (items.length === 0) {
    return <p className={styles.emptyHint}>身体线索累积后，会出现频次对比。</p>
  }

  const max = Math.max(...items.map((i) => i.count), 1)

  return (
    <ul className={styles.freqList}>
      {items.map((item) => (
        <li key={item.label}>
          <div className={styles.freqMeta}>
            <span className={styles.freqLabel}>{item.label}</span>
            <span className={styles.freqCount}>{item.count}</span>
          </div>
          <div className={styles.freqTrack}>
            <div
              className={styles.freqFill}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Mini progress bars for experiments. */
export function ExperimentBars({
  items,
}: {
  items: { id: string; title: string; progress: number; meta: string }[]
}) {
  if (items.length === 0) {
    return <p className={styles.emptyHint}>开始小实验后，进度会显示在这里。</p>
  }

  return (
    <ul className={styles.expList}>
      {items.map((item) => (
        <li key={item.id}>
          <p className={styles.expTitle}>{item.title}</p>
          <div className={styles.freqTrack}>
            <div
              className={styles.expFill}
              style={{ width: `${Math.round(item.progress * 100)}%` }}
            />
          </div>
          <p className={styles.expMeta}>{item.meta}</p>
        </li>
      ))}
    </ul>
  )
}
