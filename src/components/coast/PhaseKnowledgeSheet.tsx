import {
  journalForCycleDay,
  TIDE_JOURNAL_INTRO,
} from '@/data/tideJournal'
import { PHASE_LABEL, TIDE_METAPHOR_SHORT } from '@/domain/copy'
import { PHASE_HINT, PHASE_ICON } from '@/domain/phaseTheme'
import type { Phase } from '@/domain/types'
import { X } from '@phosphor-icons/react'
import styles from './PhaseKnowledgeSheet.module.css'

type Props = {
  phase: Phase
  cycleDay: number
  onClose: () => void
}

export function PhaseKnowledgeSheet({ phase, cycleDay, onClose }: Props) {
  const journal = journalForCycleDay(cycleDay)

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={`${PHASE_LABEL[phase]}科普知识`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>生理知识</p>
            <h2 className={styles.title}>{PHASE_LABEL[phase]}</h2>
            <p className={styles.subtitle}>
              {journal.dayRange} · 第 {cycleDay} 天
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className={styles.body}>
          <article className={styles.hero} data-phase={phase}>
            <span className={styles.heroIcon} aria-hidden="true">
              <img src={PHASE_ICON[phase]} alt="" draggable={false} />
            </span>
            <div className={styles.heroText}>
              <p className={styles.heroTide}>{TIDE_METAPHOR_SHORT[phase]}</p>
              <p className={styles.heroHint}>{PHASE_HINT[phase]}</p>
            </div>
          </article>

          <div className={styles.blocks}>
            <section className={styles.block}>
              <h3>生理变化</h3>
              <p>{journal.physiology}</p>
            </section>
            <section className={styles.block}>
              <h3>主要症状</h3>
              <p>{journal.symptoms}</p>
            </section>
            {journal.otherNotes ? (
              <section className={styles.block}>
                <h3>其它表现</h3>
                <p>{journal.otherNotes}</p>
              </section>
            ) : null}
          </div>

          <p className={styles.note}>{TIDE_JOURNAL_INTRO.cycle}</p>
        </div>
      </div>
    </div>
  )
}
