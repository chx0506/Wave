import type { MindfulnessSession } from '@/data/mindfulness'
import { createOceanSound } from '@/lib/oceanSound'
import { CaretLeft, Leaf, Pause, Play, Wind, Waves } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './BayScreen.module.css'

type Intensity = 'soft' | 'mid' | 'deep'

const DEFAULT_SCENE = '/textures/asset-bay-scene.png'

type Props = {
  session: MindfulnessSession
  onBack: () => void
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function BayScreen({ session, onBack }: Props) {
  const [intensity, setIntensity] = useState<Intensity>('mid')
  const [playing, setPlaying] = useState(false)
  const totalSeconds = useMemo(() => session.durationMin * 60, [session.durationMin])
  const [remaining, setRemaining] = useState(totalSeconds)
  const oceanRef = useRef(createOceanSound())
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasVideo = Boolean(session.sceneVideo)

  const playerTitle = session.playerTitle ?? '静谧海湾'
  const playerSubtitle =
    session.playerSubtitle ??
    `根据你最近的压力记录，先给自己${session.durationMin}分钟。`

  useEffect(() => {
    setRemaining(totalSeconds)
    setPlaying(false)
    oceanRef.current.stop()
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }, [session.id, totalSeconds])

  useEffect(() => {
    if (!hasVideo) return
    oceanRef.current.stop()
  }, [hasVideo])

  useEffect(() => {
    oceanRef.current.setIntensity(intensity)
  }, [intensity])

  useEffect(() => {
    if (!playing) return undefined
    if (remaining <= 0) {
      setPlaying(false)
      oceanRef.current.stop()
      videoRef.current?.pause()
      return undefined
    }
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, remaining])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasVideo) return

    if (playing) {
      video.loop = true
      void video.play().catch(() => undefined)
      return
    }

    video.pause()
    if (remaining >= totalSeconds) {
      video.currentTime = 0
    }
  }, [playing, hasVideo, remaining, totalSeconds])

  useEffect(() => () => oceanRef.current.dispose(), [])

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      if (!hasVideo) oceanRef.current.stop()
      return
    }
    if (remaining <= 0) setRemaining(totalSeconds)
    setPlaying(true)
    if (!hasVideo) oceanRef.current.start()
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <button type="button" className={styles.backBtn} onClick={onBack} aria-label="返回">
            <CaretLeft size={18} weight="bold" />
          </button>
          <div className={styles.headerCopy}>
            <h1 className={styles.title}>{playerTitle}</h1>
            <p className={styles.subtitle}>{playerSubtitle}</p>
          </div>
        </div>
        <button type="button" className={styles.iconBtn} aria-label="主题">
          <Leaf size={18} weight="regular" />
        </button>
      </header>

      <div className={styles.stage}>
        {hasVideo ? (
          <video
            ref={videoRef}
            className={styles.scene}
            src={session.sceneVideo}
            poster={session.scenePoster}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
          />
        ) : (
          <img
            className={styles.scene}
            src={DEFAULT_SCENE}
            alt=""
            aria-hidden="true"
          />
        )}

        <div className={styles.timerDisc}>
          <p className={styles.timer}>{formatTimer(remaining)}</p>
          <p className={styles.timerHint}>{session.timerHint}</p>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.chip}
            data-active={intensity === 'soft'}
            onClick={() => setIntensity('soft')}
          >
            <Waves size={13} weight="regular" />
            轻柔
          </button>

          <button
            type="button"
            className={styles.play}
            aria-label={playing ? '暂停冥想' : '开始冥想'}
            data-playing={playing}
            onClick={togglePlay}
          >
            <span className={styles.playRing} aria-hidden="true" />
            <span className={styles.playCore}>
              {playing ? (
                <Pause size={20} weight="fill" />
              ) : (
                <Play size={20} weight="fill" />
              )}
            </span>
          </button>

          <div className={styles.chipGroup} role="group" aria-label="强度">
            <button
              type="button"
              className={styles.chipOption}
              data-active={intensity === 'mid'}
              onClick={() => setIntensity('mid')}
            >
              <Waves size={13} weight="regular" />
              中等
            </button>
            <span className={styles.chipSep} aria-hidden="true" />
            <button
              type="button"
              className={styles.chipOption}
              data-active={intensity === 'deep'}
              onClick={() => setIntensity('deep')}
            >
              <Wind size={13} weight="regular" />
              深度
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
