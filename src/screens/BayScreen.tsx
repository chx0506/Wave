import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { Leaf, Play, Wind, Waves } from '@phosphor-icons/react'
import { useState } from 'react'
import styles from './BayScreen.module.css'

type Intensity = 'soft' | 'mid' | 'deep'

export function BayScreen() {
  const { setTab } = useAppState()
  const [intensity, setIntensity] = useState<Intensity>('mid')

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>静谧海湾</h1>
          <p className={styles.subtitle}>
            根据你最近的压力记录，先给自己三分钟。
          </p>
        </div>
        <button type="button" className={styles.iconBtn} aria-label="主题">
          <Leaf size={18} weight="regular" />
        </button>
      </header>

      <div className={styles.stage}>
        <img
          className={styles.scene}
          src="/textures/asset-bay-scene.png"
          alt=""
          aria-hidden="true"
        />

        <div className={styles.timerDisc}>
          <p className={styles.timer}>3:00</p>
          <p className={styles.timerHint}>呼吸 · 跟随浪</p>
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

          <button type="button" className={styles.play} aria-label="开始呼吸">
            <span className={styles.playRing} aria-hidden="true" />
            <span className={styles.playCore}>
              <Play size={20} weight="fill" />
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

      <button
        type="button"
        className={styles.tornNote}
        onClick={() => setTab(Tabs.home)}
        aria-label="记录后回来，海湾会更懂你"
      >
        <img
          className={styles.tornStrip}
          src={`/textures/torn-note-strip.png?v=4`}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <span className={styles.tornContent}>
          <svg
            className={styles.tornIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.5 18c0-5.5 3.2-9.8 8.2-11.2 0 5.8-2.6 10.4-8.2 11.2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M11.2 17.2c.2-4.8 2.8-8.6 7.3-10 0 5.2-2.3 9.2-7.3 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M7.6 18.1c2.4-1.2 4.6-1.8 7.4-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.tornText}>记录后回来，海湾会更懂你</span>
        </span>
      </button>
    </div>
  )
}
