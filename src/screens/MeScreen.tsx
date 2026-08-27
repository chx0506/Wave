import { ME_PROFILE, ME_ROWS } from '@/data/content'
import {
  APP_NAME_EN,
  APP_TAGLINE,
  USER_DISPLAY_NAME,
} from '@/domain/copy'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import {
  CaretRight,
  Notebook,
  Seal,
  UserCircle,
} from '@phosphor-icons/react'
import shell from './shared/pageShell.module.css'
import styles from './MeScreen.module.css'

export function MeScreen() {
  const { setTab } = useAppState()

  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>My Tide</p>
        <h1 className={shell.title}>我的潮汐</h1>
        <p className={shell.subtitle}>
          每天留下的一点点，最后会慢慢变成关于自己的答案。
        </p>
      </header>

      <div className={shell.body}>
        <section className={`${shell.card} ${styles.profile}`}>
          <div className={styles.avatar}>
            <UserCircle size={42} weight="fill" />
          </div>
          <div className={styles.profileCopy}>
            <h2 className={styles.name}>{ME_PROFILE.name || USER_DISPLAY_NAME}</h2>
            <p className={styles.tagline}>{APP_TAGLINE}</p>
            <p className={styles.brand}>{APP_NAME_EN}</p>
          </div>
        </section>

        <div className={styles.stats}>
          <article className={styles.stat}>
            <Seal size={16} weight="fill" />
            <strong>{ME_PROFILE.shells}</strong>
            <span>贝壳</span>
          </article>
          <article className={styles.stat}>
            <strong>{ME_PROFILE.streak}</strong>
            <span>连续记录</span>
          </article>
          <article className={styles.stat}>
            <strong>{ME_PROFILE.cycleAvg}</strong>
            <span>平均周期</span>
          </article>
          <article className={styles.stat}>
            <strong>{ME_PROFILE.clues}</strong>
            <span>身体线索</span>
          </article>
        </div>

        <section className={`${shell.card} ${styles.journal}`}>
          <Notebook size={20} weight="fill" color="var(--tide-deep)" />
          <div>
            <h3 className={shell.cardTitle}>身体航海日志</h3>
            <p className={shell.cardMeta}>
              已完成 {ME_PROFILE.experiments} 次小实验 · {ME_PROFILE.clues} 条线索沉淀中
            </p>
          </div>
          <CaretRight size={16} weight="bold" />
        </section>

        <p className={shell.sectionLabel}>更多</p>
        <div className={styles.list}>
          {ME_ROWS.map((row) => (
            <button
              key={row.id}
              type="button"
              className={styles.row}
              onClick={() => {
                if (row.id === 'crab' || row.id === 'journal') setTab(Tabs.home)
                if (row.id === 'clues') setTab(Tabs.observe)
                if (row.id === 'shells') setTab(Tabs.bay)
              }}
            >
              <div>
                <p className={styles.rowTitle}>{row.title}</p>
                <p className={styles.rowDesc}>{row.desc}</p>
              </div>
              <CaretRight size={14} weight="bold" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
