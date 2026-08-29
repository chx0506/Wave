import avatarSrc from '@/assets/me/avatar.png'
import { WaveFlowBackdrop } from '@/components/coast/WaveFlowBackdrop'
import { CoastScrollSection } from '@/components/coast/CoastScrollSection'
import { TIDE_JOURNAL_INTRO } from '@/data/tideJournal'
import { CycleDateStrip } from '@/components/coast/CycleDateStrip'
import { TideJournalSection } from '@/components/coast/TideJournalSection'
import { PhaseKnowledgeSheet } from '@/components/coast/PhaseKnowledgeSheet'
import { RecordSheet } from '@/components/coast/RecordSheet'
import { TideDial } from '@/components/coast/TideDial'
import { APP_NAME, APP_SEAL, RECORD_PROMPT } from '@/domain/copy'
import { snapshotForDate } from '@/domain/cycle'
import { addDays, formatMonthDay } from '@/domain/dates'
import { useScrollScrubWave, type WaveMotion } from '@/lib/scrollScrubWave'
import { StackScreens } from '@/domain/types'
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
  const {
    today,
    snapshotFor,
    mode,
    cycleConfig,
    openStackScreen,
    getDailyLog,
    saveDailyLog,
  } = useAppState()
  const todaySnap = snapshotFor(today)
  const scrollRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const [waveMotion, setWaveMotion] = useState<WaveMotion>({
    reveal: 0.55,
    flow: 0,
  })
  const [dayFloat, setDayFloat] = useState(todaySnap.cycleDay)
  const [recordOpen, setRecordOpen] = useState(false)
  const [phaseKnowledgeOpen, setPhaseKnowledgeOpen] = useState(false)

  const previewDay = Math.min(
    cycleConfig.cycleLength,
    Math.max(1, Math.round(dayFloat)),
  )

  const snapshot = useMemo(
    () => snapshotForDate(addDays(cycleConfig.currentCycleStart, previewDay - 1), cycleConfig),
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
          <div className={styles.brandBlock}>
            <div className={styles.brandRow}>
              <h1 className={styles.brand}>{APP_NAME}</h1>
              <span className={styles.seal} aria-hidden="true">
                {APP_SEAL}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.meEntry}
            aria-label="我的"
            onClick={() => openStackScreen(StackScreens.me)}
          >
            <img className={styles.meAvatar} src={`${avatarSrc}?v=15`} alt="" />
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
            key={today.toISOString()}
            dateLabel={formatMonthDay(today)}
            initialLog={getDailyLog(today)}
            onClose={() => setRecordOpen(false)}
            onSave={(input) => saveDailyLog(today, input)}
          />,
        )}
    </div>
  )
}
