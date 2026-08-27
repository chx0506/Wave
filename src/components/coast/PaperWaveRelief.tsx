import { useEffect } from 'react'
import styles from './PaperWaveRelief.module.css'

type Props = {
  /** 0 = 退潮低位，1 = 满潮高位 */
  tide: number
  dragging?: boolean
}

/**
 * Dense paper-relief Great-Wave sequence (low → high).
 * Measured coverage fractions drive tide mapping so height rises evenly.
 */
const TIDE_FRAMES = [
  '/textures/tide-frames/tide-rise-01.png',
  '/textures/tide-frames/tide-rise-02.png',
  '/textures/tide-frames/tide-rise-03.png',
  '/textures/tide-frames/tide-rise-04.png',
  '/textures/tide-frames/tide-rise-05.png',
  '/textures/tide-frames/tide-rise-06.png',
  '/textures/tide-frames/tide-rise-07.png',
  '/textures/tide-frames/tide-rise-08.png',
  '/textures/tide-frames/tide-rise-09.png',
  '/textures/tide-frames/tide-rise-10.png',
  '/textures/tide-frames/tide-rise-11.png',
  '/textures/tide-frames/tide-rise-12.png',
  '/textures/tide-frames/tide-rise-13.png',
  '/textures/tide-frames/tide-rise-14.png',
] as const

/** Wave fill fraction per frame (optical measure). */
const COVERAGES = [
  0.218, 0.317, 0.339, 0.468, 0.483, 0.488, 0.535, 0.601, 0.67, 0.728, 0.744, 0.843, 0.867,
  0.914,
] as const

const FRAME_COUNT = TIDE_FRAMES.length
const MIN_COV = COVERAGES[0]
const MAX_COV = COVERAGES[FRAME_COUNT - 1]

let framesPrefetched = false
function prefetchFrames() {
  if (framesPrefetched || typeof Image === 'undefined') return
  framesPrefetched = true
  for (const src of TIDE_FRAMES) {
    const img = new Image()
    img.src = src
  }
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

/**
 * Map tide → continuous float index by coverage (not by frame number),
 * so visual water height rises steadily instead of jumping then stalling.
 */
function floatIndexForTide(tide: number) {
  const target = MIN_COV + clamp01(tide) * (MAX_COV - MIN_COV)
  if (target <= COVERAGES[0]) return 0
  if (target >= COVERAGES[FRAME_COUNT - 1]) return FRAME_COUNT - 1

  for (let i = 0; i < FRAME_COUNT - 1; i++) {
    const a = COVERAGES[i]
    const b = COVERAGES[i + 1]
    if (target <= b) {
      const span = Math.max(b - a, 1e-6)
      return i + (target - a) / span
    }
  }
  return FRAME_COUNT - 1
}

/**
 * Smooth tide bowl:
 * - Continuous coverage-mapped float index
 * - Soft blend only between adjacent frames
 * - Frames stay locked in place (no waterline translate that shoves waves out of the bowl)
 */
export function PaperWaveRelief({ tide, dragging = false }: Props) {
  const h = clamp01(tide)
  const floatIndex = floatIndexForTide(h)
  const i0 = Math.floor(floatIndex)
  const i1 = Math.min(FRAME_COUNT - 1, i0 + 1)
  const frac = floatIndex - i0

  useEffect(() => {
    prefetchFrames()
  }, [])

  // Tiny sub-frame lift only — never push waves down out of the bowl.
  // Negative Y = up. Cap so high-tide sculptures stay fully visible.
  const microLift = -frac * 2.4

  return (
    <div
      className={styles.stage}
      data-tide={h.toFixed(3)}
      data-frame={`${i0}+${frac.toFixed(2)}`}
      data-dragging={dragging ? '1' : '0'}
      aria-hidden="true"
    >
      <div
        className={styles.reel}
        style={{ transform: `translate3d(0, ${microLift.toFixed(2)}px, 0)` }}
      >
        {TIDE_FRAMES.map((src, i) => {
          let opacity = 0
          if (i === i0 && i === i1) opacity = 1
          else if (i === i0) opacity = 1 - frac
          else if (i === i1) opacity = frac

          return (
            <img
              key={src}
              className={styles.frame}
              src={src}
              alt=""
              draggable={false}
              style={{
                opacity,
                visibility: opacity > 0.001 ? 'visible' : 'hidden',
              }}
            />
          )
        })}
      </div>

      <div className={styles.grain} />
      <div className={styles.rim} />
    </div>
  )
}
