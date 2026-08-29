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
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { diffDays } from '@/domain/dates'
import styles from './TideJournalSection.module.css'

const CATEGORIES: AdviceCategory[] = [
  'emotion',
  'diet',
  'exercise',
  'sleep',
  'work',
]
const DRAG_PX_PER_STEP = 86

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
    periodRecords,
  } = useAppState()
  const fallbackJournal = journalForCycleDay(cycleDay)
  const historyBeforeDate = useMemo(
    () =>
      periodRecords.filter(
        (record) => diffDays(snapshot.date, record.endDate) > 0,
      ),
    [periodRecords, snapshot.date],
  )
  const [category, setCategory] = useState<AdviceCategory>('emotion')
  const wheelLockRef = useRef(0)
  const dragStartXRef = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const suppressClickRef = useRef(false)
  const [aiJournal, setAiJournal] = useState<{
    key: string
    result: DailyJournalAiResult
  } | null>(null)
  const [journalLoading, setJournalLoading] = useState(false)
  const categoryIndex = CATEGORIES.indexOf(category)
  const selectCategoryByOffset = (offset: number) => {
    setCategory((current) => {
      const currentIndex = CATEGORIES.indexOf(current)
      const nextIndex = (
        (currentIndex + offset) % CATEGORIES.length + CATEGORIES.length
      ) % CATEGORIES.length
      return CATEGORIES[nextIndex]
    })
  }
  const handleDecodeWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY

    if (Math.abs(delta) < 12) return

    event.preventDefault()
    const now = window.performance.now()
    if (now - wheelLockRef.current < 280) return
    wheelLockRef.current = now
    selectCategoryByOffset(delta > 0 ? 1 : -1)
  }
  const handleDecodePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = event.clientX
    setDragOffset(0)
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const handleDecodePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragStartX = dragStartXRef.current
    if (dragStartX === null) return
    setDragOffset((dragStartX - event.clientX) / DRAG_PX_PER_STEP)
  }
  const handleDecodePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragStartX = dragStartXRef.current
    dragStartXRef.current = null
    if (dragStartX === null) return

    const dragDistance = event.clientX - dragStartX
    const nearestOffset = Math.round(-dragDistance / DRAG_PX_PER_STEP)
    setDragOffset(0)
    setIsDragging(false)
    suppressClickRef.current = Math.abs(dragDistance) > 8
    if (nearestOffset === 0) return
    selectCategoryByOffset(nearestOffset)
  }
  const handleDecodePointerCancel = () => {
    dragStartXRef.current = null
    setDragOffset(0)
    setIsDragging(false)
  }
  const handleDecodeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      selectCategoryByOffset(1)
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      selectCategoryByOffset(-1)
    }
  }
  const dailyJournalRequest = useMemo(
    () => ({
      date: snapshot.date.toISOString(),
      cycle: {
        cycleDay: snapshot.cycleDay,
        cycleLength,
        phase: snapshot.phase,
        tide: snapshot.tide,
        currentCycleStart: cycleConfig.currentCycleStart.toISOString(),
        periodStarts: periodStarts
          .filter((date) => diffDays(snapshot.date, date) > 0)
          .map((date) => date.toISOString()),
        periodRecords: historyBeforeDate.map((record) => ({
          startDate: record.startDate.toISOString(),
          endDate: record.endDate.toISOString(),
          durationDays:
            Math.round((record.endDate.getTime() - record.startDate.getTime()) / 86400000) + 1,
        })),
      },
    }),
    [
      cycleConfig.currentCycleStart,
      cycleLength,
      periodStarts,
      periodRecords,
      historyBeforeDate,
      snapshot.cycleDay,
      snapshot.phase,
      snapshot.tide,
      snapshot.date,
    ],
  )
  const requestKey = useMemo(
    () => dailyJournalRequestKey(dailyJournalRequest),
    [dailyJournalRequest],
  )
  const legacyRequestKey = useMemo(
    () =>
      JSON.stringify({
        date: snapshot.date.toISOString(),
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
      snapshot.date,
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

    void fetchDailyJournal(dailyJournalRequest, { force: true })
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
          tabIndex={0}
          data-dragging={isDragging ? '1' : '0'}
          onWheel={handleDecodeWheel}
          onPointerDown={handleDecodePointerDown}
          onPointerMove={handleDecodePointerMove}
          onPointerUp={handleDecodePointerUp}
          onPointerCancel={handleDecodePointerCancel}
          onKeyDown={handleDecodeKeyDown}
        >
          {CATEGORIES.map((key, i) => {
            const active = key === category
            const distance = i - categoryIndex - dragOffset
            const wrappedDistance = (
              (distance + CATEGORIES.length / 2) % CATEGORIES.length +
              CATEGORIES.length
            ) % CATEGORIES.length
            const normalizedDistance =
              wrappedDistance - CATEGORIES.length / 2
            const angle = normalizedDistance * 72
            const radians = (angle * Math.PI) / 180
            const depth = Math.cos(radians)
            const x = Math.sin(radians) * 132
            const y = 22 - ((1 - depth) / 2) * 64
            const z = (depth - 1) * 118
            const scale = 0.58 + ((depth + 1) / 2) * 0.48
            const opacity = 0.22 + ((depth + 1) / 2) * 0.78
            return (
              <button
                key={key}
                type="button"
                className={styles.decodeCard}
                data-active={active ? '1' : '0'}
                data-side={
                  normalizedDistance === 0
                    ? 'front'
                    : normalizedDistance > 0
                      ? 'right'
                      : 'left'
                }
                role="tab"
                aria-selected={active}
                onClick={(event) => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    event.preventDefault()
                    return
                  }
                  setCategory(key)
                }}
                style={
                  {
                    '--decode-x': `${x}px`,
                    '--decode-y': `${y}px`,
                    '--decode-z': `${z}px`,
                    '--decode-scale': scale,
                    '--decode-opacity': opacity,
                    '--decode-rotate': `${-angle * 0.38}deg`,
                    '--decode-order': Math.round((depth + 1) * 100),
                  } as CSSProperties
                }
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
