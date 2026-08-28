import {
  MINDFULNESS_CATEGORY_LABEL,
  MINDFULNESS_THUMB_SRC,
  recommendMindfulness,
  recommendHint,
  recommendPhaseLine,
  sessionsForCategory,
  type MindfulnessCategory,
  type MindfulnessSession,
  type MindfulnessThumb,
} from '@/data/mindfulness'
import { useAppState } from '@/state/useAppState'
import { CaretRight, Leaf } from '@phosphor-icons/react'
import shell from './shared/pageShell.module.css'
import styles from './MindfulnessLibrary.module.css'

const CATEGORIES: MindfulnessCategory[] = ['sleep', 'stress', 'mood', 'fatigue']

type Props = {
  onSelect: (session: MindfulnessSession) => void
}

export function MindfulnessLibrary({ onSelect }: Props) {
  const { snapshot } = useAppState()
  const recommended = recommendMindfulness(snapshot)

  return (
    <div className={`${shell.screen} ${styles.screen}`}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={`${shell.header} ${styles.header}`}>
        <h1 className={shell.title}>正念</h1>
        <button type="button" className={styles.iconBtn} aria-label="主题">
          <Leaf size={18} weight="regular" />
        </button>
      </header>

      <div className={`${shell.body} ${styles.body}`}>
        <button
          type="button"
          className={styles.hero}
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

        {CATEGORIES.map((category) => {
          const items = sessionsForCategory(category)
          return (
            <section key={category} className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>
                  {MINDFULNESS_CATEGORY_LABEL[category]}
                </h3>
                <span className={styles.sectionMore} aria-hidden="true">
                  <CaretRight size={14} weight="bold" />
                </span>
              </div>
              <div className={styles.grid}>
                {items.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onSelect={() => onSelect(session)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  onSelect,
}: {
  session: MindfulnessSession
  onSelect: () => void
}) {
  return (
    <button type="button" className={styles.card} onClick={onSelect}>
      <span className={styles.cardArt} aria-hidden="true">
        <MindfulnessThumb kind={session.thumb} />
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardTitle}>{session.title}</span>
        <span className={styles.cardMeta}>{session.durationLabel}</span>
      </span>
    </button>
  )
}

function MindfulnessThumb({ kind }: { kind: MindfulnessThumb }) {
  return (
    <img
      className={styles.thumbImg}
      src={MINDFULNESS_THUMB_SRC[kind]}
      alt=""
      draggable={false}
    />
  )
}
