import type { CSSProperties } from 'react'
import styles from './WaveFlowBackdrop.module.css'
import { waveBackgroundPath } from '@/data/waveBackgrounds'
import type { WaveMotion } from '@/lib/scrollScrubWave'

type Props = {
  motion: WaveMotion
}

/**
 * Static paper-wave backdrop.
 * Scroll-scrubbed JPEG sequences flicker on slower networks (production),
 * so local and Vercel both use the stable poster image.
 */
export function WaveFlowBackdrop({ motion }: Props) {
  const { reveal, flow } = motion

  const wrapStyle = {
    '--wave-reveal': String(reveal),
    '--wave-flow': String(flow),
  } as CSSProperties

  const posterStyle: CSSProperties = {
    backgroundImage: `url(${waveBackgroundPath()})`,
  }

  return (
    <div className={styles.wrap} style={wrapStyle} aria-hidden="true">
      <div className={styles.layers}>
        <div className={styles.poster} style={posterStyle} />
      </div>
      <div className={styles.bottomFade} />
    </div>
  )
}
