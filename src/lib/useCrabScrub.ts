import { useEffect, useRef, useState } from 'react'

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null
  while (node) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return node
    }
    node = node.parentElement
  }
  return null
}

/** Gap center at this viewport fraction → progress 0 (crab enters from left). */
const PROGRESS_START_VIEW = 0.8
/** Gap center at this viewport fraction → progress 1 (crab exits right). */
const PROGRESS_END_VIEW = 0.1

export type CrabScrub = {
  /** 0 = left edge, 1 = right edge */
  progress: number
  /** true when walking right (scroll down) */
  facingRight: boolean
  inView: boolean
}

export function useCrabScrub<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [scrub, setScrub] = useState<CrabScrub>({
    progress: 0,
    facingRight: true,
    inView: false,
  })
  const lastProgressRef = useRef(0)
  const facingRightRef = useRef(true)

  useEffect(() => {
    const gapEl = ref.current
    if (!gapEl) return

    const scrollEl = getScrollParent(gapEl)
    if (!scrollEl) return

    const update = () => {
      const gapRect = gapEl.getBoundingClientRect()
      const scrollRect = scrollEl.getBoundingClientRect()
      const viewHeight = scrollEl.clientHeight
      const gapTopInContent =
        gapRect.top - scrollRect.top + scrollEl.scrollTop
      const gapCenterInContent = gapTopInContent + gapRect.height / 2

      const scrollAtStart =
        gapCenterInContent - viewHeight * PROGRESS_START_VIEW
      const scrollAtEnd =
        gapCenterInContent - viewHeight * PROGRESS_END_VIEW
      const span = Math.max(scrollAtEnd - scrollAtStart, 1)
      const progress = clamp01((scrollEl.scrollTop - scrollAtStart) / span)

      const inView =
        gapRect.bottom > scrollRect.top + 8 &&
        gapRect.top < scrollRect.bottom - 8

      const delta = progress - lastProgressRef.current
      if (Math.abs(delta) > 0.0008) {
        facingRightRef.current = delta > 0
      }
      lastProgressRef.current = progress

      setScrub((prev) => {
        const facingRight = facingRightRef.current
        if (
          prev.progress === progress &&
          prev.inView === inView &&
          prev.facingRight === facingRight
        ) {
          return prev
        }
        return { progress, facingRight, inView }
      })
    }

    update()

    scrollEl.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(update)
        : null
    ro?.observe(gapEl)
    ro?.observe(scrollEl)

    return () => {
      scrollEl.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [])

  return { ref, scrub }
}
