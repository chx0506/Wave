import { SAMPLE_CYCLE, SAMPLE_STREAK_DAYS } from '@/data/sample'
import { CrabFloat } from '@/components/coast/CrabFloat'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { TideCalendar } from '@/components/coast/TideCalendar'
import { TideDial } from '@/components/coast/TideDial'
import {
  APP_NAME,
  HOME_QUESTION,
  MOOD_WEATHER,
  PHASE_TODAY_TIP,
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
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import {
  CalendarBlank,
  CaretRight,
  CloudSun,
  FlowerLotus,
  Leaf,
  Waves,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './CoastScreen.module.css'

function shellPortal(node: React.ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

function SoftBotany() {
  return (
    <svg className={styles.botany} viewBox="0 0 390 780" aria-hidden="true">
      <g fill="none" stroke="var(--tide)" strokeWidth="1.2" opacity="0.28">
        <path d="M8 320 C40 300, 48 340, 72 318 C90 302, 78 360, 110 340" />
        <path d="M18 350 C46 338, 52 372, 80 352" />
        <circle cx="74" cy="316" r="3" fill="var(--tide-soft)" stroke="none" />
        <circle cx="96" cy="336" r="2.2" fill="var(--tide-soft)" stroke="none" />
      </g>
      <g fill="var(--tide-soft)" opacity="0.22">
        <path d="M0 640 C40 600, 70 660, 110 620 C90 680, 40 700, 0 720 Z" />
        <path d="M10 700 C50 670, 80 720, 120 690 C70 740, 30 760, 0 770 Z" />
      </g>
      <g fill="var(--tide)" opacity="0.16">
        <path d="M390 650 C350 610, 320 670, 280 630 C300 690, 350 710, 390 730 Z" />
        <path d="M390 720 C340 690, 310 740, 270 710 C310 760, 360 770, 390 780 Z" />
      </g>
    </svg>
  )
}

export function CoastScreen() {
  const { today, snapshotFor, setTab, mode } = useAppState()
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
  const weather = MOOD_WEATHER.calm
  const tip = PHASE_TODAY_TIP[snapshot.phase]

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
          <p className={styles.question}>{HOME_QUESTION}</p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.calBtn}
            aria-label="潮汐日历"
            onClick={() => setCalendarOpen(true)}
          >
            <CalendarBlank size={18} weight="regular" />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.weatherChip}>
          <CloudSun size={15} weight="fill" />
          <span>今日天气 · {weather.label}</span>
          <em>{weather.hint}</em>
        </div>

        <TideDial
          snapshot={snapshot}
          cycleLength={SAMPLE_CYCLE.cycleLength}
          onPreviewDay={setPreviewDay}
        />

        <div className={styles.metrics}>
          <article className={styles.metric}>
            <span className={styles.metricIcon} data-tone="tide">
              <Waves size={15} weight="fill" />
            </span>
            <p className={styles.metricText}>距下次退潮 {untilPeriod}天</p>
          </article>
          <article className={styles.metric}>
            <span className={styles.metricIcon} data-tone="bloom">
              <FlowerLotus size={15} weight="fill" />
            </span>
            <p className={styles.metricText}>
              {untilOvulation === 0 ? '排卵窗口进行中' : `排卵窗口 ${untilOvulation}天后`}
            </p>
          </article>
          <article className={styles.metric}>
            <span className={styles.metricIcon} data-tone="cal">
              <CalendarBlank size={15} weight="fill" />
            </span>
            <p className={styles.metricText}>连续记录 {SAMPLE_STREAK_DAYS}天</p>
          </article>
        </div>

        <article className={styles.tip}>
          <p className={styles.tipLabel}>今天可以怎样舒服一点</p>
          <p className={styles.tipBody}>{tip}</p>
        </article>

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

      <CrabFloat
        phase={todaySnap.phase}
        onOpenBay={() => setTab(Tabs.bay)}
        onOpenObserve={() => setTab(Tabs.observe)}
      />

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
