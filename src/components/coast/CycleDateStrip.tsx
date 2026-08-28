import { addDays } from '@/domain/dates'
import { useRef, useState, type PointerEvent } from 'react'
import styles from './CycleDateStrip.module.css'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const
const ITEM_W = 46

type Props = {
  cycleStart: Date
  cycleLength: number
  /** Continuous cycle day 1…length (fractional while scrubbing) */
  dayFloat: number
  todayCycleDay: number
  onScrubDay: (dayFloat: number) => void
  onCommitDay: (cycleDay: number) => void
  onGoToday?: () => void
}

function clampDayFloat(day: number, cycleLength: number) {
  return Math.min(cycleLength, Math.max(1, day))
}

function clampDay(day: number, cycleLength: number) {
  if (day < 1) return 1
  if (day > cycleLength) return cycleLength
  return day
}

export function CycleDateStrip({
  cycleStart,
  cycleLength,
  dayFloat,
  todayCycleDay,
  onScrubDay,
  onCommitDay,
  onGoToday,
}: Props) {
  const dragging = useRef(false)
  const startXRef = useRef(0)
  const startDayRef = useRef(dayFloat)
  const [isDragging, setIsDragging] = useState(false)
  const selected = Math.round(clampDay(dayFloat, cycleLength))
  const isOnToday = selected === todayCycleDay

  const days = Array.from({ length: cycleLength }, (_, i) => {
    const cycleDay = i + 1
    const date = addDays(cycleStart, i)
    return {
      cycleDay,
      date,
      weekday: WEEKDAYS[date.getDay()],
      monthDay: date.getDate(),
      showMonth: date.getDate() === 1 || cycleDay === 1,
      monthLabel: `${date.getMonth() + 1}月`,
    }
  })

  const shift = -(dayFloat - 1) * ITEM_W

  const applyPointer = (clientX: number) => {
    const dx = clientX - startXRef.current
    const next = clampDayFloat(
      startDayRef.current - dx / ITEM_W,
      cycleLength,
    )
    onScrubDay(next)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragging.current = true
    setIsDragging(true)
    startXRef.current = event.clientX
    startDayRef.current = dayFloat
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    applyPointer(event.clientX)
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const committed = Math.round(clampDay(dayFloat, cycleLength))
    onCommitDay(committed)
    onScrubDay(committed)
  }

  return (
    <div className={styles.wrap} aria-label="周期日期">
      <div className={styles.stripRow}>
        <div
          className={styles.viewport}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className={styles.centerMark} aria-hidden="true" />
          <div
            className={styles.track}
            data-dragging={isDragging ? '1' : '0'}
            style={{
              transform: `translate3d(calc(50% - ${ITEM_W / 2}px + ${shift}px), 0, 0)`,
            }}
          >
            {days.map((d) => {
              const dist = Math.abs(d.cycleDay - dayFloat)
              const active = d.cycleDay === selected
              const isToday = d.cycleDay === todayCycleDay
              return (
                <button
                  key={d.cycleDay}
                  type="button"
                  className={styles.item}
                  data-active={active ? '1' : '0'}
                  data-today={isToday ? '1' : '0'}
                  style={{
                    width: ITEM_W,
                    opacity: Math.max(0.28, 1 - dist * 0.22),
                  }}
                  onClick={() => {
                    onCommitDay(d.cycleDay)
                    onScrubDay(d.cycleDay)
                  }}
                  aria-label={`${d.monthLabel}${d.monthDay}日，周期第${d.cycleDay}天${isToday ? '，今天' : ''}`}
                  aria-current={active ? 'date' : undefined}
                >
                  {d.showMonth ? (
                    <span className={styles.month}>{d.monthLabel}</span>
                  ) : (
                    <span className={styles.weekday}>{d.weekday}</span>
                  )}
                  <span className={styles.dayNum}>{d.monthDay}</span>
                </button>
              )
            })}
          </div>
        </div>

        {!isOnToday && onGoToday ? (
          <button
            type="button"
            className={styles.todayJump}
            onClick={onGoToday}
            aria-label="回到今天"
          >
            <span>今</span>
            <span>天</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
