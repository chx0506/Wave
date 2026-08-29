import { CoastRecommendations } from '@/components/coast/CoastRecommendations'
import {
  ADVICE_CATEGORY_LABEL,
  journalForCycleDay,
  type AdviceCategory,
} from '@/data/tideJournal'
import { DECODE_ART } from '@/data/decodeArt'
import type { DaySnapshot } from '@/domain/types'
import {
  dailyJournalRequestKey,
  fetchDailyJournal,
} from '@/lib/dailyJournalApi'
import { useAppState } from '@/state/useAppState'
import type { DailyJournalAiResult } from '@/types/dailyJournal'
import { Leaf } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
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
  const {
    cycleConfig,
    openMindfulnessSession,
    periodStarts,
    today,
  } = useAppState()
  const fallbackJournal = journalForCycleDay(cycleDay)
  const [category, setCategory] = useState<AdviceCategory>('emotion')
  const [aiJournal, setAiJournal] = useState<{
    key: string
    result: DailyJournalAiResult
  } | null>(null)
  const [journalLoading, setJournalLoading] = useState(false)
  const categoryIndex = CATEGORIES.indexOf(category)
  const dailyJournalRequest = useMemo(
    () => ({
      date: today.toISOString(),
      cycle: {
        cycleDay: snapshot.cycleDay,
        cycleLength,
        phase: snapshot.phase,
        tide: snapshot.tide,
        currentCycleStart: cycleConfig.currentCycleStart.toISOString(),
        periodStarts: periodStarts.map((date) => date.toISOString()),
      },
    }),
    [
      cycleConfig.currentCycleStart,
      cycleLength,
      periodStarts,
      snapshot.cycleDay,
      snapshot.phase,
      snapshot.tide,
      today,
    ],
  )
  const requestKey = useMemo(
    () => dailyJournalRequestKey(dailyJournalRequest),
    [dailyJournalRequest],
  )
  const legacyRequestKey = useMemo(
    () =>
      JSON.stringify({
        date: today.toISOString(),
        cycleDay: snapshot.cycleDay,
        cycleLength,
        phase: snapshot.phase,
        tide: snapshot.tide,
        currentCycleStart: cycleConfig.currentCycleStart.toISOString(),
        periodStarts: periodStarts.map((date) => date.toISOString()),
      }),
    [
      cycleConfig.currentCycleStart,
      cycleLength,
      periodStarts,
      snapshot.cycleDay,
      snapshot.phase,
      snapshot.tide,
      today,
    ],
  )
  const activeAiJournal =
    aiJournal?.key === requestKey || aiJournal?.key === legacyRequestKey
      ? aiJournal.result
      : null
  const journal = activeAiJournal
    ? {
        ...fallbackJournal,
        todayHeadline: activeAiJournal.todayHeadline,
        todayIntro: activeAiJournal.todayIntro,
        advice: activeAiJournal.advice,
      }
    : fallbackJournal

  useEffect(() => {
    let alive = true
    const loadingTimer = window.setTimeout(() => {
      if (alive && !activeAiJournal) setJournalLoading(true)
    }, 0)

    if (activeAiJournal) {
      window.clearTimeout(loadingTimer)
      return () => {
        alive = false
      }
    }

    void fetchDailyJournal(dailyJournalRequest)
      .then((response) => {
        if (!alive) return
        if (response.ok) setAiJournal({ key: requestKey, result: response.result })
      })
      .catch(() => {
        /* Keep static journal copy when AI is unavailable. */
      })
      .finally(() => {
        if (alive) setJournalLoading(false)
      })

    return () => {
      alive = false
      window.clearTimeout(loadingTimer)
    }
  }, [activeAiJournal, dailyJournalRequest, requestKey])

  return (
    <section className={styles.section} aria-label="潮汐日志">
      <article className={styles.todayPanel}>
        <p className={styles.cycleMeta}>
          周期第 {cycleDay} 天 / 共 {cycleLength} 天
        </p>
        <h2 className={styles.todayHeadline}>{journal.todayHeadline}</h2>
        <p className={styles.todayIntro}>{journal.todayIntro}</p>
        {journalLoading ? (
          <p className={styles.aiStatus}>正在生成今日潮汐提示</p>
        ) : null}
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

      {/* 科普 / 正念 / 小实验推荐 */}
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
