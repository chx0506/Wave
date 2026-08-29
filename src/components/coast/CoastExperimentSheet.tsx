import { EXPERIMENT_CATEGORIES } from '@/data/content'
import type { CoastExperimentPick } from '@/data/coastRecommendations'
import { getExperimentProgress } from '@/domain/experiment'
import { StackScreens, type Experiment } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import styles from './CoastExperimentSheet.module.css'

type Props = {
  experiment: CoastExperimentPick
  onClose: () => void
}

export function CoastExperimentSheet({ experiment, onClose }: Props) {
  const {
    experiments,
    createExperiment,
    openStackScreen,
  } = useAppState()
  const [totalDays, setTotalDays] = useState(14)

  const activeMatch = useMemo(
    () =>
      experiments.find(
        (item) =>
          item.status === 'active' && item.question === experiment.question,
      ),
    [experiments, experiment.question],
  )

  const categoryLabel =
    EXPERIMENT_CATEGORIES.find((item) => item.id === experiment.category)
      ?.label ?? '身体'

  const ctaLabel = activeMatch
    ? continueLabel(activeMatch)
    : `开始这个 ${totalDays} 天实验`

  const handlePrimary = () => {
    if (!activeMatch) {
      createExperiment({
        category: experiment.category,
        question: experiment.question,
        try: experiment.try,
        watch: experiment.watch,
        totalDays,
      })
    }
    onClose()
    openStackScreen(StackScreens.observe)
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={experiment.question}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>身体小实验 · {categoryLabel}</p>
            <h2 className={styles.title}>{experiment.question}</h2>
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
          <div
            className={styles.cover}
            style={{ background: experiment.coverBg }}
            aria-hidden="true"
          >
            <img src={experiment.coverSrc} alt="" draggable={false} />
          </div>

          <p className={styles.why}>{experiment.why}</p>

          <section className={styles.block} aria-label="试一试">
            <p className={styles.label}>试一试</p>
            <p className={styles.tryValue}>{experiment.try}</p>
            <p className={styles.hint}>一次只改变这一件事，其余保持平时节奏。</p>
          </section>

          <section className={styles.block} aria-label="观察什么">
            <p className={styles.label}>每天观察</p>
            <div className={styles.watchRow}>
              {experiment.watch.map((item) => (
                <span key={item} className={styles.watchChip}>
                  {item}
                </span>
              ))}
            </div>
            <p className={styles.hint}>
              每天用「更好 / 一般 / 更差」轻轻记一下，几天后会看到自己的曲线。
            </p>
          </section>

          {activeMatch ? (
            <section className={styles.block} aria-label="进行中">
              <p className={styles.label}>进行中</p>
              <p className={styles.progressText}>
                已记录 {activeMatch.observations.length} / {activeMatch.totalDays}{' '}
                天
              </p>
            </section>
          ) : (
            <section className={styles.block} aria-label="观察周期">
              <p className={styles.label}>观察周期</p>
              <div className={styles.dayGrid}>
                {[7, 14, 21].map((days) => (
                  <button
                    type="button"
                    key={days}
                    data-on={totalDays === days}
                    onClick={() => setTotalDays(days)}
                  >
                    {days} 天
                  </button>
                ))}
              </div>
            </section>
          )}

          <button type="button" className={styles.cta} onClick={handlePrimary}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function continueLabel(experiment: Experiment) {
  const { currentDay, remainingDays } = getExperimentProgress(experiment)
  if (currentDay === 0) return '前往潮池，开始第 1 天记录'
  if (remainingDays <= 0) return '前往潮池查看结果'
  return `继续记录 · 还剩 ${remainingDays} 天`
}
