import { useEffect, useState, type CSSProperties } from 'react'
import styles from './WaveFlowBackdrop.module.css'
import {
  prefetchWaveFlowFrames,
  waveFlowFrameForProgress,
} from '@/data/waveFlowFrames'
import { waveBackgroundPath } from '@/data/waveBackgrounds'
import type { WaveMotion } from '@/lib/scrollScrubWave'

type Props = {
  motion: WaveMotion
}

export function WaveFlowBackdrop({ motion }: Props) {
  const [framesReady, setFramesReady] = useState(false)
  const { reveal, flow } = motion
  const frameSrc = waveFlowFrameForProgress(flow)

  const wrapStyle = {
    '--wave-reveal': String(reveal),
    '--wave-flow': String(flow),
  } as CSSProperties

  const posterStyle: CSSProperties = {
    backgroundImage: `url(${waveBackgroundPath()})`,
    opacity: framesReady ? 0 : 1,
  }

  useEffect(() => {
    prefetchWaveFlowFrames(2)
    let loaded = 0
    const mark = () => {
      loaded += 1
      if (loaded >= 2) setFramesReady(true)
    }
    const first = new Image()
    const mid = new Image()
    first.onload = mark
    first.onerror = mark
    mid.onload = mark
    mid.onerror = mark
    first.src = waveFlowFrameForProgress(0)
    mid.src = waveFlowFrameForProgress(0.5)
  }, [])

  return (
    <div
      className={styles.wrap}
      style={wrapStyle}
      data-frames-ready={framesReady ? '1' : '0'}
      aria-hidden="true"
    >
      <div className={styles.layers}>
        <div className={styles.poster} style={posterStyle} />
        <img
          className={styles.frame}
          src={frameSrc}
          alt=""
          draggable={false}
          decoding="async"
        />
      </div>
      <div className={styles.bottomFade} />
    </div>
  )
}
