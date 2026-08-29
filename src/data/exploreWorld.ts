import type { ExploreIsland } from '@/data/content'

/** Portrait map sized for mobile: full width, gentle vertical camera follow.
 * Extra bottom pad so the last island can still center when zoomed in. */
export const WORLD_W = 780
export const WORLD_H = 2100

export const ISLAND_ART: Record<ExploreIsland['id'], string> = {
  pain: '/textures/explore/islands/pain.png',
  relief: '/textures/explore/islands/relief.png',
  nutrition: '/textures/explore/islands/nutrition.png',
  move: '/textures/explore/islands/move.png',
  disease: '/textures/explore/islands/disease.png',
  sleep: '/textures/explore/islands/sleep.png',
  mood: '/textures/explore/islands/mood.png',
}

/**
 * Zig-zag anchors inset from edges so sprites stay on-map,
 * with open sailing channels between left / right columns.
 */
export const ISLAND_WORLD: Record<
  ExploreIsland['id'],
  { x: number; y: number; scale: number }
> = {
  pain: { x: 235, y: 340, scale: 1.02 },
  relief: { x: 545, y: 450, scale: 1.0 },
  nutrition: { x: 230, y: 720, scale: 1.02 },
  move: { x: 550, y: 920, scale: 1.0 },
  disease: { x: 235, y: 1100, scale: 1.02 },
  sleep: { x: 550, y: 1380, scale: 1.0 },
  mood: { x: 390, y: 1680, scale: 1.04 },
}

/** Keep at most this many completed dashed trails on the map. */
export const MAX_TRAIL_SEGMENTS = 3

/** Collision radius around an island body (boat must sail around). */
export function islandRadius(id: ExploreIsland['id']) {
  return 124 * ISLAND_WORLD[id].scale
}

/** Dock point just south of an island — where the boat rests / arrives. */
export function dockOf(id: ExploreIsland['id']) {
  const p = ISLAND_WORLD[id]
  return { x: p.x, y: Math.min(WORLD_H - 40, p.y + 210) }
}

export const PAPER_BOAT_SRC = '/textures/explore/paper-boat.png'
/** Full-bleed paper-relief sea map (portrait). */
export const PAPER_SEA_MAP = '/textures/explore/paper-sea-map.jpg'
/** @deprecated tile kept for fallbacks */
export const PAPER_SEA_TILE = '/textures/explore/paper-sea-tile.jpg'

export type Point = { x: number; y: number }

export type SailCurve = {
  d: string
  length: number
  pointAt: (t: number) => Point & { angle: number }
}

type Obstacle = { id: string; c: Point; r: number }

const CLEARANCE = 36

function allIslandObstacles(): Obstacle[] {
  return (Object.keys(ISLAND_WORLD) as ExploreIsland['id'][]).map((id) => ({
    id,
    c: { x: ISLAND_WORLD[id].x, y: ISLAND_WORLD[id].y - 10 },
    r: islandRadius(id) + CLEARANCE,
  }))
}

function blocked(x: number, y: number, obstacles: Obstacle[], pad = 0) {
  for (const o of obstacles) {
    if (Math.hypot(x - o.c.x, y - o.c.y) < o.r + pad) return true
  }
  return false
}

function pushOutOfObstacles(p: Point, obstacles: Obstacle[]): Point {
  let x = p.x
  let y = p.y
  for (let pass = 0; pass < 5; pass++) {
    let moved = false
    for (const o of obstacles) {
      const dx = x - o.c.x
      const dy = y - o.c.y
      const dist = Math.hypot(dx, dy) || 0.001
      if (dist < o.r + 2) {
        const scale = (o.r + 6) / dist
        x = o.c.x + dx * scale
        y = o.c.y + dy * scale
        moved = true
      }
    }
    if (!moved) break
  }
  return {
    x: Math.min(WORLD_W - 28, Math.max(28, x)),
    y: Math.min(WORLD_H - 28, Math.max(28, y)),
  }
}

function oMargin(o: Obstacle) {
  return o.r + 14
}

/**
 * Coarse 8-connected grid A* over open water so the boat skirts island circles.
 */
function planWaypoints(from: Point, to: Point, obstacles: Obstacle[]): Point[] {
  const start = pushOutOfObstacles(from, obstacles)
  const goal = pushOutOfObstacles(to, obstacles)
  const cell = 28
  const cols = Math.ceil(WORLD_W / cell)
  const rows = Math.ceil(WORLD_H / cell)

  const key = (cx: number, cy: number) => cx + cy * cols
  const inBounds = (cx: number, cy: number) => cx >= 0 && cy >= 0 && cx < cols && cy < rows
  const walkable = (cx: number, cy: number) => {
    if (!inBounds(cx, cy)) return false
    const x = (cx + 0.5) * cell
    const y = (cy + 0.5) * cell
    return !blocked(x, y, obstacles, 10)
  }

  const startC = {
    cx: Math.min(cols - 1, Math.max(0, Math.floor(start.x / cell))),
    cy: Math.min(rows - 1, Math.max(0, Math.floor(start.y / cell))),
  }
  const goalC = {
    cx: Math.min(cols - 1, Math.max(0, Math.floor(goal.x / cell))),
    cy: Math.min(rows - 1, Math.max(0, Math.floor(goal.y / cell))),
  }

  // If start/goal cells blocked, snap to nearest walkable
  const snapWalkable = (cx: number, cy: number) => {
    if (walkable(cx, cy)) return { cx, cy }
    for (let rad = 1; rad <= 6; rad++) {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const nx = cx + dx
          const ny = cy + dy
          if (walkable(nx, ny)) return { cx: nx, cy: ny }
        }
      }
    }
    return { cx, cy }
  }
  const s = snapWalkable(startC.cx, startC.cy)
  const g = snapWalkable(goalC.cx, goalC.cy)

  type Node = { cx: number; cy: number; g: number; f: number }
  const open: Node[] = [{ cx: s.cx, cy: s.cy, g: 0, f: 0 }]
  const came = new Map<number, number>()
  const gScore = new Map<number, number>([[key(s.cx, s.cy), 0]])
  const closed = new Set<number>()
  const heuristic = (cx: number, cy: number) => Math.hypot(cx - g.cx, cy - g.cy)

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  let found = false
  let guard = 0
  while (open.length && guard++ < 12000) {
    open.sort((a, b) => a.f - b.f)
    const cur = open.shift()!
    const ck = key(cur.cx, cur.cy)
    if (closed.has(ck)) continue
    closed.add(ck)
    if (cur.cx === g.cx && cur.cy === g.cy) {
      found = true
      break
    }
    for (const [dx, dy] of dirs) {
      const nx = cur.cx + dx
      const ny = cur.cy + dy
      if (!walkable(nx, ny)) continue
      // No cutting diagonally through blocked corners
      if (dx !== 0 && dy !== 0) {
        if (!walkable(cur.cx + dx, cur.cy) || !walkable(cur.cx, cur.cy + dy)) continue
      }
      const nk = key(nx, ny)
      if (closed.has(nk)) continue
      const step = dx !== 0 && dy !== 0 ? 1.414 : 1
      const tentative = cur.g + step
      if (tentative >= (gScore.get(nk) ?? Infinity)) continue
      came.set(nk, ck)
      gScore.set(nk, tentative)
      open.push({ cx: nx, cy: ny, g: tentative, f: tentative + heuristic(nx, ny) })
    }
  }

  if (!found) {
    // Fallback: center-channel detour
    const mid = pushOutOfObstacles(
      { x: WORLD_W * 0.5, y: (start.y + goal.y) / 2 },
      obstacles,
    )
    return [start, mid, goal]
  }

  // Reconstruct
  const cells: { cx: number; cy: number }[] = []
  let curK = key(g.cx, g.cy)
  const startK = key(s.cx, s.cy)
  while (curK !== startK) {
    const cx = curK % cols
    const cy = (curK / cols) | 0
    cells.push({ cx, cy })
    const prev = came.get(curK)
    if (prev === undefined) break
    curK = prev
  }
  cells.push(s)
  cells.reverse()

  // Convert to world points, keep start/goal exact, simplify collinear-ish cells
  const raw: Point[] = [start]
  for (let i = 1; i < cells.length - 1; i++) {
    const prev = cells[i - 1]
    const cur = cells[i]
    const next = cells[i + 1]
    const ax = cur.cx - prev.cx
    const ay = cur.cy - prev.cy
    const bx = next.cx - cur.cx
    const by = next.cy - cur.cy
    // Keep corners only
    if (ax !== bx || ay !== by) {
      raw.push({
        x: (cur.cx + 0.5) * cell,
        y: (cur.cy + 0.5) * cell,
      })
    }
  }
  raw.push(goal)

  // Light simplify only: drop near-collinear midpoints; never skip around obstacles.
  const pulled: Point[] = [raw[0]]
  for (let i = 1; i < raw.length - 1; i++) {
    const prev = pulled[pulled.length - 1]
    const cur = raw[i]
    const next = raw[i + 1]
    const ax = cur.x - prev.x
    const ay = cur.y - prev.y
    const bx = next.x - cur.x
    const by = next.y - cur.y
    const cross = Math.abs(ax * by - ay * bx)
    const mag = Math.hypot(ax, ay) * Math.hypot(bx, by) || 1
    // Keep point if direction changes meaningfully
    if (cross / mag > 0.08) pulled.push(cur)
  }
  pulled.push(goal)
  return pulled.map((p) => pushOutOfObstacles(p, obstacles))
}

/** Polyline path — never cubic-cut through islands. */
function curveFromWaypoints(points: Point[], obstacles: Obstacle[]): SailCurve {
  if (points.length < 2) {
    const p = points[0] ?? { x: 0, y: 0 }
    return {
      d: `M ${p.x} ${p.y}`,
      length: 0,
      pointAt: () => ({ ...p, angle: 0 }),
    }
  }

  const samples: Point[] = []
  const pushSample = (p: Point) => {
    const safe = pushOutOfObstacles(p, obstacles)
    const last = samples[samples.length - 1]
    if (!last || Math.hypot(safe.x - last.x, safe.y - last.y) > 2) samples.push(safe)
  }

  pushSample(points[0])
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const hit = obstacles.find((o) => {
      const abx = b.x - a.x
      const aby = b.y - a.y
      const len2 = abx * abx + aby * aby || 1
      let t = ((o.c.x - a.x) * abx + (o.c.y - a.y) * aby) / len2
      t = Math.min(1, Math.max(0, t))
      const px = a.x + abx * t
      const py = a.y + aby * t
      return Math.hypot(px - o.c.x, py - o.c.y) < o.r
    })
    if (hit) {
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy) || 1
      const n1 = { x: -dy / len, y: dx / len }
      const n2 = { x: dy / len, y: -dx / len }
      const m = oMargin(hit)
      const c1 = pushOutOfObstacles({ x: hit.c.x + n1.x * m, y: hit.c.y + n1.y * m }, obstacles)
      const c2 = pushOutOfObstacles({ x: hit.c.x + n2.x * m, y: hit.c.y + n2.y * m }, obstacles)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const pick =
        Math.hypot(c1.x - mid.x, c1.y - mid.y) <= Math.hypot(c2.x - mid.x, c2.y - mid.y) ? c1 : c2
      const stepsA = Math.max(3, Math.ceil(Math.hypot(pick.x - a.x, pick.y - a.y) / 16))
      for (let s = 1; s <= stepsA; s++) {
        const t = s / stepsA
        pushSample({ x: a.x + (pick.x - a.x) * t, y: a.y + (pick.y - a.y) * t })
      }
      const stepsB = Math.max(3, Math.ceil(Math.hypot(b.x - pick.x, b.y - pick.y) / 16))
      for (let s = 1; s <= stepsB; s++) {
        const t = s / stepsB
        pushSample({ x: pick.x + (b.x - pick.x) * t, y: pick.y + (b.y - pick.y) * t })
      }
      continue
    }
    const steps = Math.max(4, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 16))
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      pushSample({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }

  const lengths: number[] = [0]
  let total = 0
  for (let i = 1; i < samples.length; i++) {
    total += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y)
    lengths.push(total)
  }

  let d = `M ${samples[0].x.toFixed(1)} ${samples[0].y.toFixed(1)}`
  for (let i = 1; i < samples.length; i++) {
    d += ` L ${samples[i].x.toFixed(1)} ${samples[i].y.toFixed(1)}`
  }

  const pointAt = (t: number) => {
    const clamped = Math.min(1, Math.max(0, t))
    if (total <= 0) return { ...samples[0], angle: 0 }
    const targetLen = clamped * total
    let i = 1
    while (i < lengths.length && lengths[i] < targetLen) i += 1
    const a = lengths[i - 1]
    const bLen = lengths[i] ?? a
    const localT = bLen > a ? (targetLen - a) / (bLen - a) : 0
    const p0 = samples[i - 1]
    const p1 = samples[i] ?? p0
    return {
      x: p0.x + (p1.x - p0.x) * localT,
      y: p0.y + (p1.y - p0.y) * localT,
      angle: (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI,
    }
  }

  return { d, length: total, pointAt }
}

/**
 * Build a sail path from dock/open water to a target dock that skirts island bodies.
 */
export function buildSailRoute(
  from: Point,
  to: Point,
  _fromIslandId: ExploreIsland['id'] | null,
  toIslandId: ExploreIsland['id'],
): SailCurve {
  const obstacles = allIslandObstacles()
  // Approach the destination dock from open water south of the island body.
  const dest = ISLAND_WORLD[toIslandId]
  const approach = pushOutOfObstacles(
    { x: dest.x, y: Math.min(WORLD_H - 36, dest.y + islandRadius(toIslandId) + CLEARANCE + 24) },
    obstacles,
  )
  const waypoints = planWaypoints(from, approach, obstacles)
  // Final hop to exact dock if not already there
  const last = waypoints[waypoints.length - 1]
  if (!last || Math.hypot(last.x - to.x, last.y - to.y) > 8) {
    waypoints.push(pushOutOfObstacles(to, obstacles))
  }
  return curveFromWaypoints(waypoints, obstacles)
}

/** @deprecated use buildSailRoute — kept for simple bends without obstacles */
export function buildSailCurve(from: Point, to: Point): SailCurve {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy) || 1
  const ox = -dy / dist
  const oy = dx / dist
  const side = (Math.round(from.x + to.x + from.y + to.y) & 1) === 0 ? 1 : -1
  const amp = Math.min(160, Math.max(48, dist * 0.32)) * side

  const c1 = {
    x: from.x + dx * 0.28 + ox * amp,
    y: from.y + dy * 0.28 + oy * amp,
  }
  const c2 = {
    x: from.x + dx * 0.72 + ox * amp * 0.55,
    y: from.y + dy * 0.72 + oy * amp * 0.55,
  }

  const d = `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`

  const samples = 48
  const lengths: number[] = [0]
  let total = 0
  let prev = from
  for (let i = 1; i <= samples; i++) {
    const t = i / samples
    const p = cubicAt(from, c1, c2, to, t)
    total += Math.hypot(p.x - prev.x, p.y - prev.y)
    lengths.push(total)
    prev = p
  }

  const pointAt = (t: number) => {
    const clamped = Math.min(1, Math.max(0, t))
    const targetLen = clamped * total
    let i = 1
    while (i < lengths.length && lengths[i] < targetLen) i += 1
    const a = lengths[i - 1]
    const b = lengths[i] ?? a
    const localT = b > a ? (targetLen - a) / (b - a) : 0
    const t0 = (i - 1) / samples
    const t1 = i / samples
    const ut = t0 + (t1 - t0) * localT
    const p = cubicAt(from, c1, c2, to, ut)
    const tan = cubicTangent(from, c1, c2, to, ut)
    return {
      x: p.x,
      y: p.y,
      angle: (Math.atan2(tan.y, tan.x) * 180) / Math.PI,
    }
  }

  return { d, length: total, pointAt }
}

function cubicAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  }
}

function cubicTangent(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  }
}
