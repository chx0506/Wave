import { CrabScuttleVideo } from '@/components/coast/CrabScuttleVideo'
import { useCrabScrub } from '@/lib/useCrabScrub'
import { useInViewOnce } from '@/lib/useInViewOnce'
import type { CSSProperties } from 'react'
import styles from './CoastSceneGap.module.css'

type Variant = 'ripple' | 'crab' | 'surge'
type Size = 'regular' | 'compact' | 'spacious'

type Props = {
  variant: Variant
  size?: Size
  /** IntersectionObserver 阈值，默认 0.4 */
  revealThreshold?: number
}

const CRAB_LEFT_START = -18
const CRAB_LEFT_END = 132

function crabLeftForProgress(progress: number) {
  return CRAB_LEFT_START + progress * (CRAB_LEFT_END - CRAB_LEFT_START)
}

export function CoastSceneGap({
  variant,
  size = 'regular',
  revealThreshold = 0.4,
}: Props) {
  const { ref: revealRef, visible } = useInViewOnce<HTMLDivElement>(revealThreshold)
  const { ref: crabRef, scrub } = useCrabScrub<HTMLDivElement>()

  const setGapRef = (node: HTMLDivElement | null) => {
    revealRef.current = node
    crabRef.current = node
  }

  const crabStyle: CSSProperties | undefined =
    variant === 'crab'
      ? {
          left: `${crabLeftForProgress(scrub.progress)}%`,
          opacity: scrub.inView ? 0.92 + scrub.progress * 0.06 : 0,
          transform: `translate3d(0, -50%, 0) scaleX(${scrub.facingRight ? 1 : -1})`,
        }
      : undefined

  return (
    <div
      ref={setGapRef}
      className={styles.gap}
      data-variant={variant}
      data-size={size}
      data-active={visible ? '1' : '0'}
      aria-hidden="true"
    >
      {variant === 'ripple' ? (
        <svg className={styles.rippleSvg} viewBox="0 0 320 24" preserveAspectRatio="none">
          <path
            className={styles.rippleA}
            d="M0 14 C40 8, 80 20, 120 14 S200 8, 240 14 S300 20, 320 14"
            fill="none"
            stroke="rgba(126, 180, 220, 0.28)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            className={styles.rippleB}
            d="M0 18 C50 22, 100 12, 150 18 S250 24, 320 16"
            fill="none"
            stroke="rgba(159, 200, 232, 0.2)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {variant === 'surge' ? (
        <svg className={styles.surgeSvg} viewBox="0 0 320 32" preserveAspectRatio="none">
          <path
            className={styles.surgeCrest}
            d="M0 24 C48 10, 96 28, 144 16 C192 4, 240 26, 320 14 L320 32 L0 32 Z"
            fill="rgba(159, 200, 232, 0.14)"
          />
          <path
            className={styles.surgeLine}
            d="M0 20 C56 8, 112 24, 168 12 C224 0, 280 18, 320 10"
            fill="none"
            stroke="rgba(126, 180, 220, 0.34)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {variant === 'crab' ? (
        <div className={styles.crabTrack}>
          <CrabScuttleVideo
            className={styles.crab}
            style={crabStyle}
            active={scrub.inView}
          />
        </div>
      ) : null}
    </div>
  )
}
