import {
  OBSERVE_ACTIVE,
  OBSERVE_CLUES,
} from '@/data/content'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import {
  ArrowRight,
  Flask,
  MagnifyingGlass,
  Path,
  Seal,
} from '@phosphor-icons/react'
import shell from './shared/pageShell.module.css'
import styles from './ObserveScreen.module.css'

const STEPS = [
  { key: '问', label: '提出问题' },
  { key: '试', label: '尝试改变' },
  { key: '看', label: '持续观察' },
  { key: '比', label: '对比反馈' },
]

export function ObserveScreen() {
  const { setTab } = useAppState()
  const progress = OBSERVE_ACTIVE.day / OBSERVE_ACTIVE.total

  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>Observe</p>
        <h1 className={shell.title}>潮池观察</h1>
        <p className={shell.subtitle}>
          如果一个问题反复出现，就陪自己认真看看。发现什么可能更适合我。
        </p>
      </header>

      <div className={shell.body}>
        <section className={`${shell.card} ${styles.active}`}>
          <div className={styles.activeTop}>
            <span className={shell.pill}>
              <Flask size={12} weight="fill" />
              {OBSERVE_ACTIVE.status}
            </span>
            <span className={styles.days}>
              Day {OBSERVE_ACTIVE.day}/{OBSERVE_ACTIVE.total}
            </span>
          </div>
          <h2 className={shell.cardTitle}>{OBSERVE_ACTIVE.question}</h2>
          <p className={shell.cardMeta}>
            尝试：{OBSERVE_ACTIVE.try}
            <br />
            观察：{OBSERVE_ACTIVE.watch.join(' · ')}
          </p>
          <div className={styles.track} aria-hidden="true">
            <span className={styles.fill} style={{ width: `${progress * 100}%` }} />
          </div>
          <button type="button" className={styles.secondary}>
            记录今日观察
            <ArrowRight size={14} weight="bold" />
          </button>
        </section>

        <p className={shell.sectionLabel}>小实验流程</p>
        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step.key} className={styles.step}>
              <span className={styles.stepKey}>{step.key}</span>
              <span className={styles.stepLabel}>{step.label}</span>
              {i < STEPS.length - 1 ? <span className={styles.stepLine} /> : null}
            </div>
          ))}
        </div>

        <p className={shell.sectionLabel}>身体线索</p>
        {OBSERVE_CLUES.map((clue) => (
          <article key={clue.title} className={shell.card}>
            <div className={styles.clueRow}>
              <MagnifyingGlass size={18} weight="fill" color="var(--tide-deep)" />
              <div>
                <h3 className={shell.cardTitle}>{clue.title}</h3>
                <p className={shell.cardMeta}>{clue.note}</p>
              </div>
              <span className={styles.shells}>
                <Seal size={12} weight="fill" />
                {clue.shells}
              </span>
            </div>
          </article>
        ))}

        <button type="button" className={shell.cta}>
          <span>开始新的身体小实验</span>
          <Path size={18} weight="bold" />
        </button>

        <button
          type="button"
          className={styles.linkCal}
          onClick={() => setTab(Tabs.home)}
        >
          回到潮汐日志查看今日状态
        </button>
      </div>
    </div>
  )
}
