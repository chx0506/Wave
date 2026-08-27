import {
  EXPLORE_ISLANDS,
  EXPLORE_STARS,
  type ExploreIsland,
} from '@/data/content'
import { USER_DISPLAY_NAME } from '@/domain/copy'
import { BookOpen, Check, LockSimple, Star, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import shell from './shared/pageShell.module.css'
import styles from './ExploreScreen.module.css'

/** Soft path through the archipelago (percent coords). */
const PATH = [
  [18, 62],
  [28, 28],
  [42, 48],
  [58, 18],
  [78, 38],
  [72, 68],
  [48, 78],
  [12, 42],
]

const FILTERS = [
  ['all', '全部'], ['cycle', '周期'], ['pms', 'PMS'], ['sleep', '睡眠'],
  ['mood', '情绪'], ['pain', '疼痛'], ['move', '运动'], ['food', '饮食'], ['health', '健康'],
] as const

export function ExploreScreen() {
  const current = EXPLORE_ISLANDS.find((i) => i.current) ?? EXPLORE_ISLANDS[0]
  const [selectedId, setSelectedId] = useState<string>(current.id)
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>('all')
  const [lockMessage, setLockMessage] = useState(false)
  const [reading, setReading] = useState<ExploreIsland | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const visibleIslands = useMemo(
    () => filter === 'all' ? EXPLORE_ISLANDS : EXPLORE_ISLANDS.filter((island) => island.category === filter),
    [filter],
  )
  const selected =
    visibleIslands.find((i) => i.id === selectedId) ?? visibleIslands[0] ?? current
  const unlocked = EXPLORE_ISLANDS.filter((i) => !i.locked).length
  const earnedStars = completed.length

  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>Explore</p>
        <h1 className={shell.title}>海岛探秘</h1>
        <p className={shell.subtitle}>
          把科普变成一场持续探索。阅读、记录、点亮星星，解锁下一座岛。
        </p>
      </header>

      <div className={`${shell.body} ${styles.body}`}>
        <div className={styles.hud}>
          <div className={styles.player}>
            <span className={styles.avatar} aria-hidden="true">
              {USER_DISPLAY_NAME.slice(0, 1)}
            </span>
            <div>
              <p className={styles.playerName}>{USER_DISPLAY_NAME}</p>
              <p className={styles.playerMeta}>正在探索 · {current.short}</p>
            </div>
          </div>
          <div className={styles.starsHud}>
            <Star size={14} weight="fill" />
            <span>{EXPLORE_STARS + earnedStars}</span>
            <em>{unlocked}/{EXPLORE_ISLANDS.length} 岛</em>
          </div>
        </div>

        <div className={styles.filters} aria-label="知识主题筛选">
          {FILTERS.map(([id, label]) => (
            <button key={id} type="button" className={styles.filter} data-active={filter === id}
              onClick={() => { setFilter(id); setLockMessage(false) }}>
              {label}
            </button>
          ))}
        </div>

        <section className={styles.mapCard} aria-label="知识地图">
          <div className={styles.ocean}>
            <svg className={styles.oceanSvg} viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c5e6f7" />
                  <stop offset="55%" stopColor="#9fd0ef" />
                  <stop offset="100%" stopColor="#7eb8e8" />
                </linearGradient>
                <pattern id="ripples" width="12" height="8" patternUnits="userSpaceOnUse">
                  <path
                    d="M1 4 Q3 2.5 5 4 T9 4"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="0.4"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#sea)" rx="8" />
              <rect width="100" height="100" fill="url(#ripples)" opacity="0.7" />
              {/* soft clouds */}
              <ellipse cx="8" cy="10" rx="10" ry="5" fill="rgba(255,255,255,0.55)" />
              <ellipse cx="92" cy="14" rx="9" ry="4.5" fill="rgba(255,255,255,0.5)" />
              <ellipse cx="88" cy="90" rx="11" ry="5" fill="rgba(255,255,255,0.4)" />
              <ellipse cx="12" cy="88" rx="9" ry="4" fill="rgba(255,255,255,0.35)" />

              {/* dashed exploration path */}
              <polyline
                points={PATH.map(([x, y]) => `${x},${y}`).join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="0.7"
                strokeDasharray="1.4 1.2"
                strokeLinecap="round"
              />
            </svg>

            {visibleIslands.map((island) => (
              <IslandNode
                key={island.id}
                island={island}
                active={island.id === selected.id}
                onSelect={() => { setSelectedId(island.id); setLockMessage(false) }}
              />
            ))}
          </div>
        </section>

        <article className={`${shell.card} ${styles.detail}`} data-locked={selected.locked}>
          <div className={styles.detailTop}>
            <div>
              <p className={styles.detailKicker}>
                {selected.locked ? '尚未解锁' : selected.current ? '当前岛屿' : '知识岛屿'}
              </p>
              <h2 className={styles.detailTitle}>{selected.title}</h2>
            </div>
            <div className={styles.starRow} aria-label={`星星 ${selected.stars}/${selected.starsMax}`}>
              {Array.from({ length: selected.starsMax }, (_, i) => (
                <Star
                  key={i}
                  size={16}
                  weight={i < selected.stars ? 'fill' : 'regular'}
                  className={i < selected.stars ? styles.starOn : styles.starOff}
                />
              ))}
            </div>
          </div>
          <p className={styles.detailBlurb}>{selected.blurb}</p>
          <div className={styles.detailActions}>
            {selected.locked ? (
              <button type="button" className={styles.unlockBtn} onClick={() => setLockMessage(true)}>
                <LockSimple size={14} weight="bold" />
                用星星或贝壳解锁
              </button>
            ) : (
              <>
                <button type="button" className={styles.primaryBtn} onClick={() => setReading(selected)}>
                  继续探索
                </button>
                <button type="button" className={styles.ghostBtn} onClick={() => setReading(selected)}>
                  <BookOpen size={14} weight="bold" />
                  阅读科普
                </button>
              </>
            )}
          </div>
          {lockMessage ? <p className={styles.lockMessage}>完成前置岛屿并收集更多星星后，就可以来这里继续探索。</p> : null}
          <p className={styles.hint}>
            通过阅读、记录与完成小观察获得星星，点亮下一座岛。
          </p>
        </article>
      </div>
      {reading ? (
        <ArticleSheet
          island={reading}
          completed={completed.includes(reading.id)}
          onClose={() => setReading(null)}
          onComplete={() => {
            setCompleted((items) => items.includes(reading.id) ? items : [...items, reading.id])
            setReading(null)
          }}
        />
      ) : null}
    </div>
  )
}

function ArticleSheet({
  island,
  completed,
  onClose,
  onComplete,
}: {
  island: ExploreIsland
  completed: boolean
  onClose: () => void
  onComplete: () => void
}) {
  return (
    <div className={styles.sheetBackdrop} role="presentation" onMouseDown={onClose}>
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="article-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.sheetHandle} aria-hidden="true" />
        <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="关闭文章">
          <X size={18} />
        </button>
        <p className={styles.detailKicker}>知识岛屿 · 约 3 分钟</p>
        <h2 id="article-title" className={styles.sheetTitle}>{island.title}</h2>
        <p className={styles.sheetLead}>{island.blurb}</p>
        <div className={styles.articleBody}>
          <p>身体的变化并不总是突然发生，它常常像潮汐一样，有自己的节奏。先认识规律，再回到今天的感受。</p>
          <p>你可以从一个小问题开始记录：它什么时候出现？最近是否反复？什么样的休息、饮食或活动让你感觉好一点？</p>
          <p>这里的内容不是诊断，而是一张温柔的观察地图。每一次阅读和记录，都会成为下一次理解自己的线索。</p>
        </div>
        <button type="button" className={styles.cta} onClick={onComplete} disabled={completed}>
          {completed ? <><Check size={17} weight="bold" /> 已完成阅读</> : '完成阅读，点亮一颗星'}
        </button>
      </section>
    </div>
  )
}

function IslandNode({
  island,
  active,
  onSelect,
}: {
  island: ExploreIsland
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={styles.node}
      data-tone={island.tone}
      data-locked={island.locked}
      data-active={active}
      data-current={island.current}
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
      onClick={onSelect}
      aria-label={island.title}
      aria-pressed={active}
    >
      <span className={styles.land} aria-hidden="true">
        <IslandGlyph tone={island.tone} locked={island.locked} />
      </span>
      <span className={styles.nodeLabel}>{island.short}</span>
      {island.locked ? (
        <span className={styles.lockBadge}>
          <LockSimple size={10} weight="bold" />
        </span>
      ) : (
        <span className={styles.starBadge}>
          <Star size={9} weight="fill" />
          {island.stars}
        </span>
      )}
      {island.current ? <span className={styles.youAreHere}>你在这里</span> : null}
    </button>
  )
}

function IslandGlyph({
  tone,
  locked,
}: {
  tone: ExploreIsland['tone']
  locked: boolean
}) {
  const opacity = locked ? 0.45 : 1
  return (
    <svg viewBox="0 0 64 48" width="64" height="48" aria-hidden="true" style={{ opacity }}>
      <ellipse cx="32" cy="40" rx="26" ry="6" fill="rgba(60,110,150,0.18)" />
      {tone === 'meadow' ? (
        <>
          <ellipse cx="32" cy="30" rx="24" ry="12" fill="#9fd0a8" />
          <ellipse cx="32" cy="28" rx="18" ry="8" fill="#b7e0bc" />
          <circle cx="22" cy="24" r="5" fill="#6aaa78" />
          <circle cx="38" cy="22" r="6" fill="#5f9f6d" />
          <rect x="28" y="24" width="7" height="8" rx="1" fill="#e8f4ef" />
        </>
      ) : null}
      {tone === 'autumn' ? (
        <>
          <ellipse cx="32" cy="30" rx="23" ry="11" fill="#e2b57a" />
          <ellipse cx="32" cy="28" rx="16" ry="7" fill="#efc892" />
          <circle cx="24" cy="23" r="5" fill="#d9784a" />
          <circle cx="40" cy="22" r="6" fill="#e08a4f" />
          <path d="M30 28 L34 18 L38 28 Z" fill="#c9a06a" />
        </>
      ) : null}
      {tone === 'frost' ? (
        <>
          <ellipse cx="32" cy="30" rx="23" ry="11" fill="#d7e8f4" />
          <ellipse cx="32" cy="27" rx="15" ry="7" fill="#eef6fb" />
          <circle cx="24" cy="24" r="5" fill="#b7d0e2" />
          <circle cx="40" cy="22" r="6" fill="#a8c4d8" />
          <rect x="29" y="25" width="8" height="7" rx="1" fill="#f7fbff" />
        </>
      ) : null}
      {tone === 'magic' ? (
        <>
          <ellipse cx="32" cy="30" rx="23" ry="11" fill="#c9b6e8" />
          <ellipse cx="32" cy="28" rx="15" ry="7" fill="#ddd0f4" />
          <circle cx="22" cy="26" r="4" fill="#9b7fd0" />
          <path d="M36 30 L40 16 L44 30 Z" fill="#8f6fc4" />
          <circle cx="40" cy="15" r="2.5" fill="#f0e9ff" />
        </>
      ) : null}
      {tone === 'rock' ? (
        <>
          <ellipse cx="32" cy="31" rx="22" ry="10" fill="#b7c0cc" />
          <path d="M18 30 L26 16 L34 30 Z" fill="#8e99a8" />
          <path d="M30 30 L38 14 L48 30 Z" fill="#7d8898" />
          <rect x="35" y="18" width="3" height="6" fill="#d7dee6" />
        </>
      ) : null}
      {tone === 'tropic' ? (
        <>
          <ellipse cx="32" cy="31" rx="23" ry="10" fill="#e8d29a" />
          <ellipse cx="32" cy="29" rx="16" ry="7" fill="#f0dfa8" />
          <path d="M24 28 C24 18, 20 16, 18 14" stroke="#5f9f6d" strokeWidth="2" fill="none" />
          <path d="M40 28 C40 18, 44 16, 46 14" stroke="#5f9f6d" strokeWidth="2" fill="none" />
          <circle cx="18" cy="14" r="4" fill="#7ec88a" />
          <circle cx="46" cy="14" r="4" fill="#7ec88a" />
        </>
      ) : null}
      {tone === 'sand' ? (
        <>
          <ellipse cx="32" cy="31" rx="23" ry="10" fill="#e6c9a0" />
          <ellipse cx="32" cy="29" rx="15" ry="6" fill="#f0d9b0" />
          <rect x="26" y="24" width="12" height="8" rx="1" fill="#d2b48c" />
          <circle cx="20" cy="28" r="2" fill="#c4a574" />
          <circle cx="44" cy="27" r="2.5" fill="#c4a574" />
        </>
      ) : null}
      {tone === 'harbor' ? (
        <>
          <ellipse cx="32" cy="31" rx="23" ry="10" fill="#9ec9ea" />
          <ellipse cx="32" cy="29" rx="15" ry="7" fill="#b7d8f2" />
          <rect x="30" y="18" width="5" height="14" fill="#6aa9dc" />
          <circle cx="32.5" cy="16" r="3" fill="#f7fbff" />
          <path d="M20 30 Q32 24 44 30" fill="none" stroke="#fff" strokeWidth="1.2" />
        </>
      ) : null}
    </svg>
  )
}
