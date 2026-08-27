import { SAMPLE_CYCLE, TODAY } from '@/data/sample'
import { monthCells, WEEKDAYS } from '@/domain/calendar'
import {
  APP_NAME,
  PHASE_TIDE_LABEL,
  PHASE_TIDE_LEGEND,
} from '@/domain/copy'
import { cycleDayNumber } from '@/domain/cycle'
import { addDays, formatYearMonth, sameDay } from '@/domain/dates'
import type { CalendarCell, Phase } from '@/domain/types'
import {
  CaretLeft,
  CaretRight,
  Drop,
  Moon,
  X,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import styles from './TideCalendar.module.css'

const PHASE_HINT: Record<Phase, string> = {
  menstrual: '能量较低 适合休息',
  follicular: '状态上升 适合行动',
  ovulatory: '能量高峰 释放光芒',
  luteal: '平稳平衡 适合整合',
}

const PHASE_ORDER: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal']

function isPredictedPeriod(date: Date): boolean {
  const nextStart = addDays(SAMPLE_CYCLE.currentCycleStart, SAMPLE_CYCLE.cycleLength)
  const periodEnd = addDays(nextStart, SAMPLE_CYCLE.phaseWindows.menstrual - 1)
  return date >= nextStart && date <= periodEnd
}

function dayMark(cell: Extract<CalendarCell, { kind: 'day' }>) {
  const { snapshot } = cell
  if (snapshot.phase === 'menstrual') return 'period' as const
  if (isPredictedPeriod(snapshot.date)) return 'predicted' as const
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
                      <Moon size={14} weight="fill" />
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
                <PhaseGlyph phase={phase} />
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
                <Moon size={11} weight="fill" /> 排卵
              </span>
              <span>
                <i className={styles.legPeriod} /> 经期
              </span>
              <span>
                <i className={styles.legPredicted} /> 预测
              </span>
            </div>
          </div>
          <RhythmChart todayCycleDay={cycleDayNumber(TODAY, SAMPLE_CYCLE)} />
        </section>

        <button type="button" className={styles.markCta}>
          <Drop size={16} weight="fill" />
          标记退潮开始
        </button>
      </div>
    </div>
  )
}

function DropFace({ dashed }: { dashed?: boolean }) {
  return (
    <svg viewBox="0 0 24 28" width="16" height="18">
      <path
        d="M12 2 C12 2 4 12 4 18 A8 8 0 0 0 20 18 C20 12 12 2 12 2 Z"
        fill={dashed ? 'none' : 'url(#dropFill)'}
        stroke={dashed ? 'var(--tide-deep)' : 'none'}
        strokeWidth={dashed ? 1.4 : 0}
        strokeDasharray={dashed ? '2.5 2' : undefined}
      />
      {!dashed && (
        <>
          <circle cx="9.5" cy="17" r="1.1" fill="#fff" opacity="0.9" />
          <circle cx="14.5" cy="17" r="1.1" fill="#fff" opacity="0.9" />
          <path d="M10 20.5 Q12 22 14 20.5" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
          <defs>
            <linearGradient id="dropFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9fd0f0" />
              <stop offset="100%" stopColor="#5fafdf" />
            </linearGradient>
          </defs>
        </>
      )}
    </svg>
  )
}

function PhaseGlyph({ phase }: { phase: Phase }) {
  if (phase === 'menstrual') return <Moon size={16} weight="fill" />
  if (phase === 'ovulatory') return <Drop size={16} weight="fill" />
  return (
    <svg viewBox="0 0 24 16" width="18" height="12">
      <path
        d="M1 10 C5 4, 9 14, 13 8 C17 2, 21 12, 23 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RhythmChart({ todayCycleDay }: { todayCycleDay: number }) {
  const day = Math.min(SAMPLE_CYCLE.cycleLength, Math.max(1, todayCycleDay))
  const w = 320
  const h = 72
  const points: string[] = []
  for (let i = 0; i <= 28; i += 1) {
    const t = i / 28
    const y = 36 + Math.sin(t * Math.PI * 2 - Math.PI / 2) * 22
    const x = 8 + t * (w - 16)
    points.push(`${x},${y}`)
  }
  const tx = 8 + ((day - 1) / 27) * (w - 16)
  const ty = 36 + Math.sin(((day - 1) / 27) * Math.PI * 2 - Math.PI / 2) * 22

  return (
    <svg className={styles.chart} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="rhythmStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7eb8e8" />
          <stop offset="35%" stopColor="#9fd0f0" />
          <stop offset="65%" stopColor="#5fafdf" />
          <stop offset="100%" stopColor="#b7d8f2" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#rhythmStroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
      <circle cx={tx} cy={ty} r="6" fill="#fff" stroke="#5fafdf" strokeWidth="2.5" />
      {PHASE_TIDE_LEGEND.map((item, i) => {
        const x = 24 + i * 74
        return (
          <g key={item.phase} transform={`translate(${x}, 8)`} opacity="0.85">
            <circle r="3" fill="var(--tide)" />
          </g>
        )
      })}
    </svg>
  )
}
