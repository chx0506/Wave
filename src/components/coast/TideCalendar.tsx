import { SAMPLE_CYCLE, TODAY } from '@/data/sample'
import phaseEbb from '@/assets/phases/ebb.png'
import phaseHigh from '@/assets/phases/high.png'
import phaseRise from '@/assets/phases/rise.png'
import phaseSlack from '@/assets/phases/slack.png'
import { monthCells, WEEKDAYS } from '@/domain/calendar'
import { APP_NAME, PHASE_TIDE_LABEL } from '@/domain/copy'
import {
  cycleDayNumber,
  phaseForCycleDay,
  tideHeightForCycleDay,
} from '@/domain/cycle'
import { addDays, formatYearMonth, sameDay, startOfDay } from '@/domain/dates'
import type { CalendarCell, Phase } from '@/domain/types'
import { CaretLeft, CaretRight, Drop, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import styles from './TideCalendar.module.css'

const PHASE_HINT: Record<Phase, string> = {
  menstrual: '能量较低\n适合休息',
  follicular: '状态上升\n适合行动',
  ovulatory: '能量高峰\n释放光芒',
  luteal: '平稳平衡\n适合整合',
}

const PHASE_ICON: Record<Phase, string> = {
  menstrual: phaseEbb,
  follicular: phaseRise,
  ovulatory: phaseHigh,
  luteal: phaseSlack,
}

const PHASE_ORDER: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal']

const RHYTHM = {
  period: '#E8917A',
  periodDeep: '#D97868',
  follicular: '#7EB8D8',
  ovulatory: '#5F9FCB',
  luteal: '#E0C06A',
  today: '#6FA8D4',
  ink: '#3A5368',
  soft: '#A8BFCF',
}

function nextPeriodStart(config = SAMPLE_CYCLE) {
  return addDays(config.currentCycleStart, config.cycleLength)
}

/** Past & current recorded period only — future menstrual days stay predicted. */
function isRecordedPeriod(date: Date): boolean {
  const d = startOfDay(date)
  if (d >= nextPeriodStart()) return false
  return phaseForCycleDay(cycleDayNumber(d, SAMPLE_CYCLE), SAMPLE_CYCLE) === 'menstrual'
}

function isPredictedPeriod(date: Date): boolean {
  const d = startOfDay(date)
  if (d < nextPeriodStart()) return false
  return phaseForCycleDay(cycleDayNumber(d, SAMPLE_CYCLE), SAMPLE_CYCLE) === 'menstrual'
}

function dayMark(cell: Extract<CalendarCell, { kind: 'day' }>) {
  const { snapshot, date } = cell
  if (isPredictedPeriod(date)) return 'predicted' as const
  if (isRecordedPeriod(date)) return 'period' as const
  if (snapshot.phase === 'ovulatory') return 'ovulation' as const
  return 'none' as const
}

export function TideCalendar({ onClose }: { onClose: () => void }) {
  const [year, setYear] = useState(TODAY.getFullYear())
  const [month, setMonth] = useState(TODAY.getMonth() + 1)
  const [selected, setSelected] = useState(TODAY)

  const cells = useMemo(
    () => monthCells(year, month, SAMPLE_CYCLE),
    [year, month],
  )

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

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
          <div className={styles.weekdays}>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className={styles.grid}>
            {cells.map((cell) => {
              if (cell.kind === 'empty') return <div key={cell.key} />
              const mark = dayMark(cell)
              const isToday = sameDay(cell.date, TODAY)
              const isSelected = sameDay(cell.date, selected)
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={styles.day}
                  data-today={isToday}
                  data-selected={isSelected}
                  data-mark={mark}
                  onClick={() => setSelected(cell.date)}
                >
                  <span className={styles.dayNum}>{cell.date.getDate()}</span>
                  {mark === 'period' && (
                    <span className={styles.drop} data-kind="period" aria-hidden="true">
                      <DropFace />
                    </span>
                  )}
                  {mark === 'predicted' && (
                    <span className={styles.drop} data-kind="predicted" aria-hidden="true">
                      <DropFace dashed />
                    </span>
                  )}
                  {mark === 'ovulation' && (
                    <span className={styles.moon} aria-hidden="true">
                      <MoonGlyph />
                    </span>
                  )}
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
              <strong>{PHASE_TIDE_LABEL[phase].replace('期', '')}</strong>
              <p>{PHASE_HINT[phase]}</p>
            </article>
          ))}
        </section>

        <section className={styles.rhythm}>
          <div className={styles.rhythmHead}>
            <h3>潮汐节律 · {SAMPLE_CYCLE.cycleLength}天</h3>
            <div className={styles.legend}>
              <span>
                <i className={styles.legToday} /> 今日
              </span>
              <span>
                <MoonGlyph size={11} /> 排卵
              </span>
              <span>
                <DropFace mini /> 经期
              </span>
              <span>
                <DropFace mini dashed /> 预测
              </span>
            </div>
          </div>
          <RhythmChart todayCycleDay={cycleDayNumber(TODAY, SAMPLE_CYCLE)} />
          <SeaweedDecor />
        </section>

        <button type="button" className={styles.markCta}>
          <Drop size={16} weight="fill" />
          标记退潮开始
        </button>
      </div>
    </div>
  )
}

function DropFace({
  dashed,
  mini,
}: {
  dashed?: boolean
  mini?: boolean
}) {
  const w = mini ? 10 : 16
  const h = mini ? 12 : 18
  return (
    <svg viewBox="0 0 24 28" width={w} height={h} aria-hidden="true">
      <DropFaceMarks dashed={dashed} smile={!dashed && !mini} />
    </svg>
  )
}

function DropFaceMarks({ dashed, smile }: { dashed?: boolean; smile?: boolean }) {
  return (
    <>
      <path
        d="M12 2 C12 2 4 12 4 18 A8 8 0 0 0 20 18 C20 12 12 2 12 2 Z"
        fill={dashed ? 'none' : RHYTHM.period}
        stroke={dashed ? RHYTHM.period : 'none'}
        strokeWidth={dashed ? 1.6 : 0}
        strokeDasharray={dashed ? '2.4 1.8' : undefined}
      />
      {smile && (
        <>
          <circle cx="9.5" cy="17" r="1.1" fill="#fff" opacity="0.95" />
          <circle cx="14.5" cy="17" r="1.1" fill="#fff" opacity="0.95" />
          <path
            d="M10 20.5 Q12 22 14 20.5"
            fill="none"
            stroke="#fff"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </>
      )}
    </>
  )
}

function MoonGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <MoonMarks />
    </svg>
  )
}

function MoonMarks() {
  return (
    <>
      <path
        d="M12.8 3.2A7 7 0 1 0 16.8 13 5.6 5.6 0 0 1 12.8 3.2Z"
        fill={RHYTHM.ovulatory}
      />
      <path
        d="M15.2 4.2 L15.7 5.4 L17 5.6 L16 6.5 L16.3 7.8 L15.2 7.1 L14.1 7.8 L14.4 6.5 L13.4 5.6 L14.7 5.4 Z"
        fill={RHYTHM.ovulatory}
        opacity="0.85"
      />
    </>
  )
}

function rhythmPoint(day: number, length: number, w: number, padX: number, midY: number, amp: number) {
  const t = (day - 1) / Math.max(length - 1, 1)
  const x = padX + t * (w - padX * 2)
  // Story curve: period peak early, luteal trough mid-late, rise into next cycle
  const periodPeak = Math.exp(-(((t - 0.1) / 0.09) ** 2))
  const lutealTrough = -0.92 * Math.exp(-(((t - 0.62) / 0.2) ** 2))
  const lateRise = 0.42 * Math.max(0, (t - 0.72) / 0.28) ** 1.15
  const earlyBase = 0.08 + 0.22 * Math.min(1, t / 0.08)
  const h = Math.min(1, Math.max(0, 0.42 + earlyBase * 0.15 + periodPeak * 0.55 + lutealTrough + lateRise))
  // Blend a touch of real tide height so product logic stays visible
  const tide = tideHeightForCycleDay(day, SAMPLE_CYCLE)
  const blended = h * 0.72 + tide * 0.28
  const y = midY - (blended - 0.45) * amp * 2
  return { x, y, phase: phaseForCycleDay(day, SAMPLE_CYCLE) }
}

function phaseStroke(phase: Phase, day: number): { color: string; dashed: boolean } {
  const { menstrual } = SAMPLE_CYCLE.phaseWindows
  // Soft predicted buffer just after known period length (common tracker pattern)
  if (day > menstrual && day <= menstrual + 2) {
    return { color: RHYTHM.period, dashed: true }
  }
  switch (phase) {
    case 'menstrual':
      return { color: RHYTHM.period, dashed: false }
    case 'follicular':
      return { color: RHYTHM.follicular, dashed: false }
    case 'ovulatory':
      return { color: RHYTHM.ovulatory, dashed: false }
    case 'luteal':
      return { color: RHYTHM.luteal, dashed: false }
  }
}

function RhythmChart({ todayCycleDay }: { todayCycleDay: number }) {
  const length = SAMPLE_CYCLE.cycleLength
  const day = Math.min(length, Math.max(1, todayCycleDay))
  const w = 320
  const h = 128
  const padX = 14
  const midY = 52
  const amp = 28
  const labelY = 112

  const pts = Array.from({ length }, (_, i) => rhythmPoint(i + 1, length, w, padX, midY, amp))

  // Group consecutive same-stroke segments into smooth polylines
  const polylines: { points: string; color: string; dashed: boolean }[] = []
  let current: { points: string[]; color: string; dashed: boolean } | null = null
  for (let i = 0; i < pts.length; i += 1) {
    const stroke = phaseStroke(pts[i].phase, i + 1)
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
  const { menstrual, follicular, ovulatory } = SAMPLE_CYCLE.phaseWindows
  const iconDays = {
    waves: 2,
    drop: Math.max(2, Math.round(menstrual * 0.55)),
    sun: Math.min(
      length - 1,
      menstrual + follicular + ovulatory + Math.round(SAMPLE_CYCLE.phaseWindows.luteal * 0.35),
    ),
    moon: menstrual + follicular + Math.ceil(ovulatory / 2),
  }

  return (
    <svg className={styles.chart} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="28天潮汐节律曲线">
      <WaveCrestIcon x={pts[iconDays.waves - 1].x} y={pts[iconDays.waves - 1].y - 18} />
      <g transform={`translate(${pts[iconDays.drop - 1].x - 9}, ${pts[iconDays.drop - 1].y - 28}) scale(0.75)`}>
        <DropFaceMarks smile />
      </g>
      <HorizonIcon x={pts[iconDays.sun - 1].x} y={pts[iconDays.sun - 1].y - 16} />
      <g transform={`translate(${pts[iconDays.moon - 1].x - 8}, ${pts[iconDays.moon - 1].y - 22}) scale(0.9)`}>
        <MoonMarks />
      </g>

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
        const stroke = phaseStroke(p.phase, d)
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

function WaveCrestIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 12}, ${y - 8})`} opacity="0.95">
      <path
        d="M2 12 Q6 6 10 12 Q14 6 18 12"
        fill="none"
        stroke={RHYTHM.follicular}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M1 8 Q6 2 11 8 Q16 2 21 8"
        fill="none"
        stroke={RHYTHM.ovulatory}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 15 Q7 11 11 15 Q15 11 19 15"
        fill="none"
        stroke={RHYTHM.follicular}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  )
}

function HorizonIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 11}, ${y - 10})`}>
      <path d="M3 12 A9 9 0 0 1 19 12" fill={RHYTHM.luteal} opacity="0.95" />
      <path
        d="M1 14 Q6 11 11 14 Q16 11 21 14"
        fill="none"
        stroke={RHYTHM.follicular}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M2 17 Q7 14.5 11 17 Q15 14.5 20 17"
        fill="none"
        stroke={RHYTHM.follicular}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </g>
  )
}

function SeaweedDecor() {
  return (
    <svg className={styles.seaweed} viewBox="0 0 72 40" aria-hidden="true">
      <path
        d="M12 38 C10 28 16 24 14 14 C13 8 18 4 18 4"
        fill="none"
        stroke="#7EB8D8"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M22 38 C24 30 20 26 23 16 C25 10 22 6 22 6"
        fill="none"
        stroke="#E8917A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M32 38 C30 29 34 25 31 15 C29 9 33 5 33 5"
        fill="none"
        stroke="#6FA8D4"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="48" cy="30" r="3.5" fill="#E0C06A" opacity="0.4" />
      <circle cx="56" cy="24" r="2.6" fill="#E8917A" opacity="0.35" />
      <path
        d="M60 38 C58 32 62 28 60 20"
        fill="none"
        stroke="#9FC8E8"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  )
}
