import {
  CRAB_SCUTTLE_VIDEO_HEVC,
  CRAB_SCUTTLE_VIDEO_WEBM,
} from '@/data/crabAssets'
import { useEffect, useRef, type CSSProperties } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
  active?: boolean
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Looping keyed crab walk clip for the home-page scuttle track. */
export function CrabScuttleVideo({ className, style, active = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!active || prefersReducedMotion()) {
      video.pause()
      return
    }

    video.currentTime = 0
    void video.play().catch(() => {})
  }, [active])

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      <source src={CRAB_SCUTTLE_VIDEO_WEBM} type="video/webm" />
      <source src={CRAB_SCUTTLE_VIDEO_HEVC} type='video/mp4; codecs="hvc1"' />
    </video>
  )
}
