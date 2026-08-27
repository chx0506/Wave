export type TidePalette = {
  skyTop: string
  skyMid: string
  sand: string
  waterLight: string
  water: string
  waterDeep: string
  foam: string
  island: string
  cloud: string
}

export function readTidePalette(el: Element): TidePalette {
  const s = getComputedStyle(el)
  const v = (name: string) => s.getPropertyValue(name).trim()
  return {
    skyTop: v('--coast-sky-top'),
    skyMid: v('--coast-sky-mid'),
    sand: v('--coast-sand'),
    waterLight: v('--coast-water-light'),
    water: v('--coast-water'),
    waterDeep: v('--coast-water-deep'),
    foam: v('--coast-foam'),
    island: v('--coast-island'),
    cloud: v('--coast-cloud'),
  }
}

/** Shore x: smaller x means water has walked farther onto the sand. */
export function shoreX(
  y: number,
  h: number,
  w: number,
  coverage: number,
  time: number,
  animate: boolean,
): number {
  const lowX = w * 0.64
  const highX = w * 0.16
  const base = lowX + (highX - lowX) * coverage
  const ny = y / h
  const curve =
    w * 0.11 * Math.sin(ny * Math.PI * 1.6 + 0.35) +
    w * 0.045 * Math.sin(ny * Math.PI * 3.1 + 1.1)

  if (!animate) return base + curve

  const lap =
    w * 0.055 * Math.sin(time * 1.15 + ny * 6.2) +
    w * 0.028 * Math.sin(time * 0.62 + ny * 11.4) +
    w * 0.012 * Math.sin(time * 2.1 + ny * 18)
  return base + curve + lap
}

export function paintTideScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  coverage: number,
  time: number,
  night: boolean,
  palette: TidePalette,
  animate: boolean,
) {
  ctx.clearRect(0, 0, w, h)
  paintSky(ctx, w, h, palette)
  if (night) paintStars(ctx, w, h, time, animate)
  else paintClouds(ctx, w, h, palette, time, animate)
  paintIslands(ctx, w, h, palette, night)

  ctx.fillStyle = palette.sand
  ctx.fillRect(0, h * 0.16, w, h)

  const samples = sampleShore(w, h, coverage, time, animate)
  paintWater(ctx, w, h, samples, palette)
  paintWetSand(ctx, w, samples, palette)
  paintSwells(ctx, w, h, coverage, time, palette, animate)
  paintFoam(ctx, samples, palette)
  if (night) paintMoon(ctx, w, h, palette)
}

function sampleShore(
  w: number,
  h: number,
  coverage: number,
  time: number,
  animate: boolean,
) {
  const step = 6
  const points: { x: number; y: number }[] = []
  for (let y = 0; y <= h; y += step) {
    points.push({ x: shoreX(y, h, w, coverage, time, animate), y })
  }
  if (points[points.length - 1]?.y !== h) {
    points.push({ x: shoreX(h, h, w, coverage, time, animate), y: h })
  }
  return points
}

function paintSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: TidePalette,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.42)
  sky.addColorStop(0, palette.skyTop)
  sky.addColorStop(1, palette.skyMid)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h * 0.42)
}

function paintClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: TidePalette,
  time: number,
  animate: boolean,
) {
  const drift = animate ? Math.sin(time * 0.08) * 10 : 0
  ctx.fillStyle = palette.cloud
  puff(ctx, w * 0.18 + drift, h * 0.075, 46, 13)
  puff(ctx, w * 0.28 + drift, h * 0.068, 26, 9)
  puff(ctx, w * 0.54 - drift * 0.6, h * 0.092, 34, 10)
}

function puff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function paintStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  animate: boolean,
) {
  const stars = [
    [0.12, 0.07, 1.3],
    [0.24, 0.05, 1.0],
    [0.38, 0.082, 1.5],
    [0.54, 0.055, 1.1],
    [0.68, 0.074, 0.9],
    [0.82, 0.044, 1.4],
    [0.18, 0.12, 0.8],
  ] as const
  for (const [nx, ny, r] of stars) {
    const twinkle = animate ? 0.55 + 0.45 * Math.sin(time * 1.4 + nx * 12) : 0.85
    ctx.globalAlpha = twinkle
    ctx.fillStyle = '#f3f7fb'
    ctx.beginPath()
    ctx.arc(nx * w, ny * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function paintMoon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: TidePalette,
) {
  ctx.fillStyle = '#f3f6ea'
  ctx.beginPath()
  ctx.arc(w * 0.78, h * 0.1, 17, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = palette.skyTop
  ctx.beginPath()
  ctx.arc(w * 0.8, h * 0.092, 17, 0, Math.PI * 2)
  ctx.fill()
}

function paintIslands(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: TidePalette,
  night: boolean,
) {
  ctx.globalAlpha = night ? 0.42 : 0.55
  ctx.fillStyle = palette.island
  ctx.beginPath()
  ctx.ellipse(w * 0.74, h * 0.15, 74, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = night ? 0.32 : 0.4
  ctx.beginPath()
  ctx.ellipse(w * 0.86, h * 0.168, 40, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function paintWater(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  samples: { x: number; y: number }[],
  palette: TidePalette,
) {
  const water = ctx.createLinearGradient(w * 0.2, 0, w, h * 0.2)
  water.addColorStop(0, palette.waterLight)
  water.addColorStop(0.45, palette.water)
  water.addColorStop(1, palette.waterDeep)

  ctx.beginPath()
  ctx.moveTo(w, 0)
  ctx.lineTo(samples[0].x, samples[0].y)
  for (const p of samples) ctx.lineTo(p.x, p.y)
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fillStyle = water
  ctx.fill()
}

function paintWetSand(
  ctx: CanvasRenderingContext2D,
  w: number,
  samples: { x: number; y: number }[],
  palette: TidePalette,
) {
  ctx.beginPath()
  ctx.moveTo(samples[0].x, samples[0].y)
  for (const p of samples) ctx.lineTo(p.x, p.y)
  for (let i = samples.length - 1; i >= 0; i -= 1) {
    ctx.lineTo(samples[i].x - Math.min(28, w * 0.07), samples[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = palette.waterLight
  ctx.globalAlpha = 0.28
  ctx.fill()
  ctx.globalAlpha = 1
}

function paintSwells(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  coverage: number,
  time: number,
  palette: TidePalette,
  animate: boolean,
) {
  const bands = [
    { delay: 0.0, depth: 0.16, width: 22 },
    { delay: 0.33, depth: 0.26, width: 16 },
    { delay: 0.66, depth: 0.38, width: 11 },
  ]

  for (const band of bands) {
    const travel = animate ? (time * 0.14 + band.delay) % 1 : 0.45
    const offset = (0.04 + travel * band.depth) * w
    const alpha = 0.32 * Math.sin(travel * Math.PI)
    if (alpha <= 0.03) continue

    ctx.beginPath()
    for (let y = 0; y <= h; y += 6) {
      const wobble = 10 * Math.sin(y * 0.03 + time * 1.6 + band.delay)
      const x = shoreX(y, h, w, coverage, time, animate) + offset + wobble
      if (y === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = palette.foam
    ctx.globalAlpha = alpha
    ctx.lineWidth = band.width
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function paintFoam(
  ctx: CanvasRenderingContext2D,
  samples: { x: number; y: number }[],
  palette: TidePalette,
) {
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(samples[0].x, samples[0].y)
  for (const p of samples) ctx.lineTo(p.x, p.y)
  ctx.strokeStyle = palette.foam
  ctx.globalAlpha = 0.38
  ctx.lineWidth = 22
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(samples[0].x, samples[0].y)
  for (const p of samples) ctx.lineTo(p.x, p.y)
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.globalAlpha = 1
}
