import {
  EXPLORE_ARTICLES,
  EXPLORE_ISLANDS,
  EXPLORE_LOCKED_ARTICLE_IDS,
  EXPLORE_STARS,
  type ExploreArticle,
  type ExploreIsland,
  type ExploreObjectKind,
} from '@/data/content'
import { USER_DISPLAY_NAME } from '@/domain/copy'
import { Check, LockSimple, Star, X } from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import shell from './shared/pageShell.module.css'
import styles from './ExploreScreen.module.css'

const MAP_ZOOM = 2.15

type Camera = { scale: number; x: number; y: number }
type SheetState =
  | { island: ExploreIsland; kind: 'explore' }
  | { island: ExploreIsland; kind: 'article'; article: ExploreArticle }

function clampCamera(camera: Camera, width: number, height: number): Camera {
  const minX = Math.min(0, width - width * camera.scale)
  const minY = Math.min(0, height - height * camera.scale)
  return {
    ...camera,
    x: Math.min(0, Math.max(minX, camera.x)),
    y: Math.min(0, Math.max(minY, camera.y)),
  }
}

function cameraForIsland(island: ExploreIsland, width: number, height: number) {
  return clampCamera(
    {
      scale: MAP_ZOOM,
      x: width / 2 - width * MAP_ZOOM * (island.x / 100),
      y: height / 2 - height * MAP_ZOOM * (island.y / 100),
    },
    width,
    height,
  )
}

export function ExploreScreen() {
  const current = EXPLORE_ISLANDS.find((island) => island.current) ?? EXPLORE_ISLANDS[0]
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    cameraX: number
    cameraY: number
    captured: boolean
  } | null>(null)
  const draggedRef = useRef(false)
  const [selectedId, setSelectedId] = useState<string>(current.id)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [camera, setCamera] = useState<Camera>({ scale: 1, x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [unlockedArticles, setUnlockedArticles] = useState<string[]>([])

  const selected = EXPLORE_ISLANDS.find((island) => island.id === selectedId) ?? current
  const selectedArticles = EXPLORE_ARTICLES.filter((article) => article.islandId === selected.id)
  const selectedCompleted = selectedArticles.filter((article) => completed.includes(article.id)).length
  const selectedStars = Math.min(selected.stars + selectedCompleted, selected.starsMax)
  const unlocked = EXPLORE_ISLANDS.filter((island) => !island.locked).length
  const isFocused = focusedId !== null
  const nextArticle = selectedArticles.find((article) => !completed.includes(article.id)) ?? selectedArticles[0]

  const focusIsland = (island: ExploreIsland) => {
    if (draggedRef.current) return
    const viewport = viewportRef.current
    if (!viewport) return
    setSelectedId(island.id)
    setFocusedId(island.id)
    setCamera(cameraForIsland(island, viewport.clientWidth, viewport.clientHeight))
  }

  const showOverview = () => {
    setFocusedId(null)
    setCamera({ scale: 1, x: 0, y: 0 })
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(() => {
      const island = EXPLORE_ISLANDS.find((item) => item.id === focusedId)
      setCamera(
        island
          ? cameraForIsland(island, viewport.clientWidth, viewport.clientHeight)
          : { scale: 1, x: 0, y: 0 },
      )
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [focusedId])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isFocused || event.button !== 0) return
    draggedRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: camera.x,
      cameraY: camera.y,
      captured: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const viewport = viewportRef.current
    if (!drag || !viewport || drag.pointerId !== event.pointerId) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (Math.hypot(deltaX, deltaY) <= 5) return
    if (!drag.captured) {
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.captured = true
      draggedRef.current = true
      setDragging(true)
    }
    setCamera((value) =>
      clampCamera(
        { ...value, x: drag.cameraX + deltaX, y: drag.cameraY + deltaY },
        viewport.clientWidth,
        viewport.clientHeight,
      ),
    )
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    setDragging(false)
  }

  const completeKey = sheet?.kind === 'article' ? sheet.article.id : `explore:${sheet?.island.id}`
  const articleLocked = sheet?.kind === 'article'
    ? EXPLORE_LOCKED_ARTICLE_IDS.has(sheet.article.id) && !unlockedArticles.includes(sheet.article.id)
    : false

  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>Explore</p>
        <h1 className={shell.title}>海岛探秘</h1>
        <p className={shell.subtitle}>放大岛屿，寻找藏在地貌里的健康知识。</p>
      </header>

      <div className={`${shell.body} ${styles.body}`}>
        <div className={styles.hud}>
          <div className={styles.player}>
            <span className={styles.avatar} aria-hidden="true">{USER_DISPLAY_NAME.slice(0, 1)}</span>
            <div>
              <p className={styles.playerName}>{USER_DISPLAY_NAME}</p>
              <p className={styles.playerMeta}>正在探索 · {selected.short}</p>
            </div>
          </div>
          <div className={styles.starsHud}>
            <Star size={14} weight="fill" />
            <span>{EXPLORE_STARS + completed.length}</span>
            <em>{unlocked}/{EXPLORE_ISLANDS.length} 岛</em>
          </div>
        </div>

        <section className={styles.mapCard} aria-label="海岛知识地图">
          <div
            ref={viewportRef}
            className={styles.mapViewport}
            data-focused={isFocused}
            data-dragging={dragging}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div
              className={styles.mapWorld}
              style={{ transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})` }}
            >
              <OceanBackdrop />
              {EXPLORE_ISLANDS.map((island) => (
                <IslandNode
                  key={island.id}
                  island={island}
                  active={island.id === selected.id}
                  focused={island.id === focusedId}
                  articles={EXPLORE_ARTICLES.filter((article) => article.islandId === island.id)}
                  completed={completed}
                  onSelect={() => focusIsland(island)}
                  onOpenArticle={(article) => {
                    if (draggedRef.current) return
                    setSheet({ island, kind: 'article', article })
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles.mapGuide}>
            <span>{isFocused ? '拖动地图看看' : '试试点击一座岛'}</span>
            {isFocused ? <button type="button" onClick={showOverview}>返回全景</button> : null}
          </div>
        </section>

        <article className={`${shell.card} ${styles.detail}`} data-locked={selected.locked}>
          <div className={styles.detailTop}>
            <div>
              <p className={styles.detailKicker}>
                {selected.locked ? '尚未解锁' : isFocused ? '岛屿探索中' : '知识岛屿'}
              </p>
              <h2 className={styles.detailTitle}>{selected.title}</h2>
            </div>
            <div className={styles.starRow} aria-label={`星星 ${selectedStars}/${selected.starsMax}`}>
              {Array.from({ length: selected.starsMax }, (_, index) => (
                <Star
                  key={index}
                  size={16}
                  weight={index < selectedStars ? 'fill' : 'regular'}
                  className={index < selectedStars ? styles.starOn : styles.starOff}
                />
              ))}
            </div>
          </div>
          <p className={styles.detailBlurb}>{selected.blurb}</p>
          <div className={styles.discoveryRow}>
            <span>{selectedArticles.length} 个知识物件</span>
            <span>{selectedCompleted}/{selectedArticles.length} 已阅读</span>
          </div>
          {selected.locked ? (
            <button type="button" className={styles.unlockBtn}>
              <LockSimple size={14} weight="bold" /> 用星星或贝壳解锁
            </button>
          ) : (
            <div className={styles.detailActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  if (!isFocused) {
                    focusIsland(selected)
                  } else if (nextArticle) {
                    setSheet({ island: selected, kind: 'article', article: nextArticle })
                  }
                }}
              >
                {!isFocused ? '进入岛屿' : selectedCompleted === selectedArticles.length ? '再读一篇' : '发现下一个物件'}
              </button>
              <button type="button" className={styles.ghostBtn} onClick={() => setSheet({ island: selected, kind: 'explore' })}>
                查看物件清单
              </button>
            </div>
          )}
        </article>
      </div>

      {sheet ? (
        <ArticleSheet
          sheet={sheet}
          articles={selectedArticles}
          completed={completed.includes(completeKey)}
          onClose={() => setSheet(null)}
          onOpenArticle={(article) => setSheet({ island: selected, kind: 'article', article })}
          locked={articleLocked}
          onComplete={() => {
            if (articleLocked && sheet?.kind === 'article') {
              setUnlockedArticles((items) => [...items, sheet.article.id])
              return
            }
            setCompleted((items) => (items.includes(completeKey) ? items : [...items, completeKey]))
            setSheet(null)
          }}
        />
      ) : null}
    </div>
  )
}

function OceanBackdrop() {
  return <img className={styles.oceanSvg} src="/textures/explore-map-bg.jpg" alt="" aria-hidden="true" draggable={false} />
}

function IslandNode({
  island,
  active,
  focused,
  articles,
  completed,
  onSelect,
  onOpenArticle,
}: {
  island: ExploreIsland
  active: boolean
  focused: boolean
  articles: ExploreArticle[]
  completed: string[]
  onSelect: () => void
  onOpenArticle: (article: ExploreArticle) => void
}) {
  return (
    <div className={styles.islandGroup} style={{ left: `${island.x}%`, top: `${island.y}%` }} data-focused={focused}>
      <button
        type="button"
        className={styles.node}
        data-tone={island.tone}
        data-locked={island.locked}
        data-active={active}
        data-current={island.current}
        onClick={onSelect}
        aria-label={`${island.title}，${island.locked ? '尚未解锁' : `${articles.length} 个知识物件`}`}
        aria-pressed={active}
      >
        <span className={styles.land} aria-hidden="true"><IslandGlyph tone={island.tone} locked={island.locked} /></span>
        <span className={styles.nodeLabel}>{island.short}</span>
        {island.locked ? <span className={styles.lockBadge}><LockSimple size={9} weight="bold" /></span> : <span className={styles.starBadge}><Star size={8} weight="fill" />{island.stars}</span>}
      </button>
      {focused && !island.locked ? articles.map((article) => (
        <button
          type="button"
          key={article.id}
          className={styles.mapObject}
          data-locked={EXPLORE_LOCKED_ARTICLE_IDS.has(article.id)}
          data-completed={completed.includes(article.id)}
          style={{
            left: `calc(50% + ${article.objectX * 7}px)`,
            top: `calc(50% + ${article.objectY * 7}px)`,
          }}
          onClick={(event) => { event.stopPropagation(); onOpenArticle(article) }}
          aria-label={`${article.objectLabel}：${article.title}`}
        >
          <ObjectGlyph kind={article.objectKind} />
          <span className={styles.objectLabel}>{article.objectLabel}</span>
          {completed.includes(article.id) ? <span className={styles.paperMark} aria-label="已阅读">✦</span> : EXPLORE_LOCKED_ARTICLE_IDS.has(article.id) ? <span className={styles.articleLockMark} aria-label="需要解锁"><LockSimple size={7} weight="bold" /></span> : null}
        </button>
      )) : null}
    </div>
  )
}

function ObjectGlyph({ kind }: { kind: ExploreObjectKind }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <ellipse cx="16" cy="27" rx="11" ry="3" fill="rgba(62,92,112,.18)" />
      {kind === 'tree' || kind === 'coconut' ? <><path d="M16 25V12" stroke="#856a48" strokeWidth="3" /><circle cx="12" cy="10" r="6" fill="#72ad78" /><circle cx="20" cy="9" r="6" fill="#86bf82" /></> : null}
      {kind === 'moon' ? <path d="M21 5a9 9 0 1 0 5 15A10 10 0 0 1 21 5Z" fill="#f8edb7" stroke="#7c91b5" /> : null}
      {kind === 'mushroom' ? <><path d="M9 15c0-6 14-6 14 0Z" fill="#d86f69" /><rect x="13" y="15" width="6" height="10" rx="2" fill="#f5e5c9" /></> : null}
      {kind === 'lighthouse' ? <><path d="m12 25 2-15h5l2 15Z" fill="#f3f5f4" /><path d="M13 18h7" stroke="#d66e64" strokeWidth="3" /><path d="M12 10h9l-2-4h-5Z" fill="#6e8fa8" /></> : null}
      {kind === 'tea' ? <><path d="M8 12h14v11H8Z" fill="#e0a66f" /><path d="M22 15h3v5h-3" fill="none" stroke="#9b704e" strokeWidth="2" /><path d="M11 9c0-2 2-2 2-4M17 9c0-2 2-2 2-4" fill="none" stroke="#fff" /></> : null}
      {kind === 'book' ? <><path d="M6 9c5-2 8 1 10 3v14c-2-2-5-4-10-2Z" fill="#f4eee2" stroke="#6d91a8" /><path d="M26 9c-5-2-8 1-10 3v14c2-2 5-4 10-2Z" fill="#fff8e9" stroke="#6d91a8" /></> : null}
      {kind === 'flower' ? <><g fill="#d58bb2"><circle cx="16" cy="7" r="5" /><circle cx="23" cy="14" r="5" /><circle cx="16" cy="21" r="5" /><circle cx="9" cy="14" r="5" /></g><circle cx="16" cy="14" r="3" fill="#f1c668" /></> : null}
      {kind === 'crystal' ? <path d="m16 4 8 9-6 13h-7L8 14Z" fill="#9e8bd5" stroke="#fff" strokeLinejoin="round" /> : null}
      {kind === 'shell' ? <><path d="M7 23c0-10 4-17 9-17s9 7 9 17c-6 4-12 4-18 0Z" fill="#f4c5a5" stroke="#b47d73" /><path d="M16 7v18M10 11l3 14M22 11l-3 14" stroke="#fff" opacity=".7" /></> : null}
      {kind === 'camp' || kind === 'tent' ? <><path d="m5 25 11-18 11 18Z" fill="#d98b65" /><path d="m16 7 2 18h-5Z" fill="#f0c495" /></> : null}
    </svg>
  )
}

function ArticleSheet({ sheet, articles, completed, locked, onClose, onOpenArticle, onComplete }: { sheet: SheetState; articles: ExploreArticle[]; completed: boolean; locked: boolean; onClose: () => void; onOpenArticle: (article: ExploreArticle) => void; onComplete: () => void }) {
  const article = sheet.kind === 'article' ? sheet.article : null
  return (
    <div className={styles.sheetBackdrop} role="presentation" onClick={onClose}>
      <section className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="article-title" onClick={(event) => event.stopPropagation()}>
        <span className={styles.sheetHandle} aria-hidden="true" />
        <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="关闭内容"><X size={18} /></button>
        <p className={styles.detailKicker}>{article ? `${article.eyebrow} · ${article.readTime}` : '探索路径 · 约 1 分钟'}</p>
        <h2 id="article-title" className={styles.sheetTitle}>{article?.title ?? `探索 ${sheet.island.title}`}</h2>
        <p className={styles.sheetLead}>{locked ? '这篇科普文章是岛上的特别藏品，解锁后即可阅读完整内容。' : article?.lead ?? '放大岛屿，寻找物件，再沿着物件进入一篇具体的科普文章。'}</p>
        <div className={styles.articleBody}>
          {locked ? <div className={styles.articleLocked}><LockSimple size={22} /><strong>特别文章，尚未解锁</strong><span>岛屿可以自由探索，部分知识物件需要额外解锁。</span></div> : article ? <>{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p className={styles.articleTakeaway}>{article.takeaway}</p></> : (
            <>
              <p>这座岛藏着 {articles.length} 个物件，每个物件都对应一篇科普文章。沿着地图里的地貌慢慢寻找，找到哪个就读哪个。</p>
              <div className={styles.objectList}>
                {articles.map((item) => (
                  <button type="button" key={item.id} className={styles.objectListItem} data-locked={EXPLORE_LOCKED_ARTICLE_IDS.has(item.id)} onClick={() => onOpenArticle(item)}>
                    <span className={styles.objectListGlyph}><ObjectGlyph kind={item.objectKind} /></span>
                    <span className={styles.objectListCopy}>
                      <small>{EXPLORE_LOCKED_ARTICLE_IDS.has(item.id) ? '需解锁 · ' : ''}{item.objectLabel}</small>
                      <strong>{item.title}</strong>
                    </span>
                    <em>{item.readTime}</em>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button type="button" className={styles.sheetCta} onClick={article ? onComplete : onClose} disabled={article ? completed : false}>
          {locked ? '解锁这篇文章' : completed ? <><Check size={17} weight="bold" /> 已完成</> : article ? '完成阅读，留下探索标记' : '返回地图寻找物件'}
        </button>
      </section>
    </div>
  )
}

function IslandGlyph({ tone, locked }: { tone: ExploreIsland['tone']; locked: boolean }) {
  const palette: Record<ExploreIsland['tone'], [string, string, string]> = {
    meadow: ['#86bf91', '#b8dfa9', '#5f956a'], autumn: ['#d99a5e', '#efc27b', '#bd6848'], frost: ['#c7deed', '#eef7fa', '#8eb5cb'], magic: ['#ad91d2', '#d7c7ec', '#7552a8'], rock: ['#929eac', '#c2c9cf', '#6f7a89'], tropic: ['#dbbd78', '#f1dda4', '#5d9d6b'], sand: ['#d7b985', '#f0d6a6', '#bc8f62'],
  }
  const [base, top, accent] = palette[tone]
  return (
    <svg viewBox="0 0 72 54" width="72" height="54" aria-hidden="true" style={{ opacity: locked ? 0.48 : 1 }}>
      <ellipse cx="36" cy="46" rx="30" ry="6" fill="rgba(48,91,128,.2)" /><ellipse cx="36" cy="36" rx="29" ry="14" fill={base} /><ellipse cx="36" cy="32" rx="21" ry="10" fill={top} />
      {tone === 'rock' ? <><path d="M28 35 36 14l9 21Z" fill={accent} /><rect x="35" y="18" width="4" height="12" fill="#f3f0df" /></> : <><circle cx="25" cy="27" r="7" fill={accent} /><circle cx="48" cy="25" r="8" fill={accent} /><rect x="33" y="28" width="8" height="8" rx="1" fill="#f4ead8" /></>}
    </svg>
  )
}
