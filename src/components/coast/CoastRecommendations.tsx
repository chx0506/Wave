import { CoastArticleSheet } from '@/components/coast/CoastArticleSheet'
import { CoastExperimentSheet } from '@/components/coast/CoastExperimentSheet'
import { MindfulnessRecommendHero } from '@/components/coast/MindfulnessRecommendHero'
import {
  recommendArticles,
  recommendExperiments,
  type CoastArticlePick,
  type CoastExperimentPick,
} from '@/data/coastRecommendations'
import type { ExploreArticle } from '@/data/content'
import type { MindfulnessSession } from '@/data/mindfulness'
import { StackScreens, Tabs, type DaySnapshot } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { LockSimple } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './CoastRecommendations.module.css'

type Props = {
  snapshot: DaySnapshot
  onMindfulnessSelect: (session: MindfulnessSession) => void
}

function shellPortal(node: ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

export function CoastRecommendations({
  snapshot,
  onMindfulnessSelect,
}: Props) {
  const { setTab, openStackScreen } = useAppState()
  const articles = recommendArticles(snapshot)
  const experiments = recommendExperiments(snapshot)
  const [articleSheet, setArticleSheet] = useState<CoastArticlePick | null>(null)
  const [experimentSheet, setExperimentSheet] =
    useState<CoastExperimentPick | null>(null)

  return (
    <div className={styles.wrap}>
      <section className={styles.block} aria-label="为你推荐">
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>为你推荐</h3>
          <button
            type="button"
            className={styles.blockLink}
            onClick={() => setTab(Tabs.explore)}
          >
            更多
          </button>
        </div>
        <div className={styles.rail}>
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onOpen={() => setArticleSheet(article)}
            />
          ))}
        </div>
      </section>

      <section className={styles.block} aria-label="今日正念">
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>今日正念</h3>
          <button
            type="button"
            className={styles.blockLink}
            onClick={() => openStackScreen(StackScreens.bay)}
          >
            更多
          </button>
        </div>
        <MindfulnessRecommendHero
          snapshot={snapshot}
          onSelect={onMindfulnessSelect}
        />
      </section>

      <section className={styles.block} aria-label="身体小实验">
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>身体小实验</h3>
          <button
            type="button"
            className={styles.blockLink}
            onClick={() => openStackScreen(StackScreens.observe)}
          >
            更多
          </button>
        </div>
        <div className={styles.rail}>
          {experiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onOpen={() => setExperimentSheet(experiment)}
            />
          ))}
        </div>
      </section>

      {articleSheet &&
        shellPortal(
          <CoastArticleSheet
            article={articleSheet as ExploreArticle}
            locked={articleSheet.locked}
            onClose={() => setArticleSheet(null)}
          />,
        )}

      {experimentSheet &&
        shellPortal(
          <CoastExperimentSheet
            experiment={experimentSheet}
            onClose={() => setExperimentSheet(null)}
          />,
        )}
    </div>
  )
}

function ArticleCard({
  article,
  onOpen,
}: {
  article: CoastArticlePick
  onOpen: () => void
}) {
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <span
        className={styles.cardArt}
        style={{ background: article.coverBg }}
        aria-hidden="true"
      >
        <img src={article.coverSrc} alt="" draggable={false} />
        {article.locked ? (
          <span className={styles.cardLock} aria-label="需要解锁">
            <LockSimple size={11} weight="fill" />
          </span>
        ) : null}
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardTitle}>{article.title}</span>
        <span className={styles.cardMeta}>{article.readTime}</span>
      </span>
    </button>
  )
}

function ExperimentCard({
  experiment,
  onOpen,
}: {
  experiment: CoastExperimentPick
  onOpen: () => void
}) {
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <span
        className={styles.cardArt}
        style={{ background: experiment.coverBg }}
        aria-hidden="true"
      >
        <img src={experiment.coverSrc} alt="" draggable={false} />
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardTitle}>{experiment.question}</span>
        <span className={styles.cardMeta}>{experiment.try}</span>
      </span>
    </button>
  )
}
