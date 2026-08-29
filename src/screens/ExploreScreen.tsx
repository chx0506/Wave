import {
  EXPLORE_ARTICLES,
  EXPLORE_ISLANDS,
  EXPLORE_LOCKED_ARTICLE_IDS,
  EXPLORE_SHELLS,
  type ExploreArticle,
  type ExploreIsland,
  type ExploreObjectKind,
} from '@/data/content'
import {
  ISLAND_ART,
  ISLAND_WORLD,
  MAX_TRAIL_SEGMENTS,
  PAPER_BOAT_SRC,
  PAPER_SEA_MAP,
  WORLD_H,
  WORLD_W,
  buildSailRoute,
  dockOf,
  type SailCurve,
} from '@/data/exploreWorld'
import { Check, LockSimple, Seal, X } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './ExploreScreen.module.css'

type Boat = { x: number; y: number; angle: number }

const LAND_ZOOM = 1.48

/** Shortest-path lerp for degrees, so the bow turns instead of spinning the long way. */
function lerpAngle(from: number, to: number, t: number) {
  let delta = ((((to - from) % 360) + 540) % 360) - 180
  return from + delta * t
}

function islandPos(id: ExploreIsland['id']) {
  return ISLAND_WORLD[id]
}

/** Fit map width to the viewport; when landed, center the island in the free frame. */
function cameraFor(
  boat: Boat,
  vw: number,
  vh: number,
  landedId: ExploreIsland['id'] | null,
) {
  const baseScale = vw > 0 ? vw / WORLD_W : 1
  const zoom = landedId ? LAND_ZOOM : 1
  const scale = baseScale * zoom
  const scaledH = WORLD_H * scale
  const scaledW = WORLD_W * scale

  const focus = landedId
    ? {
        x: ISLAND_WORLD[landedId].x,
        // Bias slightly upward so art (not the dock) sits in the optical center.
        y: ISLAND_WORLD[landedId].y - 28,
      }
    : { x: boat.x, y: boat.y }

  const topPad = landedId ? Math.min(72, vh * 0.1) : Math.min(110, vh * 0.16)
  /** Reserve room for land bar + floating tab bar when inspecting. */
  const bottomPad = landedId ? Math.min(168, vh * 0.28) : Math.min(96, vh * 0.14)
  const focusY = landedId
    ? topPad + (vh - topPad - bottomPad) * 0.46
    : Math.min(vh * 0.55, vh / 2 + topPad * 0.28)
  const focusX = vw / 2

  let x = focusX - focus.x * scale
  let y = focusY - focus.y * scale
  const minX = Math.min(0, vw - scaledW)
  const minY = Math.min(0, vh - scaledH)
  x = Math.min(0, Math.max(minX, x))
  y = Math.min(0, Math.max(minY, y))

  return { scale, x, y }
}

export function ExploreScreen() {
  const current = EXPLORE_ISLANDS.find((island) => island.current) ?? EXPLORE_ISLANDS[0]
  const startDock = dockOf(current.id)
  const viewportRef = useRef<HTMLDivElement>(null)
  const boatRef = useRef<Boat>({ x: startDock.x, y: startDock.y, angle: 90 })
  const homeRef = useRef<ExploreIsland['id']>(current.id)
  const sailingRef = useRef(false)
  const rafRef = useRef(0)

  const [boat, setBoat] = useState<Boat>(boatRef.current)
  const [sailing, setSailing] = useState(false)
  const [homeId, setHomeId] = useState<ExploreIsland['id']>(current.id)
  const [landedId, setLandedId] = useState<ExploreIsland['id'] | null>(null)
  const [visited, setVisited] = useState<string[]>([current.id])
  const [hintVisible, setHintVisible] = useState(true)
  const [article, setArticle] = useState<ExploreArticle | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [unlockedArticles, setUnlockedArticles] = useState<string[]>([])
  const [size, setSize] = useState({ w: 320, h: 640 })
  const [trailDone, setTrailDone] = useState<string[]>([])
  const [activeTrail, setActiveTrail] = useState<{ d: string; length: number; progress: number } | null>(
    null,
  )
  const [shellInfoOpen, setShellInfoOpen] = useState(false)
  const shellCount = EXPLORE_SHELLS + completed.length * 2

  const applyBoat = (next: Boat) => {
    boatRef.current = next
    setBoat(next)
  }

  const cancelSail = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    sailingRef.current = false
    setSailing(false)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const measure = () => setSize({ w: viewport.clientWidth, h: viewport.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => {
      observer.disconnect()
      cancelSail()
    }
  }, [])

  useEffect(() => {
    if (!hintVisible) return
    const timer = window.setTimeout(() => setHintVisible(false), 5200)
    return () => window.clearTimeout(timer)
  }, [hintVisible])

  const arrive = (island: ExploreIsland) => {
    homeRef.current = island.id
    setHomeId(island.id)
    setLandedId(island.id)
    setVisited((items) => (items.includes(island.id) ? items : [...items, island.id]))
    // Stay on the zoomed island for interaction — articles open via map objects.
  }

  const sailToward = (island: ExploreIsland) => {
    if (island.locked || sailingRef.current) return
    if (island.id === homeRef.current && landedId === island.id) return

    setHintVisible(false)
    setArticle(null)
    setLandedId(null)

    if (island.id === homeRef.current) {
      arrive(island)
      return
    }

    const from = { x: boatRef.current.x, y: boatRef.current.y }
    const to = dockOf(island.id)
    const curve: SailCurve = buildSailRoute(from, to, homeRef.current, island.id)
    const duration = Math.min(3400, Math.max(1100, curve.length * 2.35))
    const t0 = performance.now()

    sailingRef.current = true
    setSailing(true)
    setActiveTrail({ d: curve.d, length: curve.length, progress: 0 })

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const ease = 1 - (1 - t) ** 3
      const point = curve.pointAt(ease)
      // Look slightly ahead so the bow leads into bends.
      const look = curve.pointAt(Math.min(1, ease + 0.02))
      const heading = (Math.atan2(look.y - point.y, look.x - point.x) * 180) / Math.PI
      const angle = Number.isFinite(heading)
        ? lerpAngle(boatRef.current.angle, heading, 0.35)
        : point.angle
      applyBoat({ x: point.x, y: point.y, angle })
      setActiveTrail({ d: curve.d, length: curve.length, progress: ease })

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
        return
      }

      sailingRef.current = false
      setSailing(false)
      setTrailDone((items) => [...items, curve.d].slice(-MAX_TRAIL_SEGMENTS))
      setActiveTrail(null)
      // Settle facing the dock approach.
      applyBoat({ x: point.x, y: point.y, angle: point.angle })
      arrive(island)
    }

    rafRef.current = requestAnimationFrame(step)
  }

  const leaveIsland = () => {
    setLandedId(null)
    setArticle(null)
  }

  const camera = cameraFor(boat, size.w, size.h, landedId)
  const landed = EXPLORE_ISLANDS.find((island) => island.id === landedId) ?? null
  const activeArticles = landed
    ? EXPLORE_ARTICLES.filter((item) => item.islandId === landed.id)
    : []
  const articleLocked = article
    ? EXPLORE_LOCKED_ARTICLE_IDS.has(article.id) && !unlockedArticles.includes(article.id)
    : false

  const parallaxX = (boat.x / WORLD_W - 0.5) * 18
  const parallaxY = (boat.y / WORLD_H - 0.5) * 14

  return (
    <div className={styles.sea} data-inspecting={Boolean(landedId)}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        data-sailing={sailing}
        data-landed={Boolean(landedId)}
        aria-label="纸浮雕海图，点选岛屿让小纸船驶去"
      >
        <div
          className={styles.world}
          data-zoomed={Boolean(landedId)}
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <div className={styles.seaBase} style={{ backgroundImage: `url(${PAPER_SEA_MAP})` }} />
          <div
            className={styles.seaLayer}
            data-depth="far"
            style={{ transform: `translate3d(${parallaxX * 0.35}px, ${parallaxY * 0.35}px, 0)` }}
            aria-hidden="true"
          >
            <PaperWaveStrip />
          </div>
          <div
            className={styles.seaLayer}
            data-depth="mid"
            style={{ transform: `translate3d(${parallaxX * 0.7}px, ${parallaxY * 0.7}px, 0)` }}
            aria-hidden="true"
          >
            <PaperWaveStrip variant="mid" />
          </div>
          <div className={styles.seaFoam} aria-hidden="true" />

          <svg
            className={styles.trailSvg}
            viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
            width={WORLD_W}
            height={WORLD_H}
            aria-hidden="true"
          >
            <defs>
              {activeTrail ? (
                <mask id="sail-trail-mask">
                  <path
                    d={activeTrail.d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={activeTrail.length}
                    strokeDashoffset={activeTrail.length * (1 - activeTrail.progress)}
                  />
                </mask>
              ) : null}
            </defs>
            {trailDone.map((d, index) => (
              <path key={`${index}-${d.slice(0, 24)}`} className={styles.trailPath} d={d} />
            ))}
            {activeTrail ? (
              <path className={styles.trailPath} d={activeTrail.d} mask="url(#sail-trail-mask)" />
            ) : null}
          </svg>

          {EXPLORE_ISLANDS.map((island) => {
            const pos = islandPos(island.id)
            const articles = EXPLORE_ARTICLES.filter((item) => item.islandId === island.id)
            const isLanded = island.id === landedId
            const isHome = island.id === homeId && !sailing
            const displayScale = isLanded ? pos.scale * 1.14 : pos.scale
            return (
              <IslandSprite
                key={island.id}
                island={island}
                x={pos.x}
                y={pos.y}
                scale={displayScale}
                landed={isLanded}
                active={isLanded || isHome}
                visited={visited.includes(island.id)}
                dimmed={Boolean(landedId) && !isLanded}
                articles={articles}
                completed={completed}
                sailing={sailing}
                onSelect={() => sailToward(island)}
                onOpenArticle={(item) => setArticle(item)}
              />
            )
          })}

          <div
            className={styles.seaLayer}
            data-depth="near"
            style={{ transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)` }}
            aria-hidden="true"
          >
            <PaperWaveStrip variant="near" />
          </div>

          <div
            className={styles.boatWorld}
            data-sailing={sailing}
            data-hidden={Boolean(landedId)}
            style={{
              left: boat.x,
              top: boat.y,
              transform: `translate(-50%, -50%) rotate(${boat.angle - 90}deg)`,
            }}
          >
            <span className={styles.boatRipple} />
            <img className={styles.boatImg} src={PAPER_BOAT_SRC} alt="" draggable={false} />
          </div>
        </div>

        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.paperGrain} aria-hidden="true" />
      </div>

      {hintVisible && !landedId ? (
        <p className={styles.hint} aria-live="polite">
          点选一座岛 · 小纸船会绕岛驶去
        </p>
      ) : null}

      <div className={styles.hudTop}>
        <div className={styles.questChip} aria-label={`已探索 ${visited.length}/${EXPLORE_ISLANDS.length} 座岛`}>
          <span className={styles.questDot} />
          <em>
            {visited.length}/{EXPLORE_ISLANDS.length} 岛
          </em>
        </div>
        <button
          type="button"
          className={styles.shellChip}
          aria-label={`贝壳 ${shellCount}`}
          onClick={() => setShellInfoOpen(true)}
        >
          <Seal size={13} weight="fill" />
          <span>{shellCount}</span>
        </button>
      </div>

      {landed ? (
        <div className={styles.landBar}>
          <div className={styles.landCopy}>
            <strong>{landed.title}</strong>
            <p>{landed.blurb}</p>
            <span>
              点岛上的物件探索 ·{' '}
              {activeArticles.filter((item) => completed.includes(item.id)).length}/
              {activeArticles.length}
            </span>
          </div>
          <button type="button" className={styles.sailOff} onClick={leaveIsland}>
            离开岛屿
          </button>
        </div>
      ) : null}

      {shellInfoOpen ? (
        <ShellInfoSheet shells={shellCount} onClose={() => setShellInfoOpen(false)} />
      ) : null}

      {article ? (
        <ArticleSheet
          article={article}
          completed={completed.includes(article.id)}
          locked={articleLocked}
          onClose={() => setArticle(null)}
          onComplete={() => {
            if (articleLocked) {
              setUnlockedArticles((items) =>
                items.includes(article.id) ? items : [...items, article.id],
              )
              return
            }
            setCompleted((items) =>
              items.includes(article.id) ? items : [...items, article.id],
            )
            setArticle(null)
          }}
        />
      ) : null}
    </div>
  )
}

function PaperWaveStrip({ variant = 'far' }: { variant?: 'far' | 'mid' | 'near' }) {
  return (
    <svg className={styles.waveSvg} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} preserveAspectRatio="none" aria-hidden="true">
      {variant === 'far' ? (
        <>
          <path d="M0 180 Q120 150 260 190 T520 170 T780 200 V0 H0Z" fill="rgba(255,255,255,.22)" />
          <path d="M0 520 Q160 480 320 530 T640 500 T780 540 V420 Q560 450 300 430 T0 450Z" fill="rgba(190,220,240,.28)" />
          <path d="M0 900 Q140 860 300 920 T600 890 T780 930 V780 Q520 810 260 790 T0 800Z" fill="rgba(255,255,255,.18)" />
        </>
      ) : null}
      {variant === 'mid' ? (
        <>
          <path d="M0 300 Q110 270 240 310 T480 290 T780 320 V250 Q520 270 260 255 T0 270Z" fill="rgba(255,252,245,.35)" />
          <path d="M0 700 Q160 660 320 720 T640 690 T780 730 V620 Q520 650 260 630 T0 640Z" fill="rgba(170,208,232,.26)" />
          <path d="M0 1100 Q140 1060 300 1120 T600 1090 T780 1130 V1020 Q520 1050 260 1030 T0 1040Z" fill="rgba(255,255,255,.2)" />
        </>
      ) : null}
      {variant === 'near' ? (
        <>
          <path d="M0 120 Q90 95 180 125 T360 110 T540 130 T720 115 T780 128 V80 Q520 95 260 85 T0 90Z" fill="rgba(255,255,255,.16)" />
          <path d="M0 1760 Q120 1720 260 1780 T520 1750 T780 1790 V1680 Q520 1710 260 1690 T0 1700Z" fill="rgba(186,216,236,.22)" />
        </>
      ) : null}
    </svg>
  )
}

function IslandSprite({
  island,
  x,
  y,
  scale,
  landed,
  active,
  visited,
  dimmed,
  articles,
  completed,
  sailing,
  onSelect,
  onOpenArticle,
}: {
  island: ExploreIsland
  x: number
  y: number
  scale: number
  landed: boolean
  active: boolean
  visited: boolean
  dimmed: boolean
  articles: ExploreArticle[]
  completed: string[]
  sailing: boolean
  onSelect: () => void
  onOpenArticle: (article: ExploreArticle) => void
}) {
  const done = articles.filter((item) => completed.includes(item.id)).length
  const allDone = done === articles.length && articles.length > 0
  const art = ISLAND_ART[island.id]

  return (
    <div
      className={styles.island}
      style={{ left: x, top: y, '--island-scale': scale } as CSSProperties}
      data-landed={landed}
      data-active={active}
      data-visited={visited}
      data-dimmed={dimmed}
    >
      {!visited && !island.locked ? <span className={styles.questMark}>!</span> : null}
      {active ? <span className={styles.islandGlow} aria-hidden="true" /> : null}

      <button
        type="button"
        className={styles.islandBtn}
        data-locked={island.locked}
        data-visited={visited}
        disabled={sailing || island.locked}
        onClick={onSelect}
        aria-label={`${island.title}，${island.locked ? '尚未解锁' : visited ? '已发现' : '未探索'}`}
        aria-pressed={landed}
      >
        <img className={styles.islandArt} src={art} alt="" draggable={false} />
        <span className={styles.nodeLabel}>
          <em className={styles.nodeLabelMark} aria-hidden="true" />
          {island.short}
        </span>
        {island.locked ? (
          <span className={styles.lockBadge}>
            <LockSimple size={10} weight="bold" />
          </span>
        ) : allDone ? (
          <span className={styles.doneBadge}>
            <Check size={10} weight="bold" />
          </span>
        ) : (
          <span className={styles.shellBadge}>
            <Seal size={9} weight="fill" />
            {island.stars}
          </span>
        )}
      </button>

      {landed && !island.locked
        ? articles.map((item, index) => {
            const angle = (-40 + index * 40) * (Math.PI / 180)
            const radius = 128
            return (
              <button
                type="button"
                key={item.id}
                className={styles.mapObject}
                data-locked={EXPLORE_LOCKED_ARTICLE_IDS.has(item.id)}
                data-completed={completed.includes(item.id)}
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius + 28}px)`,
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenArticle(item)
                }}
                aria-label={`${item.objectLabel}：${item.title}`}
              >
                <span className={styles.objectGlow} aria-hidden="true" />
                <ObjectGlyph kind={item.objectKind} />
                <span className={styles.objectLabel}>{item.objectLabel}</span>
                {completed.includes(item.id) ? (
                  <span className={styles.paperMark}>✦</span>
                ) : EXPLORE_LOCKED_ARTICLE_IDS.has(item.id) ? (
                  <span className={styles.articleLockMark}>
                    <LockSimple size={7} weight="bold" />
                  </span>
                ) : null}
              </button>
            )
          })
        : null}
    </div>
  )
}

function ObjectGlyph({ kind }: { kind: ExploreObjectKind }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <ellipse cx="16" cy="27" rx="11" ry="3" fill="rgba(62,92,112,.18)" />
      {kind === 'tree' || kind === 'coconut' ? (
        <>
          <path d="M16 25V12" stroke="#856a48" strokeWidth="3" />
          <circle cx="12" cy="10" r="6" fill="#72ad78" />
          <circle cx="20" cy="9" r="6" fill="#86bf82" />
        </>
      ) : null}
      {kind === 'moon' ? (
        <path d="M21 5a9 9 0 1 0 5 15A10 10 0 0 1 21 5Z" fill="#f8edb7" stroke="#7c91b5" />
      ) : null}
      {kind === 'mushroom' ? (
        <>
          <path d="M9 15c0-6 14-6 14 0Z" fill="#d86f69" />
          <rect x="13" y="15" width="6" height="10" rx="2" fill="#f5e5c9" />
        </>
      ) : null}
      {kind === 'lighthouse' ? (
        <>
          <path d="m12 25 2-15h5l2 15Z" fill="#f3f5f4" />
          <path d="M13 18h7" stroke="#d66e64" strokeWidth="3" />
          <path d="M12 10h9l-2-4h-5Z" fill="#6e8fa8" />
        </>
      ) : null}
      {kind === 'tea' ? (
        <>
          <path d="M8 12h14v11H8Z" fill="#e0a66f" />
          <path d="M22 15h3v5h-3" fill="none" stroke="#9b704e" strokeWidth="2" />
          <path d="M11 9c0-2 2-2 2-4M17 9c0-2 2-2 2-4" fill="none" stroke="#fff" />
        </>
      ) : null}
      {kind === 'book' ? (
        <>
          <path d="M6 9c5-2 8 1 10 3v14c-2-2-5-4-10-2Z" fill="#f4eee2" stroke="#6d91a8" />
          <path d="M26 9c-5-2-8 1-10 3v14c2-2 5-4 10-2Z" fill="#fff8e9" stroke="#6d91a8" />
        </>
      ) : null}
      {kind === 'flower' ? (
        <>
          <g fill="#d58bb2">
            <circle cx="16" cy="7" r="5" />
            <circle cx="23" cy="14" r="5" />
            <circle cx="16" cy="21" r="5" />
            <circle cx="9" cy="14" r="5" />
          </g>
          <circle cx="16" cy="14" r="3" fill="#f1c668" />
        </>
      ) : null}
      {kind === 'crystal' ? (
        <path d="m16 4 8 9-6 13h-7L8 14Z" fill="#9e8bd5" stroke="#fff" strokeLinejoin="round" />
      ) : null}
      {kind === 'shell' ? (
        <>
          <path d="M7 23c0-10 4-17 9-17s9 7 9 17c-6 4-12 4-18 0Z" fill="#f4c5a5" stroke="#b47d73" />
          <path d="M16 7v18M10 11l3 14M22 11l-3 14" stroke="#fff" opacity=".7" />
        </>
      ) : null}
      {kind === 'camp' || kind === 'tent' ? (
        <>
          <path d="m5 25 11-18 11 18Z" fill="#d98b65" />
          <path d="m16 7 2 18h-5Z" fill="#f0c495" />
        </>
      ) : null}
    </svg>
  )
}

function ArticleSheet({
  article,
  completed,
  locked,
  onClose,
  onComplete,
}: {
  article: ExploreArticle
  completed: boolean
  locked: boolean
  onClose: () => void
  onComplete: () => void
}) {
  return (
    <div className={styles.sheetBackdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.sheetHandle} aria-hidden="true" />
        <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="关闭内容">
          <X size={18} />
        </button>
        <p className={styles.sheetKicker}>
          {article.eyebrow} · {article.readTime}
        </p>
        <h2 id="article-title" className={styles.sheetTitle}>
          {article.title}
        </h2>
        <p className={styles.sheetLead}>
          {locked
            ? '这篇科普文章是岛上的特别藏品，解锁后即可阅读完整内容。'
            : article.lead}
        </p>
        <div className={styles.articleBody}>
          {locked ? (
            <div className={styles.articleLocked}>
              <LockSimple size={22} />
              <strong>特别文章，尚未解锁</strong>
              <span>岛屿可以自由探索，部分知识物件需要额外解锁。</span>
            </div>
          ) : (
            <>
              {article.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className={styles.articleTakeaway}>{article.takeaway}</p>
            </>
          )}
        </div>
        <button
          type="button"
          className={styles.sheetCta}
          onClick={onComplete}
          disabled={!locked && completed}
        >
          {locked ? (
            '解锁这篇文章'
          ) : completed ? (
            <>
              <Check size={17} weight="bold" /> 已完成
            </>
          ) : (
            '完成阅读，留下探索标记'
          )}
        </button>
      </section>
    </div>
  )
}

function ShellInfoSheet({
  shells,
  onClose,
}: {
  shells: number
  onClose: () => void
}) {
  return (
    <div className={styles.sheetBackdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shell-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.sheetHandle} aria-hidden="true" />
        <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>
        <p className={styles.sheetKicker}>贝壳积分体系</p>
        <h2 id="shell-title" className={styles.sheetTitle}>
          贝壳
        </h2>
        <p className={styles.sheetLead}>
          让每一次照顾自己都留下回响。当前拥有 {shells} 枚贝壳。
        </p>
        <div className={styles.articleBody}>
          <p>
            <strong>如何获得</strong>
            <br />
            每日记录、连续打卡、完成身体小实验、完成正念、探索健康知识，以及充值 VIP。
          </p>
          <p>
            <strong>可以做什么</strong>
            <br />
            解锁部分进阶健康内容、静谧海湾主题、Crab 与主页装扮，也可兑换合作女性品牌的小礼品或权益。
          </p>
          <p className={styles.articleTakeaway}>
            贝壳不是机械打卡的分数，而是对自己关注、记录、理解与照顾的回响——时间越久，你的海湾、图鉴、Crab
            与身体档案会越丰富。
          </p>
        </div>
        <button type="button" className={styles.sheetCta} onClick={onClose}>
          知道了
        </button>
      </section>
    </div>
  )
}
