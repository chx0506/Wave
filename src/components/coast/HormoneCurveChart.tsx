import {
  catmullRomPath,
  HORMONE_DISCLAIMER,
  HORMONE_SERIES,
  hormonePlotPoints,
  paperLayerPath,
  type HormoneMeta,
} from '@/data/hormoneCurves'
import { PHASE_LABEL } from '@/domain/copy'
import { phaseForCycleDay } from '@/domain/cycle'
import type { CycleConfig } from '@/domain/types'
import { useMemo, type CSSProperties } from 'react'
import styles from './HormoneCurveChart.module.css'

const W = 320
const H = 148
const PAD_X = 4
const PAD_T = 8
const PAD_B = 18
const PLOT_W = W - PAD_X * 2
const PLOT_H = H - PAD_T - PAD_B
const BASELINE_Y = PAD_T + PLOT_H

const LAYOUT = { width: W, padX: PAD_X, padY: PAD_T, plotH: PLOT_H }

/** Back → front draw order for layered translucent paper. */
const DRAW_ORDER: HormoneMeta['id'][] = ['fsh', 'lh', 'progesterone', 'estrogen']

type Props = {
  cycleLength: number
  selectedDay: number
  todayDay: number
  cycleConfig: CycleConfig
}

function xForDay(day: number, cycleLength: number) {
  return PAD_X + ((day - 1) / Math.max(1, cycleLength - 1)) * PLOT_W
}

function tickDays(cycleLength: number) {
  const wanted = [1, 7, 14, 21, cycleLength]
  const uniq = [...new Set(wanted.filter((d) => d >= 1 && d <= cycleLength))]
  return uniq.sort((a, b) => a - b)
}

function PaperWaveLayer({
  meta,
  layer,
  crest,
}: {
  meta: HormoneMeta
  layer: string
  crest: string
}) {
  return (
    <g className={styles.layer} data-id={meta.id}>
      <path
        d={layer}
        fill={meta.shadow}
        transform="translate(0, 1.6)"
        opacity="0.28"
      />
      <path
        d={layer}
        fill={`url(#sheet-${meta.id})`}
        stroke="none"
        opacity={meta.fillOpacity}
      />
      <path
        d={crest}
        fill="none"
        stroke={meta.color}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d={crest}
        fill="none"
        stroke={meta.colorLight}
        strokeWidth="0.65"
        strokeLinecap="round"
        opacity="0.85"
        transform="translate(0, -0.45)"
      />
    </g>
  )
}

export function HormoneCurveChart({
  cycleLength,
  selectedDay,
  todayDay,
  cycleConfig,
}: Props) {
  const phase = phaseForCycleDay(selectedDay, cycleConfig)
  const markerX = xForDay(selectedDay, cycleLength)
  const todayX = xForDay(todayDay, cycleLength)
  const xTicks = useMemo(() => tickDays(cycleLength), [cycleLength])

  const series = useMemo(() => {
    const byId = new Map(
      HORMONE_SERIES.map((meta) => {
        const points = hormonePlotPoints(
          meta.id,
          cycleLength,
          LAYOUT,
          cycleConfig,
        )
        return [
          meta.id,
          {
            meta,
            crest: catmullRomPath(points),
            layer: paperLayerPath(points, BASELINE_Y),
          },
        ] as const
      }),
    )
    return DRAW_ORDER.map((id) => byId.get(id)!)
  }, [cycleLength, cycleConfig])

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.legend} aria-hidden="true">
          {HORMONE_SERIES.map((s) => (
            <span key={s.id} className={styles.legendItem}>
              <i style={{ '--dot': s.color } as CSSProperties} />
              {s.label}
            </span>
          ))}
        </div>
        <span className={styles.phaseTag}>{PHASE_LABEL[phase]}</span>
      </div>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          {HORMONE_SERIES.map((s) => (
            <linearGradient
              key={s.id}
              id={`sheet-${s.id}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={PAD_T}
              x2="0"
              y2={BASELINE_Y}
            >
              <stop offset="0%" stopColor={s.colorLight} />
              <stop offset="24%" stopColor={s.color} />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.72" />
            </linearGradient>
          ))}
        </defs>

        {series.map(({ meta, layer, crest }) => (
          <PaperWaveLayer
            key={meta.id}
            meta={meta}
            layer={layer}
            crest={crest}
          />
        ))}

        {todayDay !== selectedDay ? (
          <line
            x1={todayX}
            y1={PAD_T}
            x2={todayX}
            y2={BASELINE_Y}
            className={styles.todayLine}
          />
        ) : null}

        <g className={styles.marker}>
          <line
            x1={markerX}
            y1={PAD_T - 2}
            x2={markerX}
            y2={BASELINE_Y + 2}
          />
          <circle cx={markerX} cy={PAD_T - 3} r="3" />
        </g>

        {xTicks.map((day) => {
          const x = xForDay(day, cycleLength)
          return (
            <g key={day}>
              <line
                x1={x}
                y1={BASELINE_Y}
                x2={x}
                y2={BASELINE_Y + 3}
                className={styles.tick}
              />
              <text
                x={x}
                y={BASELINE_Y + 13}
                textAnchor="middle"
                className={styles.tickLabel}
              >
                {day}
              </text>
            </g>
          )
        })}
      </svg>

      <div className={styles.eduRail} aria-label="激素科普">
        {HORMONE_SERIES.map((s) => (
          <article
            key={s.id}
            className={styles.eduCard}
            style={
              { '--accent': s.color, '--soft': s.colorSoft } as CSSProperties
            }
          >
            <header className={styles.eduHead}>
              <span className={styles.eduPill} aria-hidden="true" />
              <h4 className={styles.eduTitle}>
                {s.label}
                <em>({s.shortLabel})</em>
              </h4>
            </header>
            <p className={styles.eduBody}>{s.explain}</p>
          </article>
        ))}
      </div>

      <p className={styles.disclaimer}>* {HORMONE_DISCLAIMER}</p>
    </div>
  )
}
