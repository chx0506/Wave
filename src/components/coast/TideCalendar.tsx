import { SAMPLE_PERIOD_RECORDS, TODAY } from '@/data/sample'
import { monthCells, WEEKDAYS } from '@/domain/calendar'
import { APP_NAME, PHASE_LABEL, TIDE_METAPHOR_SHORT } from '@/domain/copy'
import {
  PHASE_ICON,
  PHASE_ORDER,
} from '@/domain/phaseTheme'
import {
  cycleDayNumber,
} from '@/domain/cycle'
import {
  flowLabel,
  hasDailyLog,
  moodLabel,
} from '@/domain/dailyLog'
import { addDays, daysInMonth, formatMonthDay, formatYearMonth, sameDay, toKey } from '@/domain/dates'
import {
  buildCyclePrediction,
  predictionSnapshotForDate,
  type CyclePrediction,
} from '@/domain/periodPrediction'
import type {
  CalendarCell,
  DailyLog,
  DayLogsMap,
  DaySnapshot,
} from '@/domain/types'
import {
  DISCHARGE_OPTIONS,
  EXERCISE_OPTIONS,
  INTIMACY_OPTIONS,
  SYMPTOM_OPTIONS,
  type RecordChip,
} from '@/data/recordStatusArt'
import { HormoneCurveChart } from '@/components/coast/HormoneCurveChart'
import { MoodGlyph, moodDiscStyle } from '@/components/coast/MoodGlyph'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { useAppState } from '@/state/useAppState'
import { CalendarBlank, CalendarCheck, CaretLeft, CaretRight, Leaf, MoonStars, PencilSimple, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import flowDry from '@/assets/flow/flow-dry.png'
import flowFull from '@/assets/flow/flow-full.png'
import flowLight from '@/assets/flow/flow-light.png'
import flowMedium from '@/assets/flow/flow-medium.png'
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

const FLOW_ART: Record<string, string> = {
  none: flowDry,
  light: flowLight,
  medium: flowMedium,
  heavy: flowFull,
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

function chipsFor(options: readonly RecordChip[], ids: string[]) {
  return ids
    .map((id) => options.find((item) => item.id === id))
    .filter((item): item is RecordChip => Boolean(item))
}

export function TideCalendar({ onClose }: { onClose?: () => void }) {
  const { cycleConfig, dayLogs, getDailyLog, saveDailyLog, periodRecords } =
    useAppState()
  const [year, setYear] = useState(TODAY.getFullYear())
  const [month, setMonth] = useState(TODAY.getMonth() + 1)
  const [selected, setSelected] = useState(TODAY)
  const [scale, setScale] = useState<CalendarScale>('month')
  const [recordDate, setRecordDate] = useState<Date | null>(null)

  const samplePrediction = useMemo(
    () => buildCyclePrediction(SAMPLE_PERIOD_RECORDS),
    [],
  )
  const importedPrediction = useMemo(
    () => buildCyclePrediction(periodRecords),
    [periodRecords],
  )
  const prediction = importedPrediction ?? samplePrediction

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
  const selectedLog = getDailyLog(selected)
  const asPage = !onClose
  const showDayDetail = scale === 'month' || scale === 'day'

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
                  dayLogs={dayLogs}
                  onSelect={(date) => setSelected(date)}
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
                dayLogs={dayLogs}
                selected={selected}
                onSelectDate={(date) => {
                  setSelected(date)
                  setYear(date.getFullYear())
                  setMonth(date.getMonth() + 1)
                }}
              />
            ) : null}
          </>
        ) : (
          <CalendarEmptyState />
        )}

        {showDayDetail ? (
          <SelectedDayLogPanel
            date={selected}
            snapshot={selectedSnapshot}
            log={selectedLog}
            onEdit={() => {
              if (!isFutureDate(selected)) setRecordDate(selected)
            }}
          />
        ) : null}

        {scale === 'month' ? (
          <section className={styles.hormoneSection} aria-label="激素曲线">
            <HormoneCurveChart
              cycleLength={activeConfig.cycleLength}
              selectedDay={selectedCycleDay}
              todayDay={todayCycleDay}
              cycleConfig={activeConfig}
            />
          </section>
        ) : null}
      </div>
      {recordDate ? (
        <RecordSheet
          key={toKey(recordDate)}
          dateLabel={formatMonthDay(recordDate)}
          initialLog={getDailyLog(recordDate)}
          onClose={() => setRecordDate(null)}
          onSave={(input) => saveDailyLog(recordDate, input)}
        />
      ) : null}
    </div>
  )
}

function SelectedDayLogPanel({
  date,
  snapshot,
  log,
  onEdit,
}: {
  date: Date
  snapshot?: DaySnapshot
  log?: DailyLog
  onEdit: () => void
}) {
  const future = isFutureDate(date)
  const isToday = sameDay(date, TODAY)
  const phase = snapshot?.phase
  const symptoms = log ? chipsFor(SYMPTOM_OPTIONS, log.symptoms) : []
  const discharge = log ? chipsFor(DISCHARGE_OPTIONS, log.discharge) : []
  const exercise = log ? chipsFor(EXERCISE_OPTIONS, log.exercise) : []
  const intimacy = log ? chipsFor(INTIMACY_OPTIONS, log.intimacy) : []
  const moodTone = (log?.mood ?? 'calm') as
    | 'calm'
    | 'low'
    | 'irritable'
    | 'happy'
    | 'sensitive'

  return (
    <section
      className={styles.dayLogPanel}
      aria-label={`${formatMonthDay(date)}状态记录`}
      data-phase={phase}
    >
      <header className={styles.dayLogHead}>
        <div className={styles.dayLogHeadText}>
          <p className={styles.dayLogEyebrow}>
            {isToday ? '今日状态' : '当日状态'}
          </p>
          <h3 className={styles.dayLogTitle}>
            {formatMonthDay(date)}
            {phase ? (
              <span>
                · {PHASE_LABEL[phase]}
                {snapshot ? ` · 第 ${snapshot.cycleDay} 天` : ''}
              </span>
            ) : null}
          </h3>
        </div>
        {!future ? (
          <button type="button" className={styles.dayLogEdit} onClick={onEdit}>
            <PencilSimple size={14} weight="bold" />
            {log ? '编辑' : '记录'}
          </button>
        ) : null}
      </header>

      {future ? (
        <p className={styles.dayLogEmpty}>未来的日子，还没有浪花。</p>
      ) : log ? (
        <div className={styles.dayLogBody}>
          {(log.flow || log.mood) && (
            <div className={styles.dayLogHero}>
              {log.flow ? (
                <div className={styles.dayLogFlow}>
                  <img
                    src={FLOW_ART[log.flow] ?? flowLight}
                    alt=""
                    draggable={false}
                  />
                  <span>
                    <em>经量</em>
                    {flowLabel(log.flow)}
                  </span>
                </div>
              ) : null}
              {log.mood ? (
                <div className={styles.dayLogMood}>
                  <span
                    className={styles.dayLogMoodFace}
                    style={moodDiscStyle(moodTone, true)}
                    aria-hidden="true"
                  >
                    <MoodGlyph tone={moodTone} />
                  </span>
                  <span>
                    <em>心情</em>
                    {moodLabel(log.mood)}
                  </span>
                </div>
              ) : null}
            </div>
          )}

          <LogChipRow title="身体症状" chips={symptoms} />
          <LogChipRow title="分泌物" chips={discharge} />
          <LogChipRow title="运动" chips={exercise} />
          <LogChipRow title="性活动" chips={intimacy} />

          {log.note ? (
            <div className={styles.dayLogNote}>
              <em>备注</em>
              <p>{log.note}</p>
            </div>
          ) : null}

          {!log.flow &&
          !log.mood &&
          symptoms.length === 0 &&
          discharge.length === 0 &&
          exercise.length === 0 &&
          intimacy.length === 0 &&
          !log.note ? (
            <p className={styles.dayLogEmpty}>这一天写过记录，但条目为空。</p>
          ) : null}
        </div>
      ) : (
        <div className={styles.dayLogEmptyWrap}>
          <p className={styles.dayLogEmpty}>这天还没有状态记录。</p>
          <button type="button" className={styles.dayLogCta} onClick={onEdit}>
            <Leaf size={14} weight="fill" />
            记录这一天
          </button>
        </div>
      )}
    </section>
  )
}

function LogChipRow({
  title,
  chips,
}: {
  title: string
  chips: RecordChip[]
}) {
  if (chips.length === 0) return null
  return (
    <div className={styles.dayLogSection}>
      <em>{title}</em>
      <div className={styles.dayLogChips}>
        {chips.map((chip) => (
          <span key={chip.id} className={styles.dayLogChip}>
            <img src={chip.src} alt="" draggable={false} />
            {chip.label}
          </span>
        ))}
      </div>
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
  dayLogs,
  onSelect,
}: {
  cells: CalendarCell[]
  selected: Date
  dayLogs: DayLogsMap
  onSelect: (date: Date) => void
}) {
  return (
    <section className={styles.calCard}>
      <PhaseTideLegend className={styles.phaseLegend} />
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
          const logged = hasDailyLog(dayLogs, cell.date)
          return (
            <button
              key={cell.key}
              type="button"
              className={styles.day}
              data-phase={phase}
              data-today={isToday}
              data-future={isFuture}
              data-selected={isSelected}
              data-logged={logged}
              data-mark={mark}
              disabled={isFuture}
              onClick={() => onSelect(cell.date)}
              aria-label={`${cell.date.getDate()}日 ${PHASE_LABEL[phase]} ${TIDE_METAPHOR_SHORT[phase]}${logged ? '，已记录' : ''}`}
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

function PhaseTideLegend({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="潮汐阶段图例">
      {PHASE_ORDER.map((phase) => (
        <span key={phase} className={styles.phaseLegendItem} data-phase={phase}>
          <img
            className={styles.phaseLegendIcon}
            src={PHASE_ICON[phase]}
            alt=""
            aria-hidden="true"
          />
          <span className={styles.phaseLegendText}>
            <strong>{PHASE_LABEL[phase]}</strong>
            <em>{TIDE_METAPHOR_SHORT[phase]}</em>
          </span>
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
  dayLogs,
  selected,
  onSelectDate,
}: {
  prediction: CyclePrediction
  dayLogs: DayLogsMap
  selected: Date
  onSelectDate: (date: Date) => void
}) {
  const selectedRef = useRef<HTMLButtonElement | null>(null)
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
    selectedRef.current?.scrollIntoView({ block: 'center' })
  }, [selected])

  return (
    <section className={styles.dayListCard} aria-label="按日期浏览记录">
      <div className={styles.dayList}>
        {days.map(({ date, snapshot }) => {
          const isToday = sameDay(date, TODAY)
          const isFuture = isFutureDate(date)
          const isSelected = sameDay(date, selected)
          const logged = hasDailyLog(dayLogs, date)
          return (
            <button
              key={date.toISOString()}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              className={styles.dayListItem}
              data-phase={snapshot.phase}
              data-today={isToday}
              data-future={isFuture}
              data-selected={isSelected}
              data-logged={logged}
              disabled={isFuture}
              onClick={() => onSelectDate(date)}
              aria-label={`${formatMonthDay(date)}，${isToday ? '今天，' : ''}${PHASE_LABEL[snapshot.phase]}${logged ? '，已记录' : ''}`}
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
                {logged ? '已记录 · ' : ''}第 {snapshot.cycleDay} 天
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

