import {
  ADVICE_CATEGORY_LABEL,
  journalForPhase,
  TIDE_JOURNAL_INTRO,
  type AdviceCategory,
} from '@/data/tideJournal'
import { DECODE_ART } from '@/data/decodeArt'
import { PHASE_LABEL, TIDE_METAPHOR_SHORT } from '@/domain/copy'
import { PHASE_HINT, PHASE_ICON } from '@/domain/phaseTheme'
import type { Phase } from '@/domain/types'
import { CoastSceneGap } from '@/components/coast/CoastSceneGap'
import { CaretDown, Leaf } from '@phosphor-icons/react'
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
  phase: Phase
  cycleDay: number
  cycleLength?: number
}

export function TideJournalSection({
  phase,
  cycleDay,
  cycleLength = 28,
}: Props) {
  const journal = journalForPhase(phase)
  const [category, setCategory] = useState<AdviceCategory>('emotion')
  const [knowledgeOpen, setKnowledgeOpen] = useState(true)
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

      <article className={styles.knowledgeBlock} data-phase={phase}>
        <div className={styles.knowledgeHero}>
          <span className={styles.knowledgeIcon} aria-hidden="true">
            <img src={PHASE_ICON[phase]} alt="" draggable={false} />
          </span>
          <div className={styles.knowledgeHeroText}>
            <h3 className={styles.knowledgePhase}>{PHASE_LABEL[phase]}</h3>
            <p className={styles.knowledgeTide}>
              {TIDE_METAPHOR_SHORT[phase]}
            </p>
            <p className={styles.knowledgeHint}>{PHASE_HINT[phase]}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.knowledgeToggle}
          aria-expanded={knowledgeOpen}
          onClick={() => setKnowledgeOpen((v) => !v)}
        >
          <div className={styles.knowledgeHeadText}>
            <p className={styles.knowledgeTitle}>
              {journal.dayRange} · 第 {cycleDay} 天
            </p>
            <p className={styles.knowledgeMeta}>
              {knowledgeOpen ? '收起生理知识' : '展开生理知识'}
            </p>
          </div>
          <span
            className={styles.knowledgeChevron}
            data-open={knowledgeOpen ? '1' : '0'}
            aria-hidden="true"
          >
            <CaretDown size={16} weight="bold" />
          </span>
        </button>

        {knowledgeOpen && (
          <div className={styles.knowledgeBody}>
            <div className={styles.knowledgeBlocks}>
              <div className={styles.knowledgeItem}>
                <h4>生理变化</h4>
                <p>{journal.physiology}</p>
              </div>
              <div className={styles.knowledgeItem}>
                <h4>主要症状</h4>
                <p>{journal.symptoms}</p>
              </div>
              {journal.otherNotes ? (
                <div className={styles.knowledgeItem}>
                  <h4>其它表现</h4>
                  <p>{journal.otherNotes}</p>
                </div>
              ) : null}
            </div>
            <p className={styles.knowledgeNote}>{TIDE_JOURNAL_INTRO.cycle}</p>
          </div>
        )}
      </article>

      <blockquote className={styles.blessing}>
        <Leaf size={16} weight="regular" aria-hidden="true" />
        <p>{journal.blessing}</p>
      </blockquote>
    </section>
  )
}
