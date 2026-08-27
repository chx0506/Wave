import { BAY_PRACTICES, BAY_THEMES } from '@/data/content'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import {
  ArrowRight,
  MoonStars,
  Sparkle,
  Wind,
} from '@phosphor-icons/react'
import shell from './shared/pageShell.module.css'
import styles from './BayScreen.module.css'

export function BayScreen() {
  const { setTab } = useAppState()

  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <div className={styles.heroWash} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>Still Bay</p>
        <h1 className={shell.title}>静谧海湾</h1>
        <p className={shell.subtitle}>
          有时候不需要马上解决什么，只需要先回来一下。
        </p>
      </header>

      <div className={shell.body}>
        <section className={`${shell.card} ${styles.heroCard}`}>
          <div className={styles.heroIcon}>
            <Wind size={22} weight="fill" />
          </div>
          <div>
            <h2 className={shell.cardTitle}>今天推荐 · 舒缓呼吸</h2>
            <p className={shell.cardMeta}>
              根据你最近的压力记录，先给自己三分钟。
            </p>
          </div>
          <button type="button" className={styles.play}>
            开始
            <ArrowRight size={14} weight="bold" />
          </button>
        </section>

        <p className={shell.sectionLabel}>练习</p>
        <div className={styles.grid}>
          {BAY_PRACTICES.map((item) => (
            <article key={item.id} className={`${shell.card} ${styles.practice}`} data-tone={item.tone}>
              <div className={styles.practiceTop}>
                <span className={styles.mins}>{item.mins} min</span>
                <Sparkle size={14} weight="fill" />
              </div>
              <h3 className={styles.practiceTitle}>{item.title}</h3>
              <p className={styles.practiceReason}>{item.reason}</p>
            </article>
          ))}
        </div>

        <p className={shell.sectionLabel}>海湾主题</p>
        <div className={styles.themes}>
          {BAY_THEMES.map((theme) => (
            <div
              key={theme.name}
              className={styles.theme}
              data-locked={theme.locked}
            >
              <MoonStars size={16} weight={theme.locked ? 'regular' : 'fill'} />
              <span>{theme.name}</span>
              {theme.locked ? <em>贝壳解锁</em> : <em>已拥有</em>}
            </div>
          ))}
        </div>

        <button
          type="button"
          className={shell.cta}
          onClick={() => setTab(Tabs.home)}
        >
          <span>记录后回来，海湾会更懂你</span>
          <ArrowRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  )
}
