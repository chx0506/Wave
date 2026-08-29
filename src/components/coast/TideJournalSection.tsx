import { CoastSceneGap } from '@/components/coast/CoastSceneGap'
import { CoastRecommendations } from '@/components/coast/CoastRecommendations'
import {
  ADVICE_CATEGORY_LABEL,
  journalForCycleDay,
  type AdviceCategory,
} from '@/data/tideJournal'
import { DECODE_ART } from '@/data/decodeArt'
import type { DaySnapshot } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { Leaf } from '@phosphor-icons/react'
import { useState } from 'react'
import styles from './TideJournalSection.module.css'

const CATEGORIES: AdviceCategory[] = [
  'emotion',
  'diet',
  'exercise',
  'sleep',
  'work',
]

type Props = {
  cycleDay: number
  cycleLength?: number
  snapshot: DaySnapshot
}

export function TideJournalSection({
  cycleDay,
  cycleLength = 28,
  snapshot,
}: Props) {
  const { openMindfulnessSession } = useAppState()
  const journal = journalForCycleDay(cycleDay)
  const [category, setCategory] = useState<AdviceCategory>('emotion')
  const categoryIndex = CATEGORIES.indexOf(category)

  return (
    <section className={styles.section} aria-label="潮汐日志">
      <article className={styles.todayPanel}>
        <p className={styles.cycleMeta}>
          周期第 {cycleDay} 天 / 共 {cycleLength} 天
        </p>
        <h2 className={styles.todayHeadline}>{journal.todayHeadline}</h2>
        <p className={styles.todayIntro}>{journal.todayIntro}</p>
      </article>

      <div className={styles.decodeFlow}>
        <div
          className={styles.decodeCards}
          role="tablist"
          aria-label="今日建议分类"
        >
          {CATEGORIES.map((key) => {
            const active = key === category
            return (
              <button
                key={key}
                type="button"
                className={styles.decodeCard}
                data-active={active ? '1' : '0'}
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(key)}
              >
                <span className={styles.decodeCardIcon} aria-hidden="true">
                  <img src={DECODE_ART[key]} alt="" draggable={false} />
                </span>
                <span className={styles.decodeCardLabel}>
                  {ADVICE_CATEGORY_LABEL[key]}
                </span>
              </button>
            )
          })}
        </div>

        <article className={styles.decodePanel} aria-live="polite">
          <div className={styles.decodeProgress} aria-hidden="true">
            {CATEGORIES.map((key, i) => (
              <span
                key={key}
                className={styles.decodeSegment}
                data-active={i === categoryIndex ? '1' : '0'}
              />
            ))}
          </div>
          <p className={styles.decodeEyebrow}>
            {ADVICE_CATEGORY_LABEL[category]}建议
          </p>
          <p className={styles.decodeBody}>{journal.advice[category]}</p>
        </article>
      </div>

      <CoastSceneGap variant="crab" size="spacious" revealThreshold={0.25} />

      <CoastRecommendations
        snapshot={snapshot}
        onMindfulnessSelect={(session) => openMindfulnessSession(session.id)}
      />

      <blockquote className={styles.blessing}>
        <Leaf size={16} weight="regular" aria-hidden="true" />
        <p>{journal.blessing}</p>
      </blockquote>
    </section>
  )
}
