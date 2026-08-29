import {
  EXPLORE_ARTICLES,
  EXPLORE_ISLANDS,
  EXPLORE_LOCKED_ARTICLE_IDS,
  EXPLORE_STARS,
  type ExploreArticle,
  type ExploreIsland,
  type ExploreObjectKind,
} from '@/data/content'
import {
  ISLAND_ART,
  ISLAND_WORLD,
  PAPER_BOAT_SRC,
  PAPER_SEA_TILE,
  WORLD_H,
  WORLD_W,
} from '@/data/exploreWorld'
import { Check, LockSimple, Star, X } from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import styles from './ExploreScreen.module.css'

const NEAR_DIST = 260
const LAND_DIST = 200
const FRICTION = 0.94
const MIN_SPEED = 0.35
const DRAG_GAIN = 1.05

type Boat = { x: number; y: number; angle: number }

function clampBoat(boat: Boat): Boat {
  return {
    ...boat,
    x: Math.min(WORLD_W - 120, Math.max(120, boat.x)),
    y: Math.min(WORLD_H - 140, Math.max(140, boat.y)),
  }
}

function islandPos(id: ExploreIsland['id']) {
  return ISLAND_WORLD[id]
}

function distToIsland(boat: Boat, id: ExploreIsland['id']) {
  const p = islandPos(id)
  return Math.hypot(p.x - boat.x, p.y - boat.y)
}

function nearestIsland(boat: Boat, limit: number) {
  let best: ExploreIsland | null = null
  let bestDist = Infinity
  for (const island of EXPLORE_ISLANDS) {
    const dist = distToIsland(boat, island.id)
    if (dist < bestDist) {
      bestDist = dist
      best = island
    }
  }
  return bestDist <= limit ? best : null
}

function cameraFor(boat: Boat, vw: number, vh: number) {
  const x = vw / 2 - boat.x
  const y = vh / 2 - boat.y
  const minX = Math.min(0, vw - WORLD_W)
  const minY = Math.min(0, vh - WORLD_H)
  return {
    x: Math.min(0, Math.max(minX, x)),
    y: Math.min(0, Math.max(minY, y)),
  }
}

export function ExploreScreen() {
  const current = EXPLORE_ISLANDS.find((island) => island.current) ?? EXPLORE_ISLANDS[0]
  const start = islandPos(current.id)
  const viewportRef = useRef<HTMLDivElement>(null)
  const boatRef = useRef<Boat>({ x: start.x, y: start.y + 160, angle: -25 })
  const velocityRef = useRef({ vx: 0, vy: 0 })
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    lastX: number
    lastY: number
    lastT: number
    captured: boolean
  } | null>(null)
  const draggedRef = useRef(false)
  const sailingRef = useRef(false)
  const rafRef = useRef(0)
  const wakeIdRef = useRef(0)

  const [boat, setBoat] = useState<Boat>(boatRef.current)
  const [sailing, setSailing] = useState(false)
  const [nearId, setNearId] = useState<string | null>(null)
  const [landedId, setLandedId] = useState<string | null>(null)
  const [visited, setVisited] = useState<string[]>([current.id])
  const [hintVisible, setHintVisible] = useState(true)
  const [article, setArticle] = useState<ExploreArticle | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [unlockedArticles, setUnlockedArticles] = useState<string[]>([])
  const [wakes, setWakes] = useState<{ id: number; x: number; y: number }[]>([])
  const [size, setSize] = useState({ w: 320, h: 640 })

  const applyBoat = (next: Boat, opts?: { wake?: boolean }) => {
    const clamped = clampBoat(next)
    boatRef.current = clamped
    setBoat(clamped)
    const near = nearestIsland(clamped, NEAR_DIST)
    setNearId(near?.id ?? null)
    if (opts?.wake && sailingRef.current) {
      wakeIdRef.current += 1
      const id = wakeIdRef.current
      setWakes((items) => [...items.slice(-12), { id, x: clamped.x, y: clamped.y }])
      window.setTimeout(() => {
        setWakes((items) => items.filter((item) => item.id !== id))
      }, 1000)
    }
  }

  const stopInertia = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    velocityRef.current = { vx: 0, vy: 0 }
    sailingRef.current = false
    setSailing(false)
  }

  const runInertia = () => {
    const tick = () => {
      let { vx, vy } = velocityRef.current
      vx *= FRICTION
      vy *= FRICTION
      if (Math.hypot(vx, vy) < MIN_SPEED) {
        stopInertia()
        return
      }
      velocityRef.current = { vx, vy }
      applyBoat(
        {
          x: boatRef.current.x + vx,
          y: boatRef.current.y + vy,
          angle: (Math.atan2(vy, vx) * 180) / Math.PI,
        },
        { wake: true },
      )
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const measure = () => setSize({ w: viewport.clientWidth, h: viewport.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    setNearId(nearestIsland(boatRef.current, NEAR_DIST)?.id ?? null)
    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!hintVisible) return
    const timer = window.setTimeout(() => setHintVisible(false), 5200)
    return () => window.clearTimeout(timer)
  }, [hintVisible])

  const sailToward = (island: ExploreIsland) => {
    if (draggedRef.current || landedId) return
    stopInertia()
    setHintVisible(false)
    const target = islandPos(island.id)
    const startBoat = { ...boatRef.current }
    const goal = { x: target.x, y: target.y + 130 }
    const dx = goal.x - startBoat.x
    const dy = goal.y - startBoat.y
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI
    const duration = Math.min(1100, 320 + Math.hypot(dx, dy) * 0.35)
    const t0 = performance.now()
    sailingRef.current = true
    setSailing(true)

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const ease = 1 - (1 - t) ** 3
      applyBoat(
        {
          x: startBoat.x + dx * ease,
          y: startBoat.y + dy * ease,
          angle,
        },
        { wake: t < 0.9 && t * 20 - Math.floor(t * 20) < 0.35 },
      )
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      sailingRef.current = false
      setSailing(false)
      setNearId(island.id)
      setVisited((items) => (items.includes(island.id) ? items : [...items, island.id]))
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const landOnIsland = (island: ExploreIsland) => {
    if (island.locked || draggedRef.current) return
    setVisited((items) => (items.includes(island.id) ? items : [...items, island.id]))
    setLandedId(island.id)
    setNearId(island.id)
  }

  const leaveIsland = () => setLandedId(null)

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || landedId) return
    stopInertia()
    draggedRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: performance.now(),
      captured: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || landedId) return
    const dx = event.clientX - drag.lastX
    const dy = event.clientY - drag.lastY
    const now = performance.now()
    const dt = Math.max(8, now - drag.lastT)

    if (!drag.captured) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <= 6) return
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.captured = true
      draggedRef.current = true
      sailingRef.current = true
      setSailing(true)
      setHintVisible(false)
    }

    const moveX = -dx * DRAG_GAIN
    const moveY = -dy * DRAG_GAIN
    velocityRef.current = {
      vx: moveX * (16 / dt),
      vy: moveY * (16 / dt),
    }
    const angle =
      Math.hypot(moveX, moveY) > 0.2
        ? (Math.atan2(moveY, moveX) * 180) / Math.PI
        : boatRef.current.angle

    applyBoat(
      {
        x: boatRef.current.x + moveX,
        y: boatRef.current.y + moveY,
        angle,
      },
      { wake: Math.hypot(moveX, moveY) > 1.2 },
    )

    drag.lastX = event.clientX
    drag.lastY = event.clientY
    drag.lastT = now
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const wasDrag = dragRef.current?.captured
    dragRef.current = null
    if (wasDrag) {
      if (Math.hypot(velocityRef.current.vx, velocityRef.current.vy) > MIN_SPEED * 2) {
        runInertia()
      } else {
        sailingRef.current = false
        setSailing(false)
      }
    }
    window.setTimeout(() => {
      draggedRef.current = false
    }, 0)
  }

  const camera = cameraFor(boat, size.w, size.h)
  const near = EXPLORE_ISLANDS.find((island) => island.id === nearId) ?? null
  const landed = EXPLORE_ISLANDS.find((island) => island.id === landedId) ?? null
  const activeArticles = landed
    ? EXPLORE_ARTICLES.filter((item) => item.islandId === landed.id)
    : []
  const canLand = Boolean(near && !near.locked && !landedId && !sailing && distToIsland(boat, near.id) <= LAND_DIST)
  const articleLocked = article
    ? EXPLORE_LOCKED_ARTICLE_IDS.has(article.id) && !unlockedArticles.includes(article.id)
    : false

  const parallaxX = (boat.x / WORLD_W - 0.5) * 28
  const parallaxY = (boat.y / WORLD_H - 0.5) * 22

  return (
    <div className={styles.sea}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        data-sailing={sailing}
        data-landed={Boolean(landedId)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        aria-label="纸浮雕海面，滑动开船探索小岛"
      >
        <div
          className={styles.world}
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate3d(${camera.x}px, ${camera.y}px, 0)`,
          }}
        >
          <div className={styles.seaBase} style={{ backgroundImage: `url(${PAPER_SEA_TILE})` }} />
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

          {wakes.map((wake) => (
            <span
              key={wake.id}
              className={styles.wake}
              style={{ left: wake.x, top: wake.y }}
              aria-hidden="true"
            />
          ))}

          {EXPLORE_ISLANDS.map((island) => {
            const pos = islandPos(island.id)
            const articles = EXPLORE_ARTICLES.filter((item) => item.islandId === island.id)
            const isLanded = island.id === landedId
            const isNear = island.id === nearId && !sailing
            const done = articles.filter((item) => completed.includes(item.id)).length
            const stars = Math.min(island.stars + done, island.starsMax)
            return (
              <IslandSprite
                key={island.id}
                island={island}
                x={pos.x}
                y={pos.y}
                scale={pos.scale}
                landed={isLanded}
                active={isLanded || isNear}
                visited={visited.includes(island.id)}
                articles={articles}
                completed={completed}
                stars={stars}
                onSelect={() => sailToward(island)}
                onOpenArticle={(item) => {
                  if (draggedRef.current) return
                  setArticle(item)
                }}
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
        </div>

        <div className={styles.playerLayer}>
          <div
            className={styles.boat}
            data-sailing={sailing}
            data-hidden={Boolean(landedId)}
            style={{ transform: `translate(-50%, -50%) rotate(${boat.angle + 90}deg)` }}
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
          滑动开船 · 驶向纸浮雕小岛
        </p>
      ) : null}

      <div className={styles.hudTop}>
        <div className={styles.questChip} aria-label={`已探索 ${visited.length}/${EXPLORE_ISLANDS.length} 座岛`}>
          <span className={styles.questDot} />
          <em>
            {visited.length}/{EXPLORE_ISLANDS.length} 岛
          </em>
        </div>
        <div className={styles.starChip} aria-label={`探索星星 ${EXPLORE_STARS + completed.length}`}>
          <Star size={12} weight="fill" />
          <span>{EXPLORE_STARS + completed.length}</span>
        </div>
      </div>

      <MiniMap boat={boat} visited={visited} landedId={landedId} nearId={nearId} />

      {canLand && near ? (
        <button type="button" className={styles.landPrompt} onClick={() => landOnIsland(near)}>
          <span className={styles.landKey}>A</span>
          <span>上岸 · {near.title}</span>
        </button>
      ) : null}

      {landed ? (
        <div className={styles.landBar}>
          <div className={styles.landCopy}>
            <strong>{landed.title}</strong>
            <p>{landed.blurb}</p>
            <span>
              点岛上的物件学习 ·{' '}
              {activeArticles.filter((item) => completed.includes(item.id)).length}/
              {activeArticles.length}
            </span>
          </div>
          <button type="button" className={styles.sailOff} onClick={leaveIsland}>
            继续航行
          </button>
        </div>
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
    <svg className={styles.waveSvg} viewBox="0 0 2400 3000" preserveAspectRatio="none" aria-hidden="true">
      {variant === 'far' ? (
        <>
          <path d="M0 420 Q300 380 600 430 T1200 410 T1800 440 T2400 400 V0 H0Z" fill="rgba(255,255,255,.22)" />
          <path d="M0 980 Q400 930 800 990 T1600 960 T2400 1000 V780 Q1800 820 1200 790 T0 820Z" fill="rgba(190,220,240,.28)" />
          <path d="M0 1680 Q350 1620 700 1690 T1400 1660 T2400 1710 V1480 Q1700 1520 900 1490 T0 1510Z" fill="rgba(255,255,255,.18)" />
        </>
      ) : null}
      {variant === 'mid' ? (
        <>
          <path d="M0 620 Q280 580 560 640 T1120 610 T1680 650 T2400 600 V520 Q1800 560 1200 530 T0 550Z" fill="rgba(255,252,245,.35)" />
          <path d="M0 1320 Q420 1260 840 1340 T1680 1300 T2400 1360 V1180 Q1700 1220 900 1190 T0 1210Z" fill="rgba(170,208,232,.26)" />
          <path d="M0 2200 Q360 2140 720 2220 T1440 2180 T2400 2240 V2040 Q1600 2080 800 2050 T0 2070Z" fill="rgba(255,255,255,.2)" />
        </>
      ) : null}
      {variant === 'near' ? (
        <>
          <path d="M0 260 Q220 230 440 270 T880 250 T1320 280 T1760 255 T2400 275 V180 Q1800 210 1200 190 T0 200Z" fill="rgba(255,255,255,.16)" />
          <path d="M0 2520 Q300 2470 600 2540 T1200 2500 T1800 2550 T2400 2510 V2380 Q1700 2420 900 2390 T0 2410Z" fill="rgba(186,216,236,.22)" />
        </>
      ) : null}
    </svg>
  )
}

function MiniMap({
  boat,
  visited,
  landedId,
  nearId,
}: {
  boat: Boat
  visited: string[]
  landedId: string | null
  nearId: string | null
}) {
  return (
    <div className={styles.minimap} aria-hidden="true">
      <div className={styles.minimapSea}>
        {EXPLORE_ISLANDS.map((island) => {
          const pos = islandPos(island.id)
          return (
            <span
              key={island.id}
              className={styles.minimapIsland}
              data-visited={visited.includes(island.id)}
              data-hot={island.id === landedId || island.id === nearId}
              style={{
                left: `${(pos.x / WORLD_W) * 100}%`,
                top: `${(pos.y / WORLD_H) * 100}%`,
              }}
            />
          )
        })}
        <span
          className={styles.minimapBoat}
          style={{
            left: `${(boat.x / WORLD_W) * 100}%`,
            top: `${(boat.y / WORLD_H) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${boat.angle + 90}deg)`,
          }}
        />
      </div>
    </div>
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
  articles,
  completed,
  stars,
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
  articles: ExploreArticle[]
  completed: string[]
  stars: number
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
    >
      {!visited && !island.locked ? <span className={styles.questMark}>!</span> : null}
      {active ? <span className={styles.islandGlow} aria-hidden="true" /> : null}

      <button
        type="button"
        className={styles.islandBtn}
        data-locked={island.locked}
        data-visited={visited}
        onClick={onSelect}
        aria-label={`${island.title}，${island.locked ? '尚未解锁' : visited ? '已发现' : '未探索'}`}
        aria-pressed={landed}
      >
        <img className={styles.islandArt} src={art} alt="" draggable={false} />
        <span className={styles.nodeLabel}>{island.short}</span>
        {island.locked ? (
          <span className={styles.lockBadge}>
            <LockSimple size={10} weight="bold" />
          </span>
        ) : allDone ? (
          <span className={styles.doneBadge}>
            <Check size={10} weight="bold" />
          </span>
        ) : (
          <span className={styles.starBadge}>
            <Star size={9} weight="fill" />
            {island.stars}
          </span>
        )}
      </button>

      {landed ? (
        <aside className={styles.islandNote} aria-live="polite">
          <div className={styles.islandNoteTop}>
            <strong>{island.title}</strong>
            <span className={styles.whisperStars}>
              {Array.from({ length: island.starsMax }, (_, index) => (
                <Star key={index} size={9} weight={index < stars ? 'fill' : 'regular'} />
              ))}
            </span>
          </div>
          <p>{island.blurb}</p>
          <span className={styles.whisperMeta}>
            拾取物件学习 · {done}/{articles.length}
          </span>
        </aside>
      ) : null}

      {landed && !island.locked
        ? articles.map((item, index) => {
            const angle = (-40 + index * 40) * (Math.PI / 180)
            const radius = 118
            return (
              <button
                type="button"
                key={item.id}
                className={styles.mapObject}
                data-locked={EXPLORE_LOCKED_ARTICLE_IDS.has(item.id)}
                data-completed={completed.includes(item.id)}
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius + 36}px)`,
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
