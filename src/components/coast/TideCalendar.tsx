import { TODAY } from '@/data/sample'
import { monthCells, WEEKDAYS } from '@/domain/calendar'
import { APP_NAME, PHASE_LABEL, TIDE_METAPHOR_SHORT } from '@/domain/copy'
import {
  PHASE_HINT,
  PHASE_ICON,
  PHASE_ORDER,
  PHASE_RGB,
} from '@/domain/phaseTheme'
import {
  cycleDayNumber,
  phaseForCycleDay,
  tideHeightForCycleDay,
} from '@/domain/cycle'
import { addDays, formatYearMonth, sameDay, startOfDay } from '@/domain/dates'
import type { CalendarCell, CycleConfig, Phase } from '@/domain/types'
import { HormoneCurveChart } from '@/components/coast/HormoneCurveChart'
import { useAppState } from '@/state/useAppState'
import { CaretLeft, CaretRight, Drop, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import styles from './TideCalendar.module.css'

const RHYTHM = {
  period: '#D97868',
  menstrual: `rgb(${PHASE_RGB.menstrual})`,
  follicular: `rgb(${PHASE_RGB.follicular})`,
  ovulatory: `rgb(${PHASE_RGB.ovulatory})`,
  luteal: `rgb(${PHASE_RGB.luteal})`,
  today: '#6FA8D4',
  ink: '#3A5368',
  soft: '#A8BFCF',
}

function nextPeriodStart(config: CycleConfig) {
  return addDays(config.currentCycleStart, config.cycleLength)
}

/** Past & current recorded period only — future menstrual days stay predicted. */
function isRecordedPeriod(date: Date, config: CycleConfig): boolean {
  const d = startOfDay(date)
  if (d >= nextPeriodStart(config)) return false
  return phaseForCycleDay(cycleDayNumber(d, config), config) === 'menstrual'
}

function isPredictedPeriod(date: Date, config: CycleConfig): boolean {
  const d = startOfDay(date)
  if (d < nextPeriodStart(config)) return false
  return phaseForCycleDay(cycleDayNumber(d, config), config) === 'menstrual'
}

function dayMark(
  cell: Extract<CalendarCell, { kind: 'day' }>,
  config: CycleConfig,
) {
  const { snapshot, date } = cell
  if (isPredictedPeriod(date, config)) return 'predicted' as const
  if (isRecordedPeriod(date, config)) return 'period' as const
  if (snapshot.phase === 'ovulatory') return 'ovulation' as const
  return 'none' as const
}

export function TideCalendar({ onClose }: { onClose: () => void }) {
  const { cycleConfig } = useAppState()
  const [year, setYear] = useState(TODAY.getFullYear())
  const [month, setMonth] = useState(TODAY.getMonth() + 1)
  const [selected, setSelected] = useState(TODAY)

  const cells = useMemo(
    () => monthCells(year, month, cycleConfig),
    [year, month, cycleConfig],
  )

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const todayCycleDay = cycleDayNumber(TODAY, cycleConfig)
  const selectedCycleDay = cycleDayNumber(selected, cycleConfig)

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="潮汐日历">
      <header className={styles.header}>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="关闭">
          <X size={18} weight="bold" />
        </button>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{APP_NAME}</h2>
          <p className={styles.subtitle}>潮汐日历</p>
        </div>
        <span className={styles.iconBtn} aria-hidden="true">
          <Drop size={18} weight="duotone" />
        </span>
      </header>

      <div className={styles.scroll}>
        <div className={styles.pager}>
          <button type="button" className={styles.nav} onClick={() => shiftMonth(-1)} aria-label="上个月">
            <CaretLeft size={16} weight="bold" />
          </button>
          <strong>{formatYearMonth(year, month)}</strong>
          <button type="button" className={styles.nav} onClick={() => shiftMonth(1)} aria-label="下个月">
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <section className={styles.calCard}>
          <div className={styles.phaseLegend}>
            {PHASE_ORDER.map((phase) => (
              <span key={phase} className={styles.phaseLegendItem} data-phase={phase}>
                <i className={styles.phaseSwatch} aria-hidden="true" />
                {PHASE_LABEL[phase].replace('期', '')}
              </span>
            ))}
          </div>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className={styles.grid}>
            {cells.map((cell) => {
              if (cell.kind === 'empty') return <div key={cell.key} />
              const mark = dayMark(cell, cycleConfig)
              const phase = cell.snapshot.phase
              const isToday = sameDay(cell.date, TODAY)
              const isSelected = sameDay(cell.date, selected)
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={styles.day}
                  data-phase={phase}
                  data-today={isToday}
                  data-selected={isSelected}
                  data-mark={mark}
                  onClick={() => setSelected(cell.date)}
                  aria-label={`${cell.date.getDate()}日 ${PHASE_LABEL[phase]} ${TIDE_METAPHOR_SHORT[phase]}`}
                >
                  <span className={styles.dayNum}>{cell.date.getDate()}</span>
                  <span
                    className={styles.phaseMark}
                    data-phase={phase}
                    data-predicted={mark === 'predicted'}
                    aria-hidden="true"
                  >
                    <img src={PHASE_ICON[phase]} alt="" />
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className={styles.phaseRow}>
          {PHASE_ORDER.map((phase) => (
            <article key={phase} className={styles.phaseCard} data-phase={phase}>
              <span className={styles.phaseIcon} aria-hidden="true">
                <img className={styles.phaseImg} src={PHASE_ICON[phase]} alt="" />
              </span>
              <strong>{PHASE_LABEL[phase]}</strong>
              <span className={styles.phaseSub}>{TIDE_METAPHOR_SHORT[phase]}</span>
              <p>{PHASE_HINT[phase]}</p>
            </article>
          ))}
        </section>

        <section className={styles.rhythm}>
          <div className={styles.rhythmHead}>
            <h3>潮汐节律 · {cycleConfig.cycleLength}天</h3>
            <div className={styles.legend}>
              <span>
                <i className={styles.legToday} /> 今日
              </span>
              {PHASE_ORDER.map((phase) => (
                <span key={phase}>
                  <PhaseMark mini phase={phase} />
                  {PHASE_LABEL[phase]}
                </span>
              ))}
            </div>
          </div>
          <RhythmChart
            todayCycleDay={todayCycleDay}
            cycleConfig={cycleConfig}
          />
        </section>

        <button type="button" className={styles.markCta}>
          <img className={styles.markCtaIcon} src={PHASE_ICON.menstrual} alt="" aria-hidden="true" />
          标记退潮开始
        </button>

        <section className={styles.hormoneSection} aria-label="激素曲线">
          <HormoneCurveChart
            cycleLength={cycleConfig.cycleLength}
            selectedDay={selectedCycleDay}
            todayDay={todayCycleDay}
            cycleConfig={cycleConfig}
          />
        </section>
      </div>
    </div>
  )
}

function PhaseMark({ phase, mini }: { phase: Phase; mini?: boolean }) {
  const size = mini ? 14 : 22
  return (
    <img
      className={styles.phaseMarkMini}
      src={PHASE_ICON[phase]}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
    />
  )
}

function rhythmPoint(
  day: number,
  length: number,
  config: CycleConfig,
  w: number,
  padX: number,
  midY: number,
  amp: number,
) {
  const t = (day - 1) / Math.max(length - 1, 1)
  const x = padX + t * (w - padX * 2)
  const periodPeak = Math.exp(-(((t - 0.1) / 0.09) ** 2))
  const lutealTrough = -0.92 * Math.exp(-(((t - 0.62) / 0.2) ** 2))
  const lateRise = 0.42 * Math.max(0, (t - 0.72) / 0.28) ** 1.15
  const earlyBase = 0.08 + 0.22 * Math.min(1, t / 0.08)
  const h = Math.min(1, Math.max(0, 0.42 + earlyBase * 0.15 + periodPeak * 0.55 + lutealTrough + lateRise))
  const tide = tideHeightForCycleDay(day, config)
  const blended = h * 0.72 + tide * 0.28
  const y = midY - (blended - 0.45) * amp * 2
  return { x, y, phase: phaseForCycleDay(day, config) }
}

function phaseStroke(phase: Phase): { color: string; dashed: boolean } {
  switch (phase) {
    case 'menstrual':
      return { color: RHYTHM.menstrual, dashed: false }
    case 'follicular':
      return { color: RHYTHM.follicular, dashed: false }
    case 'ovulatory':
      return { color: RHYTHM.ovulatory, dashed: false }
    case 'luteal':
      return { color: RHYTHM.luteal, dashed: false }
  }
}

function rhythmPhaseIconDay(phase: Phase, config: CycleConfig): number {
  const { menstrual, follicular, ovulatory, luteal } = config.phaseWindows
  switch (phase) {
    case 'menstrual':
      return Math.max(1, Math.round(menstrual / 2))
    case 'follicular':
      return menstrual + Math.round(follicular / 2)
    case 'ovulatory':
      return menstrual + follicular + Math.round(ovulatory / 2)
    case 'luteal':
      return menstrual + follicular + ovulatory + Math.round(luteal / 2)
  }
}

function RhythmPhaseIcon({
  phase,
  x,
  y,
  size = 24,
}: {
  phase: Phase
  x: number
  y: number
  size?: number
}) {
  return (
    <image
      href={PHASE_ICON[phase]}
      x={x - size / 2}
      y={y - size - 6}
      width={size}
      height={size}
      aria-hidden="true"
    />
  )
}

function RhythmChart({
  todayCycleDay,
  cycleConfig,
}: {
  todayCycleDay: number
  cycleConfig: CycleConfig
}) {
  const length = cycleConfig.cycleLength
  const day = Math.min(length, Math.max(1, todayCycleDay))
  const w = 320
  const h = 128
  const padX = 14
  const midY = 52
  const amp = 28
  const labelY = 112

  const pts = Array.from({ length }, (_, i) =>
    rhythmPoint(i + 1, length, cycleConfig, w, padX, midY, amp),
  )

  // Group consecutive same-stroke segments into smooth polylines
  const polylines: { points: string; color: string; dashed: boolean }[] = []
  let current: { points: string[]; color: string; dashed: boolean } | null = null
  for (let i = 0; i < pts.length; i += 1) {
    const stroke = phaseStroke(pts[i].phase)
    const pair = `${pts[i].x.toFixed(2)},${pts[i].y.toFixed(2)}`
    if (!current || current.color !== stroke.color || current.dashed !== stroke.dashed) {
      if (current) {
        // connect with previous point so segments join
        polylines.push({ points: current.points.join(' '), color: current.color, dashed: current.dashed })
      }
      const startPts = i > 0 ? [`${pts[i - 1].x.toFixed(2)},${pts[i - 1].y.toFixed(2)}`, pair] : [pair]
      current = { points: startPts, color: stroke.color, dashed: stroke.dashed }
    } else {
      current.points.push(pair)
    }
  }
  if (current) {
    polylines.push({ points: current.points.join(' '), color: current.color, dashed: current.dashed })
  }

  const labelDays = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28].filter((d) => d <= length)

  return (
    <svg className={styles.chart} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="28天潮汐节律曲线">
      {PHASE_ORDER.map((phase) => {
        const iconDay = rhythmPhaseIconDay(phase, cycleConfig)
        const p = pts[iconDay - 1]
        return <RhythmPhaseIcon key={phase} phase={phase} x={p.x} y={p.y} />
      })}

      {polylines.map((line, i) => (
        <polyline
          key={`line-${i}`}
          points={line.points}
          fill="none"
          stroke={line.color}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={line.dashed ? '4.5 3.5' : undefined}
          opacity={line.dashed ? 0.85 : 1}
        />
      ))}

      {pts.map((p, i) => {
        const d = i + 1
        const stroke = phaseStroke(p.phase)
        return (
          <circle
            key={`dot-${d}`}
            cx={p.x}
            cy={p.y}
            r={stroke.dashed ? 2.4 : 2.8}
            fill={stroke.dashed ? '#fff' : stroke.color}
            stroke={stroke.color}
            strokeWidth={stroke.dashed ? 1.4 : 0}
          />
        )
      })}

      {labelDays.map((d) => {
        const p = pts[d - 1]
        const isToday = d === day
        return (
          <g key={`label-${d}`}>
            {isToday && (
              <circle cx={p.x} cy={labelY} r="9" fill="#fff" stroke={RHYTHM.today} strokeWidth="1.8" />
            )}
            <text
              x={p.x}
              y={labelY + 3.5}
              textAnchor="middle"
              fill={isToday ? RHYTHM.today : RHYTHM.soft}
              fontSize="9"
              fontWeight={isToday ? 700 : 500}
              fontFamily="var(--font-ui)"
            >
              {d}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
