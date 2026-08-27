import type { TidePalette } from './palette'

export type { TidePalette } from './palette'
export { readCssPalette } from './palette'

/** Fixed shoreline for the day's tide. Smaller x = more sand covered. */
export function shoreX(y: number, h: number, w: number, coverage: number): number {
  const base = w * (0.74 - 0.6 * coverage)
  const ny = y / h
  return (
    base +
    w * 0.11 * Math.sin(ny * Math.PI * 1.45 + 0.35) +
    w * 0.04 * Math.sin(ny * Math.PI * 2.9 + 1.1)
  )
}

type WavePhase = 'approach' | 'break' | 'retreat' | 'idle'

type Wave = {
  phase: WavePhase
  /** 0–1 progress inside the current phase */
  t: number
  /** seconds spent in idle before next approach */
  wait: number
  period: number
  reach: number
  yBias: number
  seed: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

/**
 * Game-style tide engine (entity + particle systems).
 * Tide coverage is daily and stable; only surf entities animate.
 */
export class TideEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private waves: Wave[] = []
  private particles: Particle[] = []
  private time = 0
  private shown = 0.4
  private coverage = 0.4
  private night = false
  private animate = true
  private palette: TidePalette
  private reduce: MediaQueryList
  private onReduce: () => void
  private raf = 0
  private running = false
  private last = 0
  private dpr = 1
  private w = 1
  private h = 1

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    palette: TidePalette,
  ) {
    this.canvas = canvas
    this.ctx = ctx
    this.palette = palette
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.animate = !this.reduce.matches
    this.onReduce = () => {
      this.animate = !this.reduce.matches
    }
    this.reduce.addEventListener('change', this.onReduce)
    this.spawnWaveSet()
  }

  setCoverage(v: number) {
    this.coverage = v
  }

  setNight(v: boolean) {
    this.night = v
  }

  setPalette(p: TidePalette) {
    this.palette = p
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.shown = this.coverage
    const loop = (now: number) => {
      if (!this.running) return
      const dt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      this.tick(dt)
      this.draw()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  dispose() {
    this.stop()
    this.reduce.removeEventListener('change', this.onReduce)
  }

  fit() {
    const rect = this.canvas.getBoundingClientRect()
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = Math.max(1, rect.width)
    this.h = Math.max(1, rect.height)
    const bw = Math.round(this.w * this.dpr)
    const bh = Math.round(this.h * this.dpr)
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw
      this.canvas.height = bh
    }
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private spawnWaveSet() {
    // Stagger so one wave is usually washing while others approach.
    this.waves = [
      { phase: 'break', t: 0.25, wait: 0, period: 3.2, reach: 1, yBias: 0, seed: 1.1 },
      { phase: 'approach', t: 0.55, wait: 0, period: 4.0, reach: 0.82, yBias: 0.2, seed: 2.7 },
      { phase: 'idle', t: 0, wait: 0.8, period: 4.8, reach: 0.62, yBias: -0.12, seed: 4.3 },
    ]
  }

  private tick(dt: number) {
    this.fit()
    const blend = this.animate ? 1 - Math.exp(-dt * 3.2) : 1
    this.shown += (this.coverage - this.shown) * blend
    if (!this.animate) return
    this.time += dt

    for (const wave of this.waves) this.stepWave(wave, dt)
    this.stepParticles(dt)
  }

  private stepWave(wave: Wave, dt: number) {
    const speed = {
      approach: 0.55 / wave.period,
      break: 1.35 / wave.period,
      retreat: 0.7 / wave.period,
      idle: 1,
    }

    if (wave.phase === 'idle') {
      wave.wait -= dt
      if (wave.wait <= 0) {
        wave.phase = 'approach'
        wave.t = 0
      }
      return
    }

    wave.t += dt * speed[wave.phase]
    if (wave.t < 1) {
      if (wave.phase === 'break' && wave.t > 0.15 && wave.t < 0.55) {
        this.emitFoam(wave, 2)
      }
      return
    }

    wave.t = 0
    if (wave.phase === 'approach') wave.phase = 'break'
    else if (wave.phase === 'break') wave.phase = 'retreat'
    else {
      wave.phase = 'idle'
      wave.wait = 0.35 + wave.seed * 0.18
    }
  }

  private emitFoam(wave: Wave, count: number) {
    if (this.particles.length > 220) return
    const run = this.runup(wave)
    for (let i = 0; i < count; i += 1) {
      const y = ((i * 97 + wave.seed * 50 + this.time * 40) % this.h)
      const edge = shoreX(y, this.h, this.w, this.shown) - run * this.scallop(y, wave)
      this.particles.push({
        x: edge + (Math.random() - 0.3) * 10,
        y,
        vx: -18 - Math.random() * 28,
        vy: (Math.random() - 0.5) * 22,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.55,
        size: 1.2 + Math.random() * 2.4,
      })
    }
  }

  private stepParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i]
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.96
      p.vy *= 0.96
      if (p.life >= p.maxLife) this.particles.splice(i, 1)
    }
  }

  private runup(wave: Wave): number {
    const max = this.w * (0.09 + this.shown * 0.07) * wave.reach
    if (wave.phase === 'break') {
      const u = easeOutCubic(wave.t)
      return max * u
    }
    if (wave.phase === 'retreat') {
      return max * (1 - easeInCubic(wave.t))
    }
    return 0
  }

  private approachDist(wave: Wave): number {
    if (wave.phase !== 'approach' && wave.phase !== 'break') return -1
    const u = wave.phase === 'approach' ? wave.t : 1
    return (1 - u) * this.w * 0.34 + 6
  }

  private scallop(y: number, wave: Wave) {
    return 1 + 0.14 * Math.sin(y * 0.05 + wave.seed + this.time * 0.7)
  }

  private draw() {
    const { ctx, w, h, palette: p } = this
    ctx.clearRect(0, 0, w, h)

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.4)
    sky.addColorStop(0, p.skyTop)
    sky.addColorStop(0.7, p.skyMid)
    sky.addColorStop(1, p.sand)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    if (this.night) this.drawStars()
    else this.drawClouds()
    this.drawIslands()

    // Sand base
    ctx.fillStyle = p.sand
    ctx.fillRect(0, h * 0.12, w, h)

    const shore = this.sampleShore()

    // Water body (stable tide line)
    this.fillRightOf(shore, this.waterGradient())

    // Soft depth bands
    this.drawDepthBands(shore)

    // Wet sand from active runups
    this.drawWetSand(shore)

    // Approaching swells + wash tongues
    for (const wave of this.waves) {
      this.drawSwell(shore, wave)
      this.drawWash(shore, wave)
    }

    // Soft watercolor water edge (multiple translucent offsets).
    for (let i = 0; i < 5; i += 1) {
      const offset = 3 + i * 3.5
      this.ctx.beginPath()
      this.ctx.moveTo(shore[0].x - offset, shore[0].y)
      for (const p of shore) {
        const n = 2 * Math.sin(p.y * 0.05 + this.time * 0.4 + i)
        this.ctx.lineTo(p.x - offset + n, p.y)
      }
      this.ctx.strokeStyle = this.palette.waterLight
      this.ctx.globalAlpha = 0.1
      this.ctx.lineWidth = 6
      this.ctx.stroke()
    }
    this.ctx.globalAlpha = 1

    // Persistent shore foam ribbon
    this.strokePolyline(shore, p.foam, 0.4, 18)
    this.strokePolyline(shore, p.foam, 0.9, 4.5)

    // Foam particles
    this.drawParticles()
  }

  private sampleShore() {
    const pts: { x: number; y: number }[] = []
    for (let y = 0; y <= this.h; y += 3) {
      pts.push({ x: shoreX(y, this.h, this.w, this.shown), y })
    }
    return pts
  }

  private waterGradient() {
    const g = this.ctx.createLinearGradient(this.w * 0.2, 0, this.w, this.h * 0.15)
    g.addColorStop(0, this.palette.waterLight)
    g.addColorStop(0.45, this.palette.water)
    g.addColorStop(1, this.palette.waterDeep)
    return g
  }

  private fillRightOf(shore: { x: number; y: number }[], fill: string | CanvasGradient) {
    const { ctx, w, h } = this
    ctx.beginPath()
    ctx.moveTo(w, 0)
    ctx.lineTo(shore[0].x, shore[0].y)
    for (const p of shore) ctx.lineTo(p.x, p.y)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }

  private drawDepthBands(shore: { x: number; y: number }[]) {
    const bands = [
      { push: 0.09, color: this.palette.waterLight, a: 0.28 },
      { push: 0.2, color: this.palette.water, a: 0.16 },
    ]
    for (const b of bands) {
      this.ctx.beginPath()
      this.ctx.moveTo(this.w, 0)
      for (const p of shore) this.ctx.lineTo(p.x + this.w * b.push, p.y)
      this.ctx.lineTo(this.w, this.h)
      this.ctx.closePath()
      this.ctx.globalAlpha = b.a
      this.ctx.fillStyle = b.color
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  private drawWetSand(shore: { x: number; y: number }[]) {
    let reach = this.w * 0.02
    for (const wave of this.waves) reach = Math.max(reach, this.runup(wave) * 0.85)
    if (reach < 2) return
    this.ctx.beginPath()
    this.ctx.moveTo(shore[0].x, shore[0].y)
    for (const p of shore) this.ctx.lineTo(p.x, p.y)
    for (let i = shore.length - 1; i >= 0; i -= 1) {
      this.ctx.lineTo(shore[i].x - reach, shore[i].y)
    }
    this.ctx.closePath()
    this.ctx.globalAlpha = 0.28
    this.ctx.fillStyle = this.palette.waterLight
    this.ctx.fill()
    this.ctx.globalAlpha = 1
  }

  private drawSwell(shore: { x: number; y: number }[], wave: Wave) {
    const dist = this.approachDist(wave)
    if (dist < 0) return
    const alpha =
      wave.phase === 'approach'
        ? 0.08 + 0.28 * wave.t
        : wave.phase === 'break'
          ? 0.28 * (1 - wave.t)
          : 0
    if (alpha < 0.03) return

    this.ctx.beginPath()
    for (let i = 0; i < shore.length; i += 1) {
      const p = shore[i]
      const wobble =
        10 * Math.sin(p.y * 0.032 + this.time * 1.6 + wave.seed) +
        5 * Math.sin(p.y * 0.07 + wave.yBias * 10)
      const x = p.x + dist + wobble
      if (i === 0) this.ctx.moveTo(x, p.y)
      else this.ctx.lineTo(x, p.y)
    }
    // Soft white swell ridge (not dark ink lines).
    this.ctx.strokeStyle = this.palette.foam
    this.ctx.globalAlpha = alpha
    this.ctx.lineWidth = 18 + 14 * wave.reach
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    this.ctx.stroke()
    this.ctx.globalAlpha = alpha * 0.7
    this.ctx.lineWidth = 5 + 4 * wave.reach
    this.ctx.stroke()
    this.ctx.globalAlpha = 1
  }

  private drawWash(shore: { x: number; y: number }[], wave: Wave) {
    const run = this.runup(wave)
    if (run < 1.5) return

    const strength =
      wave.phase === 'break'
        ? 0.45 + 0.5 * Math.sin(Math.min(1, wave.t) * Math.PI)
        : 0.25 + 0.3 * (1 - wave.t)

    // Water tongue onto sand
    this.ctx.beginPath()
    this.ctx.moveTo(shore[0].x, shore[0].y)
    for (const p of shore) this.ctx.lineTo(p.x, p.y)
    for (let i = shore.length - 1; i >= 0; i -= 1) {
      const p = shore[i]
      this.ctx.lineTo(p.x - run * this.scallop(p.y, wave), p.y)
    }
    this.ctx.closePath()
    this.ctx.globalAlpha = 0.28 + 0.28 * strength
    this.ctx.fillStyle = this.palette.waterLight
    this.ctx.fill()
    this.ctx.globalAlpha = 1

    // Soft foam bloom behind the front
    this.ctx.beginPath()
    for (let i = 0; i < shore.length; i += 1) {
      const p = shore[i]
      const x = p.x - run * this.scallop(p.y, wave) * 0.55
      if (i === 0) this.ctx.moveTo(x, p.y)
      else this.ctx.lineTo(x, p.y)
    }
    this.ctx.strokeStyle = this.palette.foam
    this.ctx.globalAlpha = 0.25 * strength
    this.ctx.lineWidth = 28
    this.ctx.lineJoin = 'round'
    this.ctx.stroke()

    // Bright foam front
    this.ctx.beginPath()
    for (let i = 0; i < shore.length; i += 1) {
      const p = shore[i]
      const x = p.x - run * this.scallop(p.y, wave)
      if (i === 0) this.ctx.moveTo(x, p.y)
      else this.ctx.lineTo(x, p.y)
    }
    this.ctx.globalAlpha = 0.55 * strength
    this.ctx.lineWidth = 14
    this.ctx.stroke()
    this.ctx.globalAlpha = 0.95 * strength
    this.ctx.lineWidth = 4
    this.ctx.stroke()
    this.ctx.globalAlpha = 1
  }

  private drawParticles() {
    const { ctx, palette: p } = this
    for (const part of this.particles) {
      const a = 1 - part.life / part.maxLife
      ctx.globalAlpha = a * 0.75
      ctx.fillStyle = p.foam
      ctx.beginPath()
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private strokePolyline(
    shore: { x: number; y: number }[],
    color: string,
    alpha: number,
    width: number,
  ) {
    this.ctx.beginPath()
    this.ctx.moveTo(shore[0].x, shore[0].y)
    for (const p of shore) this.ctx.lineTo(p.x, p.y)
    this.ctx.strokeStyle = color
    this.ctx.globalAlpha = alpha
    this.ctx.lineWidth = width
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    this.ctx.stroke()
    this.ctx.globalAlpha = 1
  }

  private drawClouds() {
    const drift = Math.sin(this.time * 0.08) * 10
    this.ctx.fillStyle = this.palette.cloud
    this.puff(this.w * 0.16 + drift, this.h * 0.07, 50, 13)
    this.puff(this.w * 0.28 + drift, this.h * 0.062, 28, 9)
    this.puff(this.w * 0.52 - drift * 0.6, this.h * 0.09, 38, 11)
  }

  private puff(x: number, y: number, rx: number, ry: number) {
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawStars() {
    const stars = [
      [0.12, 0.07],
      [0.24, 0.05],
      [0.38, 0.08],
      [0.54, 0.055],
      [0.7, 0.075],
      [0.82, 0.045],
    ]
    for (const [nx, ny] of stars) {
      this.ctx.globalAlpha = 0.55 + 0.45 * Math.sin(this.time * 1.5 + nx * 10)
      this.ctx.fillStyle = '#f3f7fb'
      this.ctx.beginPath()
      this.ctx.arc(nx * this.w, ny * this.h, 1.3, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  private drawIslands() {
    this.ctx.globalAlpha = this.night ? 0.4 : 0.55
    this.ctx.fillStyle = this.palette.island
    this.ctx.beginPath()
    this.ctx.ellipse(this.w * 0.74, this.h * 0.145, 76, 16, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.globalAlpha = this.night ? 0.3 : 0.4
    this.ctx.beginPath()
    this.ctx.ellipse(this.w * 0.86, this.h * 0.162, 40, 11, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.globalAlpha = 1

    if (this.night) {
      this.ctx.fillStyle = '#f3f6ea'
      this.ctx.beginPath()
      this.ctx.arc(this.w * 0.78, this.h * 0.1, 17, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.fillStyle = this.palette.skyTop
      this.ctx.beginPath()
      this.ctx.arc(this.w * 0.805, this.h * 0.09, 17, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
}

function easeOutCubic(t: number) {
  const u = Math.min(1, Math.max(0, t))
  return 1 - (1 - u) ** 3
}

function easeInCubic(t: number) {
  const u = Math.min(1, Math.max(0, t))
  return u ** 3
}
