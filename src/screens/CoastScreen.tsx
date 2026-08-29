import avatarSrc from '@/assets/me/avatar.png'
import { WaveFlowBackdrop } from '@/components/coast/WaveFlowBackdrop'
import { CoastSceneGap } from '@/components/coast/CoastSceneGap'
import { CoastScrollSection } from '@/components/coast/CoastScrollSection'
import { TIDE_JOURNAL_INTRO } from '@/data/tideJournal'
import { CycleDateStrip } from '@/components/coast/CycleDateStrip'
import { TideJournalSection } from '@/components/coast/TideJournalSection'
import { PhaseKnowledgeSheet } from '@/components/coast/PhaseKnowledgeSheet'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { TideCalendar } from '@/components/coast/TideCalendar'
import { TideDial } from '@/components/coast/TideDial'
import { RECORD_PROMPT } from '@/domain/copy'
import { snapshotForCycleDay } from '@/domain/cycle'
import { formatMonthDay } from '@/domain/dates'
import { useScrollScrubWave, type WaveMotion } from '@/lib/scrollScrubWave'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { CaretRight, Leaf } from '@phosphor-icons/react'
import { useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from 'react'
import { createPortal } from 'react-dom'
import styles from './CoastScreen.module.css'

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" fill="#d7ebf7" stroke="#9fc8e8" strokeWidth="1.2" />
      <path d="M4 10h16" stroke="#9fc8e8" strokeWidth="1.2" />
      <rect x="7.5" y="3.2" width="2" height="4.2" rx="1" fill="#7eb4dc" />
      <rect x="14.5" y="3.2" width="2" height="4.2" rx="1" fill="#7eb4dc" />
      <circle cx="8.5" cy="13.5" r="1.1" fill="#7eb4dc" />
      <circle cx="12" cy="13.5" r="1.1" fill="#7eb4dc" />
      <circle cx="15.5" cy="13.5" r="1.1" fill="#7eb4dc" />
      <circle cx="8.5" cy="16.8" r="1.1" fill="#9fc8e8" />
      <circle cx="12" cy="16.8" r="1.1" fill="#6fa8d4" />
      <circle cx="15.5" cy="16.8" r="1.1" fill="#9fc8e8" />
    </svg>
  )
}

function shellPortal(node: ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

export function CoastScreen() {
  const { today, snapshotFor, mode, cycleConfig, setTab } = useAppState()
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
  const [phaseKnowledgeOpen, setPhaseKnowledgeOpen] = useState(false)

  const previewDay = Math.min(
    cycleConfig.cycleLength,
    Math.max(1, Math.round(dayFloat)),
  )

  const snapshot = useMemo(
    () => snapshotForCycleDay(previewDay, cycleConfig),
    [previewDay, cycleConfig],
  )

  const isFutureDay = previewDay > todaySnap.cycleDay

  const goToToday = () => {
    setDayFloat(todaySnap.cycleDay)
  }

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
          <button
            type="button"
            className={styles.meEntry}
            aria-label="我的"
            onClick={() => setTab(Tabs.me)}
          >
            <img className={styles.meAvatar} src={`${avatarSrc}?v=15`} alt="" />
          </button>
          <p className={styles.headerEpigraph}>
            <span>{epigraphLead}，</span>
            <span>{epigraphTail}</span>
          </p>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="潮汐日历"
            onClick={() => setCalendarOpen(true)}
          >
            <CalendarGlyph />
          </button>
        </header>

        <div className={styles.body} data-other-day={isFutureDay ? '1' : '0'}>
          <CoastScrollSection className={styles.dialStack} label="潮汐表盘">
            <TideDial
              snapshot={snapshot}
              cycleLength={cycleConfig.cycleLength}
              cycleConfig={cycleConfig}
              dayFloat={dayFloat}
              onScrubDay={setDayFloat}
              lowTideDay={cycleConfig.phaseWindows.menstrual}
              highTideDay={cycleConfig.cycleLength}
              onPreviewDay={(day) => setDayFloat(day)}
              onPhaseKnowledgeOpen={() => setPhaseKnowledgeOpen(true)}
            />
          </CoastScrollSection>

          <div className={styles.journalLead}>
            <CycleDateStrip
              cycleStart={cycleConfig.currentCycleStart}
              cycleLength={cycleConfig.cycleLength}
              dayFloat={dayFloat}
              todayCycleDay={todaySnap.cycleDay}
              onScrubDay={setDayFloat}
              onCommitDay={(day) => setDayFloat(day)}
              onGoToday={goToToday}
            />

            {!isFutureDay ? (
              <TideJournalSection
                cycleDay={snapshot.cycleDay}
                cycleLength={cycleConfig.cycleLength}
                snapshot={snapshot}
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
        </div>
      </div>

      <div className={styles.ctaDock}>
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

      {phaseKnowledgeOpen &&
        shellPortal(
          <PhaseKnowledgeSheet
            phase={snapshot.phase}
            cycleDay={snapshot.cycleDay}
            onClose={() => setPhaseKnowledgeOpen(false)}
          />,
        )}

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
