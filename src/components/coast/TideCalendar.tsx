import { SAMPLE_PERIOD_RECORDS, TODAY } from '@/data/sample'
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
import { addDays, daysInMonth, formatMonthDay, formatYearMonth, sameDay } from '@/domain/dates'
import {
  buildCyclePrediction,
  predictionSnapshotForDate,
  type CyclePrediction,
} from '@/domain/periodPrediction'
import type { CalendarCell, CycleConfig, DaySnapshot, Phase } from '@/domain/types'
import { HormoneCurveChart } from '@/components/coast/HormoneCurveChart'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { useAppState } from '@/state/useAppState'
import { CalendarBlank, CalendarCheck, CaretLeft, CaretRight, MoonStars, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './TideCalendar.module.css'

type CalendarScale = 'month' | 'year' | 'day'
type MiniMonthCell =
  | { kind: 'empty'; key: string }
  | { kind: 'day'; key: string; date: Date; snapshot: DaySnapshot }

const CALENDAR_SCALES: { id: CalendarScale; label: string }[] = [
  { id: 'year', label: '年' },
  { id: 'month', label: '月' },
  { id: 'day', label: '日' },
]

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) => `${index + 1}月`)

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

function dayMark(cell: Extract<CalendarCell, { kind: 'day' }>) {
  const { snapshot } = cell
  if (snapshot.source === 'predicted') return 'predicted' as const
  if (snapshot.source === 'logged') return 'period' as const
  if (snapshot.phase === 'ovulatory') return 'ovulation' as const
  return 'none' as const
}

function isFutureDate(date: Date) {
  return date > TODAY
}

export function TideCalendar({ onClose }: { onClose?: () => void }) {
  const { cycleConfig } = useAppState()
  const [year, setYear] = useState(TODAY.getFullYear())
  const [month, setMonth] = useState(TODAY.getMonth() + 1)
  const [selected, setSelected] = useState(TODAY)
  const [scale, setScale] = useState<CalendarScale>('month')
  const [recordDate, setRecordDate] = useState<Date | null>(null)

  const prediction = useMemo(
    () => buildCyclePrediction(SAMPLE_PERIOD_RECORDS),
    [],
  )

  const cells = useMemo(
    () =>
      prediction
        ? monthCells(year, month, prediction.config).map((cell) =>
            cell.kind === 'day'
              ? {
                  ...cell,
                  snapshot: predictionSnapshotForDate(cell.date, prediction),
                }
              : cell,
          )
        : monthCells(year, month, cycleConfig),
    [cycleConfig, prediction, year, month],
  )

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const activeConfig = prediction?.config ?? cycleConfig
  const todayCycleDay = cycleDayNumber(TODAY, activeConfig)
  const selectedSnapshot = prediction
    ? predictionSnapshotForDate(selected, prediction)
    : undefined
  const selectedCycleDay = selectedSnapshot?.cycleDay ?? cycleDayNumber(selected, activeConfig)
  const asPage = !onClose

  return (
    <div
      className={styles.overlay}
      data-mode={asPage ? 'page' : 'sheet'}
      role={asPage ? undefined : 'dialog'}
      aria-modal={asPage ? undefined : true}
      aria-label="潮汐日历"
    >
      <header className={styles.header}>
        {onClose ? (
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="关闭">
            <X size={18} weight="bold" />
          </button>
        ) : (
          <span className={styles.headerSpacer} aria-hidden="true" />
        )}
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{APP_NAME}</h2>
          <p className={styles.subtitle}>潮汐日历</p>
        </div>
        <span className={styles.headerSpacer} aria-hidden="true" />
      </header>

      <div className={styles.scroll} data-scale={scale}>
        <div className={styles.scaleTabs} role="tablist" aria-label="日历维度">
          {CALENDAR_SCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.scaleTab}
              data-active={scale === item.id}
              role="tab"
              aria-selected={scale === item.id}
              onClick={() => setScale(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {prediction ? (
          <>
            {scale === 'month' ? (
              <>
                <MonthViewPager
                  year={year}
                  month={month}
                  onPrevious={() => shiftMonth(-1)}
                  onNext={() => shiftMonth(1)}
                />
                <MonthCalendar
                  cells={cells}
                  selected={selected}
                  onSelect={(date) => {
                    setSelected(date)
                    setRecordDate(date)
                  }}
                />
              </>
            ) : null}

            {scale === 'year' ? (
              <YearCalendar
                year={year}
                prediction={prediction}
                selected={selected}
                onYearChange={setYear}
                onSelect={(date) => {
                  setSelected(date)
                  setYear(date.getFullYear())
                  setMonth(date.getMonth() + 1)
                  setScale('month')
                }}
              />
            ) : null}

            {scale === 'day' && selectedSnapshot ? (
              <DayCalendar
                prediction={prediction}
                onSelectDate={(date) => {
                  setSelected(date)
                  setYear(date.getFullYear())
                  setMonth(date.getMonth() + 1)
                  setRecordDate(date)
                }}
              />
            ) : null}
          </>
        ) : (
          <CalendarEmptyState />
        )}

        {scale === 'month' ? (
          <>
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
                <h3>潮汐节律 · {activeConfig.cycleLength}天</h3>
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
              <RhythmChart todayCycleDay={todayCycleDay} cycleConfig={activeConfig} />
            </section>

            <section className={styles.hormoneSection} aria-label="激素曲线">
              <HormoneCurveChart
                cycleLength={activeConfig.cycleLength}
                selectedDay={selectedCycleDay}
                todayDay={todayCycleDay}
                cycleConfig={activeConfig}
              />
            </section>
          </>
        ) : null}
      </div>
      {recordDate ? (
        <RecordSheet
          dateLabel={formatMonthDay(recordDate)}
          onClose={() => setRecordDate(null)}
          onSave={() => setRecordDate(null)}
        />
      ) : null}
    </div>
  )
}

function MonthViewPager({
  year,
  month,
  onPrevious,
  onNext,
}: {
  year: number
  month: number
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className={styles.pager}>
      <button type="button" className={styles.nav} onClick={onPrevious} aria-label="上个月">
        <CaretLeft size={16} weight="bold" />
      </button>
      <strong>{formatYearMonth(year, month)}</strong>
      <button type="button" className={styles.nav} onClick={onNext} aria-label="下个月">
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  )
}

function MonthCalendar({
  cells,
  selected,
  onSelect,
}: {
  cells: CalendarCell[]
  selected: Date
  onSelect: (date: Date) => void
}) {
  return (
    <section className={styles.calCard}>
      <PhaseLegend />
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((cell) => {
          if (cell.kind === 'empty') return <div key={cell.key} />
          const mark = dayMark(cell)
          const phase = cell.snapshot.phase
          const isToday = sameDay(cell.date, TODAY)
          const isFuture = isFutureDate(cell.date)
          const isSelected = sameDay(cell.date, selected)
          return (
            <button
              key={cell.key}
              type="button"
              className={styles.day}
              data-phase={phase}
              data-today={isToday}
              data-future={isFuture}
              data-selected={isSelected}
              data-mark={mark}
              disabled={isFuture}
              onClick={() => onSelect(cell.date)}
              aria-label={`${cell.date.getDate()}日 ${PHASE_LABEL[phase]} ${TIDE_METAPHOR_SHORT[phase]}`}
            >
              <span className={styles.dayNum}>{cell.date.getDate()}</span>
                {isToday ? (
                  <span className={styles.todayMark} aria-hidden="true">
                    <CalendarCheck size={10} weight="fill" />
                  </span>
                ) : null}
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
  )
}

function PhaseLegend() {
  return (
    <div className={styles.phaseLegend}>
      {PHASE_ORDER.map((phase) => (
        <span key={phase} className={styles.phaseLegendItem} data-phase={phase}>
          <i className={styles.phaseSwatch} aria-hidden="true" />
          {PHASE_LABEL[phase].replace('期', '')}
        </span>
      ))}
    </div>
  )
}

function YearCalendar({
  year,
  prediction,
  selected,
  onSelect,
  onYearChange,
}: {
  year: number
  prediction: CyclePrediction
  selected: Date
  onSelect: (date: Date) => void
  onYearChange: (year: number) => void
}) {
  return (
    <>
      <div className={styles.pager}>
        <button type="button" className={styles.nav} onClick={() => onYearChange(year - 1)} aria-label="上一年">
          <CaretLeft size={16} weight="bold" />
        </button>
        <strong>{year}年</strong>
        <button type="button" className={styles.nav} onClick={() => onYearChange(year + 1)} aria-label="下一年">
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
      <section className={styles.calCard}>
        <div className={styles.yearGrid}>
          {MONTH_LABELS.map((label, index) => (
            <MiniMonth
              key={label}
              year={year}
              month={index + 1}
              label={label}
              prediction={prediction}
              onOpenMonth={() =>
                onSelect(new Date(year, index, Math.min(selected.getDate(), daysInMonth(year, index + 1))))
              }
            />
          ))}
        </div>
      </section>
    </>
  )
}

function MiniMonth({
  year,
  month,
  label,
  prediction,
  onOpenMonth,
}: {
  year: number
  month: number
  label: string
  prediction: CyclePrediction
  onOpenMonth: () => void
}) {
  const first = new Date(year, month - 1, 1).getDay()
  const count = daysInMonth(year, month)
  const monthStart = new Date(year, month - 1, 1)
  const isFutureMonth = monthStart > TODAY
  const cells: MiniMonthCell[] = [
    ...Array.from({ length: first }, (_, index) => ({
      kind: 'empty' as const,
      key: `pad-${index}`,
    })),
    ...Array.from({ length: count }, (_, index) => {
      const date = new Date(year, month - 1, index + 1)
      return {
        kind: 'day' as const,
        key: String(index + 1),
        date,
        snapshot: predictionSnapshotForDate(date, prediction),
      }
    }),
  ]

  return (
    <button
      type="button"
      className={styles.miniMonth}
      data-future={isFutureMonth}
      disabled={isFutureMonth}
      onClick={onOpenMonth}
      aria-label={`查看${year}年${label}`}
    >
      <p>{label}</p>
      <div className={styles.miniGrid}>
        {cells.map((cell) =>
          cell.kind === 'day' ? (
            <span
              key={cell.key}
              className={styles.miniDay}
              data-phase={cell.snapshot.phase}
              data-today={sameDay(cell.date, TODAY)}
              data-future={isFutureDate(cell.date)}
            >
              {cell.date.getDate()}
            </span>
          ) : (
            <span key={cell.key} />
          ),
        )}
      </div>
    </button>
  )
}

function DayCalendar({
  prediction,
  onSelectDate,
}: {
  prediction: CyclePrediction
  onSelectDate: (date: Date) => void
}) {
  const todayRef = useRef<HTMLButtonElement | null>(null)
  const days = useMemo(
    () =>
      Array.from({ length: 361 }, (_, index) => {
        const date = addDays(TODAY, index - 180)
        return {
          date,
          snapshot: predictionSnapshotForDate(date, prediction),
        }
      }),
    [prediction],
  )

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <section className={styles.dayListCard} aria-label="按日期浏览记录">
      <div className={styles.dayList}>
        {days.map(({ date, snapshot }) => {
          const isToday = sameDay(date, TODAY)
          const isFuture = isFutureDate(date)
          return (
            <button
              key={date.toISOString()}
              ref={isToday ? todayRef : undefined}
              type="button"
              className={styles.dayListItem}
              data-phase={snapshot.phase}
              data-today={isToday}
              data-future={isFuture}
              disabled={isFuture}
              onClick={() => onSelectDate(date)}
              aria-label={`${formatMonthDay(date)}，${isToday ? '今天，' : ''}${PHASE_LABEL[snapshot.phase]}`}
            >
              <span className={styles.dayListDate}>
                <strong>{formatMonthDay(date)}</strong>
                <em>{isToday ? '今日' : `${date.getFullYear()}年`}</em>
              </span>
              <span className={styles.dayListPhase}>
                <img src={PHASE_ICON[snapshot.phase]} alt="" aria-hidden="true" />
                {PHASE_LABEL[snapshot.phase]}
              </span>
              <span className={styles.dayListMeta}>
                第 {snapshot.cycleDay} 天
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function CalendarEmptyState() {
  return (
    <section className={styles.emptyState}>
      <CalendarBlank size={34} weight="duotone" />
      <h3>还没有可用于预测的经期记录</h3>
      <p>记录至少一次月经开始和结束日期后，日历会估算月经期、卵泡期、排卵期和黄体期。</p>
      <span>
        <MoonStars size={14} weight="fill" />
        预测只用于日常观察，不作为诊断依据
      </span>
    </section>
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
