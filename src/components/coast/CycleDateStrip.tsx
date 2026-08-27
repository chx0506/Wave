import { addDays } from '@/domain/dates'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
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
}: Props) {
  const dragging = useRef(false)
  const moved = useRef(false)
  const originX = useRef(0)
  const originDay = useRef(dayFloat)
  const dayFloatRef = useRef(dayFloat)
  const [isDragging, setIsDragging] = useState(false)

  const selected = Math.round(clampDay(dayFloat, cycleLength))
  dayFloatRef.current = dayFloat

  // Keep origin in sync when dial drives the strip
  useEffect(() => {
    if (!dragging.current) originDay.current = dayFloat
  }, [dayFloat])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    moved.current = false
    setIsDragging(true)
    originX.current = e.clientX
    originDay.current = dayFloatRef.current
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const dx = e.clientX - originX.current
    if (Math.abs(dx) > 3) moved.current = true
    // Drag left → later days (strip moves left), same as dial clockwise
    const next = clampDay(originDay.current - dx / ITEM_W, cycleLength)
    onScrubDay(next)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const committed = Math.round(clampDay(dayFloatRef.current, cycleLength))
    onCommitDay(committed)
    onScrubDay(committed)
  }

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

  // Center selected item: shift so dayFloat sits at track center
  const shift = -(dayFloat - 1) * ITEM_W

  return (
    <div className={styles.wrap} aria-label="周期日期">
      <div className={styles.centerMark} aria-hidden="true" />
      <div
        className={styles.viewport}
        data-dragging={isDragging ? '1' : '0'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={styles.track}
          style={{
            transform: `translate3d(calc(50% - ${ITEM_W / 2}px + ${shift}px), 0, 0)`,
            transition: isDragging ? 'none' : 'transform 0.32s var(--ease)',
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
                onClick={(e) => {
                  if (moved.current) {
                    e.preventDefault()
                    return
                  }
                  onCommitDay(d.cycleDay)
                  onScrubDay(d.cycleDay)
                }}
                aria-label={`${d.monthLabel}${d.monthDay}日，周期第${d.cycleDay}天`}
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
    </div>
  )
}
