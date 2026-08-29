import {
  recommendHint,
  recommendMindfulness,
  recommendPhaseLine,
  type MindfulnessSession,
} from '@/data/mindfulness'
import type { DaySnapshot } from '@/domain/types'
import styles from './MindfulnessRecommendHero.module.css'

type Props = {
  snapshot: DaySnapshot
  onSelect: (session: MindfulnessSession) => void
  className?: string
}

export function MindfulnessRecommendHero({
  snapshot,
  onSelect,
  className,
}: Props) {
  const recommended = recommendMindfulness(snapshot)

  return (
    <button
      type="button"
      className={[styles.hero, className].filter(Boolean).join(' ')}
      onClick={() => onSelect(recommended)}
    >
      <div className={styles.heroSurface} aria-hidden="true" />
      <span className={styles.heroTag}>为你定制</span>
      <div className={styles.heroCopy}>
        <div className={styles.heroTop}>
          <p className={styles.heroKicker}>今日推荐</p>
          <p className={styles.heroPhase}>{recommendPhaseLine(snapshot)}</p>
        </div>
        <div className={styles.heroTitleWrap}>
          <h2 className={styles.heroTitle}>{recommended.title}</h2>
          <p className={styles.heroHint}>{recommendHint(snapshot)}</p>
        </div>
      </div>
    </button>
  )
}
