import { useCallback, useEffect, useRef, type RefObject } from 'react'

const WAVE_REVEAL_START = 0
const WAVE_REVEAL_SPAN = 120
const WAVE_REVEAL_BASE = 0.55
const WAVE_FLOW_SPAN = 160
/** Cursor 内置预览等环境下 scrollTop 可能始终为 0，用滚轮累计驱动 */
const VIRTUAL_SCROLL_CAP = 480

export type WaveMotion = {
  reveal: number
  flow: number
}

export function waveRevealForScroll(scrollTop: number) {
  const scrolled = Math.min(
    1,
    Math.max(0, (scrollTop - WAVE_REVEAL_START) / WAVE_REVEAL_SPAN),
  )
  return WAVE_REVEAL_BASE + scrolled * (1 - WAVE_REVEAL_BASE)
}

export function waveFlowForScroll(scrollTop: number, maxScroll: number) {
  const span = Math.max(WAVE_FLOW_SPAN, maxScroll > 0 ? maxScroll : WAVE_FLOW_SPAN)
  return Math.min(1, Math.max(0, scrollTop / span))
}

export function computeWaveMotion(
  scrollTop: number,
  maxScroll: number,
): WaveMotion {
  return {
    reveal: waveRevealForScroll(scrollTop),
    flow: waveFlowForScroll(scrollTop, maxScroll),
  }
}

type Options = {
  scrollRef: RefObject<HTMLElement | null>
  rootRef?: RefObject<HTMLElement | null>
  onMotion: (motion: WaveMotion) => void
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Maps home scroll position → wave motion (flow 0…1). Tuned for Cursor embedded preview. */
export function useScrollScrubWave({ scrollRef, rootRef, onMotion }: Options) {
  const pendingScrollRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const virtualScrollRef = useRef(0)
  const lastAppliedRef = useRef(-1)
  const onMotionRef = useRef(onMotion)
  onMotionRef.current = onMotion

  const readEffectiveScroll = useCallback((scrollEl: HTMLElement) => {
    const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
    const nativeTop = scrollEl.scrollTop
    if (maxScroll > 2) {
      virtualScrollRef.current = nativeTop
      return nativeTop
    }
    return virtualScrollRef.current
  }, [])

  const applyWaveMotion = useCallback(
    (scrollTop: number) => {
      if (Math.abs(scrollTop - lastAppliedRef.current) < 0.35) return
      lastAppliedRef.current = scrollTop

      const scrollEl = scrollRef.current
      const maxScroll = scrollEl
        ? Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
        : 0
      onMotionRef.current(computeWaveMotion(scrollTop, maxScroll))
    },
    [scrollRef],
  )

  const flushWaveMotion = useCallback(() => {
    rafRef.current = null
    applyWaveMotion(pendingScrollRef.current)
  }, [applyWaveMotion])

  const scheduleWaveMotion = useCallback(
    (scrollTop: number) => {
      pendingScrollRef.current = scrollTop
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(flushWaveMotion)
    },
    [flushWaveMotion],
  )

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const sync = () => scheduleWaveMotion(readEffectiveScroll(scrollEl))
    sync()

    const onWheel = (event: WheelEvent) => {
      const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
      if (maxScroll <= 2) {
        virtualScrollRef.current = clamp(
          virtualScrollRef.current + event.deltaY,
          0,
          VIRTUAL_SCROLL_CAP,
        )
        scheduleWaveMotion(virtualScrollRef.current)
        return
      }

      requestAnimationFrame(() => {
        const nativeTop = scrollEl.scrollTop
        if (nativeTop <= 0 && Math.abs(event.deltaY) > 0.5) {
          virtualScrollRef.current = clamp(
            virtualScrollRef.current + event.deltaY,
            0,
            maxScroll || VIRTUAL_SCROLL_CAP,
          )
          scheduleWaveMotion(Math.max(nativeTop, virtualScrollRef.current))
          return
        }
        virtualScrollRef.current = nativeTop
        scheduleWaveMotion(nativeTop)
      })
    }

    const onTouchMove = () => {
      scheduleWaveMotion(readEffectiveScroll(scrollEl))
    }

    scrollEl.addEventListener('scroll', sync, { passive: true })
    scrollEl.addEventListener('wheel', onWheel, { passive: true })
    scrollEl.addEventListener('touchmove', onTouchMove, { passive: true })

    const wheelRoot = rootRef?.current ?? scrollEl
    wheelRoot.addEventListener('wheel', onWheel, { passive: true, capture: true })
    window.addEventListener('resize', sync)

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(sync)
      : null
    ro?.observe(scrollEl)

    scrollEl.focus({ preventScroll: true })

    return () => {
      scrollEl.removeEventListener('scroll', sync)
      scrollEl.removeEventListener('wheel', onWheel)
      scrollEl.removeEventListener('touchmove', onTouchMove)
      wheelRoot.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('resize', sync)
      ro?.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [readEffectiveScroll, rootRef, scrollRef, scheduleWaveMotion])

  return scheduleWaveMotion
}
