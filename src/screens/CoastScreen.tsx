import { WaveFlowBackdrop } from '@/components/coast/WaveFlowBackdrop'
import { CoastSceneGap } from '@/components/coast/CoastSceneGap'
import { CoastScrollSection } from '@/components/coast/CoastScrollSection'
import { TIDE_JOURNAL_INTRO } from '@/data/tideJournal'
import { SAMPLE_CYCLE } from '@/data/sample'
import { CycleDateStrip } from '@/components/coast/CycleDateStrip'
import { TideJournalSection } from '@/components/coast/TideJournalSection'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { TideCalendar } from '@/components/coast/TideCalendar'
import { TideDial } from '@/components/coast/TideDial'
import {
  APP_NAME,
  RECORD_PROMPT,
  USER_DISPLAY_NAME,
  greetingForHour,
} from '@/domain/copy'
import { snapshotForCycleDay } from '@/domain/cycle'
import { formatMonthDay } from '@/domain/dates'
import { useScrollScrubWave, type WaveMotion } from '@/lib/scrollScrubWave'
import { useAppState } from '@/state/useAppState'
import { CaretRight, Leaf } from '@phosphor-icons/react'
import { useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from 'react'
import { createPortal } from 'react-dom'
import styles from './CoastScreen.module.css'

function shellPortal(node: ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

export function CoastScreen() {
  const { today, snapshotFor, mode } = useAppState()
  const todaySnap = snapshotFor(today)
  const scrollRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const [waveMotion, setWaveMotion] = useState<WaveMotion>({
    reveal: 0.55,
    flow: 0,
  })
  const [dayFloat, setDayFloat] = useState(todaySnap.cycleDay)
  const [recordOpen, setRecordOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const previewDay = Math.min(
    SAMPLE_CYCLE.cycleLength,
    Math.max(1, Math.round(dayFloat)),
  )

  const snapshot = useMemo(
    () => snapshotForCycleDay(previewDay, SAMPLE_CYCLE),
    [previewDay],
  )

  const isFutureDay = previewDay > todaySnap.cycleDay

  const goToToday = () => {
    setDayFloat(todaySnap.cycleDay)
  }

  const greeting = `${greetingForHour(15)}，${USER_DISPLAY_NAME}`
  const [epigraphLead, epigraphTail] = TIDE_JOURNAL_INTRO.epigraph.split('，', 2)

  const syncWaveMotion = useScrollScrubWave({
    scrollRef,
    rootRef: screenRef,
    onMotion: setWaveMotion,
  })

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    syncWaveMotion(event.currentTarget.scrollTop)
  }

  return (
    <div
      ref={screenRef}
      className={styles.screen}
      data-mode={mode}
      style={
        {
          '--wave-reveal': String(waveMotion.reveal),
          '--wave-flow': String(waveMotion.flow),
        } as CSSProperties
      }
    >
      <WaveFlowBackdrop motion={waveMotion} />
      <div className={styles.waveMist} aria-hidden="true" />

      <div
        ref={scrollRef}
        className={styles.scroll}
        onScroll={handleScroll}
        tabIndex={0}
        aria-label="首页内容"
      >
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

        <div className={styles.body} data-other-day={isFutureDay ? '1' : '0'}>
          <CoastScrollSection className={styles.dialStack} label="潮汐表盘">
            <p className={styles.epigraph}>
              <span>{epigraphLead}，</span>
              <span>{epigraphTail}</span>
            </p>
            <TideDial
              snapshot={snapshot}
              cycleLength={SAMPLE_CYCLE.cycleLength}
              cycleConfig={SAMPLE_CYCLE}
              dayFloat={dayFloat}
              onScrubDay={setDayFloat}
              lowTideDay={SAMPLE_CYCLE.phaseWindows.menstrual}
              highTideDay={SAMPLE_CYCLE.cycleLength}
              onPreviewDay={(day) => setDayFloat(day)}
            />
          </CoastScrollSection>

          <div className={styles.journalLead}>
            <CycleDateStrip
              cycleStart={SAMPLE_CYCLE.currentCycleStart}
              cycleLength={SAMPLE_CYCLE.cycleLength}
              dayFloat={dayFloat}
              todayCycleDay={todaySnap.cycleDay}
              onScrubDay={setDayFloat}
              onCommitDay={(day) => setDayFloat(day)}
              onGoToday={goToToday}
            />

            {!isFutureDay ? (
              <TideJournalSection
                phase={snapshot.phase}
                cycleDay={snapshot.cycleDay}
                cycleLength={SAMPLE_CYCLE.cycleLength}
              />
            ) : (
              <div className={styles.otherDayPanel}>
                <p className={styles.otherDayHint}>
                  周期第 {previewDay} 天的日志，将在当天解锁。
                </p>
              </div>
            )}
          </div>

          {!isFutureDay ? <CoastSceneGap variant="surge" /> : null}

          <CoastScrollSection>
            <button
              type="button"
              className={styles.cta}
              onClick={() => setRecordOpen(true)}
            >
              <Leaf size={17} weight="regular" />
              <span>{RECORD_PROMPT}</span>
              <CaretRight size={15} weight="bold" />
            </button>
          </CoastScrollSection>
        </div>
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
