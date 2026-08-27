import { SAMPLE_CYCLE, SAMPLE_STREAK_DAYS } from '@/data/sample'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { TideCalendar } from '@/components/coast/TideCalendar'
import { TideDial } from '@/components/coast/TideDial'
import {
  APP_NAME,
  RECORD_PROMPT,
  USER_DISPLAY_NAME,
  greetingForHour,
} from '@/domain/copy'
import {
  daysUntilNextPeriod,
  daysUntilOvulation,
  snapshotForCycleDay,
} from '@/domain/cycle'
import { formatMonthDay } from '@/domain/dates'
import { useAppState } from '@/state/useAppState'
import {
  CalendarBlank,
  CaretRight,
  FlowerLotus,
  Leaf,
  Waves,
} from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './CoastScreen.module.css'

function shellPortal(node: ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

function SoftBotany() {
  return (
    <svg className={styles.botany} viewBox="0 0 390 844" aria-hidden="true">
      <g fill="var(--tide-soft)" opacity="0.34">
        <path d="M-10 520 C28 470, 52 560, 78 500 C98 460, 110 540, 140 510 C120 600, 60 640, -10 680 Z" />
        <path d="M0 680 C40 640, 70 720, 108 680 C80 740, 40 760, 0 790 Z" />
        <path d="M400 540 C360 490, 330 560, 300 520 C280 490, 250 560, 230 530 C260 620, 330 650, 400 700 Z" />
        <path d="M400 700 C350 660, 320 740, 280 700 C320 760, 360 780, 400 810 Z" />
      </g>
      <g fill="none" stroke="var(--tide)" strokeWidth="1.1" opacity="0.22">
        <path d="M12 300 C40 280, 48 330, 72 308 C90 290, 84 350, 112 328" />
        <path d="M360 290 C340 270, 330 320, 308 300 C290 284, 292 340, 268 318" />
      </g>
    </svg>
  )
}

export function CoastScreen() {
  const { today, snapshotFor, mode } = useAppState()
  const todaySnap = snapshotFor(today)
  const [previewDay, setPreviewDay] = useState(todaySnap.cycleDay)
  const [recordOpen, setRecordOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const snapshot = useMemo(
    () => snapshotForCycleDay(previewDay, SAMPLE_CYCLE),
    [previewDay],
  )

  const untilPeriod = daysUntilNextPeriod(todaySnap.cycleDay, SAMPLE_CYCLE)
  const untilOvulation = daysUntilOvulation(todaySnap.cycleDay, SAMPLE_CYCLE)
  const greeting = `${greetingForHour(15)}，${USER_DISPLAY_NAME}`

  return (
    <div className={styles.screen} data-mode={mode}>
      <SoftBotany />

      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <div className={styles.brandRow}>
            <h1 className={styles.brand}>{APP_NAME}</h1>
            <span className={styles.seal} aria-hidden="true">
              潮
            </span>
          </div>
          <p className={styles.greeting}>{greeting}</p>
        </div>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="潮汐日历"
          onClick={() => setCalendarOpen(true)}
        >
          <Leaf size={18} weight="regular" />
        </button>
      </header>

      <div className={styles.body}>
        <TideDial
          snapshot={snapshot}
          cycleLength={SAMPLE_CYCLE.cycleLength}
          cycleConfig={SAMPLE_CYCLE}
          lowTideDay={SAMPLE_CYCLE.phaseWindows.menstrual}
          highTideDay={SAMPLE_CYCLE.cycleLength}
          onPreviewDay={setPreviewDay}
        />

        <div className={styles.metrics}>
          <article className={styles.metric}>
            <span className={styles.metricIcon}>
              <Waves size={16} weight="regular" />
            </span>
            <p className={styles.metricLabel}>距下次退潮</p>
            <p className={styles.metricValue}>{untilPeriod} 天</p>
          </article>
          <article className={styles.metric}>
            <span className={styles.metricIcon}>
              <FlowerLotus size={16} weight="regular" />
            </span>
            <p className={styles.metricLabel}>排卵窗口</p>
            <p className={styles.metricValue}>
              {untilOvulation === 0 ? '进行中' : `${untilOvulation} 天后`}
            </p>
          </article>
          <article className={styles.metric}>
            <span className={styles.metricIcon}>
              <CalendarBlank size={16} weight="regular" />
            </span>
            <p className={styles.metricLabel}>连续记录</p>
            <p className={styles.metricValue}>{SAMPLE_STREAK_DAYS} 天</p>
          </article>
        </div>

        <button
          type="button"
          className={styles.cta}
          onClick={() => setRecordOpen(true)}
        >
          <Leaf size={17} weight="regular" />
          <span>{RECORD_PROMPT}</span>
          <CaretRight size={15} weight="bold" />
        </button>
      </div>

      {recordOpen &&
        shellPortal(
          <RecordSheet
            dateLabel={formatMonthDay(today)}
            onClose={() => setRecordOpen(false)}
            onSave={() => setRecordOpen(false)}
          />,
        )}

      {calendarOpen &&
        shellPortal(<TideCalendar onClose={() => setCalendarOpen(false)} />)}
    </div>
  )
}
