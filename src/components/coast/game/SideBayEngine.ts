import type { TidePalette } from './palette'

type SwellPhase = 'travel' | 'break' | 'retreat' | 'wait'

type Swell = {
  phase: SwellPhase
  x: number
  t: number
  wait: number
  amp: number
  speed: number
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

type Cloud = { x: number; y: number; rx: number; ry: number; drift: number; seed: number }

/** Side-view bay: water height = tide coverage; surf entities wash the sand. */
export class SideBayEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private palette: TidePalette
  private swells: Swell[] = []
  private particles: Particle[] = []
  private clouds: Cloud[] = []
  private time = 0
  private shown = 0.4
  private coverage = 0.4
  private night = false
  private animate = true
  private reduce: MediaQueryList
  private onReduce: () => void
  private raf = 0
  private running = false
  private last = 0
  private dpr = 1
  private w = 1
  private h = 1

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, palette: TidePalette) {
    this.canvas = canvas
    this.ctx = ctx
    this.palette = palette
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.animate = !this.reduce.matches
    this.onReduce = () => {
      this.animate = !this.reduce.matches
    }
    this.reduce.addEventListener('change', this.onReduce)
    this.resetSwells()
    this.resetClouds()
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

  dispose() {
    this.running = false
    cancelAnimationFrame(this.raf)
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

  private resetSwells() {
    this.swells = [
      { phase: 'break', x: 0.52, t: 0.3, wait: 0, amp: 1, speed: 0.11, seed: 1.2 },
      { phase: 'travel', x: 0.28, t: 0, wait: 0, amp: 0.85, speed: 0.09, seed: 2.8 },
      { phase: 'wait', x: 0.15, t: 0, wait: 1.1, amp: 0.7, speed: 0.1, seed: 4.1 },
    ]
  }

  private resetClouds() {
    this.clouds = [
      { x: 0.22, y: 0.11, rx: 46, ry: 13, drift: 0.012, seed: 1.1 },
      { x: 0.58, y: 0.08, rx: 38, ry: 11, drift: -0.009, seed: 2.4 },
      { x: 0.4, y: 0.15, rx: 28, ry: 9, drift: 0.007, seed: 3.7 },
    ]
  }

  private waterBaseY(): number {
    const low = this.h * 0.74
    const high = this.h * 0.42
    const t = Math.min(1, Math.max(0, (this.shown - 0.1) / 0.9))
    return low - t * (low - high)
  }

  private surfaceY(x: number, baseY: number): number {
    const t = this.time
    let y =
      baseY +
      5 * Math.sin(x * 0.016 + t * 1.35) +
      3.2 * Math.sin(x * 0.028 - t * 1.05 + 1.4) +
      1.8 * Math.sin(x * 0.052 + t * 0.75 + 0.6)

    for (const swell of this.swells) {
      y -= this.swellLift(x, swell)
    }
    return y
  }

  private swellLift(x: number, swell: Swell): number {
    const cx = swell.x * this.w
    const sigma = this.w * 0.09
    const g = Math.exp(-((x - cx) ** 2) / (2 * sigma * sigma))
    let m = 0
    if (swell.phase === 'travel') m = 0.35 + 0.45 * swell.t
    else if (swell.phase === 'break') m = 0.75 + 0.55 * Math.sin(Math.min(1, swell.t) * Math.PI)
    else if (swell.phase === 'retreat') m = 0.6 * (1 - swell.t)
    return swell.amp * g * m * 22
  }

  private tick(dt: number) {
    this.fit()
    const blend = this.animate ? 1 - Math.exp(-dt * 3) : 1
    this.shown += (this.coverage - this.shown) * blend
    if (!this.animate) return
    this.time += dt

    for (const c of this.clouds) {
      c.x += c.drift * dt
      if (c.x < -0.1) c.x = 1.05
      if (c.x > 1.1) c.x = -0.05
    }

    for (const swell of this.swells) this.stepSwell(swell, dt)
    this.stepParticles(dt)
  }

  private stepSwell(swell: Swell, dt: number) {
    if (swell.phase === 'wait') {
      swell.wait -= dt
      if (swell.wait <= 0) {
        swell.phase = 'travel'
        swell.x = 0.12 + swell.seed * 0.03
        swell.t = 0
      }
      return
    }

    if (swell.phase === 'travel') {
      swell.x += swell.speed * dt
      swell.t = (swell.x - 0.12) / 0.38
      if (swell.x >= 0.48) {
        swell.phase = 'break'
        swell.t = 0
      }
      return
    }

    if (swell.phase === 'break') {
      swell.t += dt * 1.6
      if (swell.t > 0.12 && swell.t < 0.65 && Math.random() < dt * 14) {
        this.emitFoam(swell)
      }
      if (swell.t >= 1) {
        swell.phase = 'retreat'
        swell.t = 0
      }
      return
    }

    swell.t += dt * 1.2
    swell.x -= swell.speed * 0.35 * dt
    if (swell.t >= 1) {
      swell.phase = 'wait'
      swell.wait = 0.6 + swell.seed * 0.25
      swell.t = 0
    }
  }

  private emitFoam(swell: Swell) {
    if (this.particles.length > 180) return
    const cx = swell.x * this.w
    const baseY = this.waterBaseY()
    const count = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i += 1) {
      const x = cx + (Math.random() - 0.5) * this.w * 0.14
      const y = this.surfaceY(x, baseY) + Math.random() * 8
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 28,
        vy: 8 + Math.random() * 22,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.7,
        size: 1.4 + Math.random() * 2.8,
      })
    }
  }

  private stepParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i]
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 18 * dt
      p.vx *= 0.97
      if (p.life >= p.maxLife) this.particles.splice(i, 1)
    }
  }

  private sampleSurface(baseY: number, step = 3) {
    const pts: { x: number; y: number }[] = []
    for (let x = 0; x <= this.w; x += step) pts.push({ x, y: this.surfaceY(x, baseY) })
    if (pts[pts.length - 1].x < this.w) pts.push({ x: this.w, y: this.surfaceY(this.w, baseY) })
    return pts
  }

  private draw() {
    const { ctx, w, h, palette: p } = this
    ctx.clearRect(0, 0, w, h)

    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55)
    sky.addColorStop(0, p.skyTop)
    sky.addColorStop(0.55, p.skyMid)
    sky.addColorStop(1, p.skyMid)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    if (this.night) this.drawNightSky()
    this.drawClouds()
    this.drawHeadlands()

    const baseY = this.waterBaseY()
    const surface = this.sampleSurface(baseY)

    this.drawSand()
    this.drawWetSand(surface)
    this.drawWater(surface, baseY)
    this.drawSwellWash(baseY)
    this.drawShimmer(baseY)
    this.drawSurfaceFoam(surface)
    this.drawParticles()
    this.drawTideStaff(baseY)
  }

  private drawClouds() {
    if (this.night) return
    const { ctx, palette: p } = this
    ctx.fillStyle = p.cloud
    for (const c of this.clouds) {
      const x = c.x * this.w
      const bob = Math.sin(this.time * 0.4 + c.seed) * 2
      ctx.beginPath()
      ctx.ellipse(x, c.y * this.h + bob, c.rx, c.ry, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + c.rx * 0.45, c.y * this.h + bob - 2, c.rx * 0.55, c.ry * 0.75, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawNightSky() {
    const stars = [
      [0.14, 0.06],
      [0.32, 0.04],
      [0.48, 0.07],
      [0.66, 0.05],
      [0.8, 0.08],
    ]
    for (const [nx, ny] of stars) {
      this.ctx.globalAlpha = 0.45 + 0.5 * Math.sin(this.time * 1.8 + nx * 12)
      this.ctx.fillStyle = '#eef4fa'
      this.ctx.beginPath()
      this.ctx.arc(nx * this.w, ny * this.h, 1.2, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  private drawHeadlands() {
    const { ctx, w, h, palette: p } = this
    const a = this.night ? 0.42 : 0.58

    ctx.globalAlpha = a
    ctx.fillStyle = p.island
    ctx.beginPath()
    ctx.moveTo(0, h * 0.36)
    ctx.bezierCurveTo(w * 0.1, h * 0.28, w * 0.18, h * 0.3, w * 0.28, h * 0.38)
    ctx.lineTo(w * 0.28, h * 0.58)
    ctx.lineTo(0, h * 0.58)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(w, h * 0.34)
    ctx.bezierCurveTo(w * 0.9, h * 0.26, w * 0.82, h * 0.29, w * 0.72, h * 0.37)
    ctx.lineTo(w * 0.72, h * 0.58)
    ctx.lineTo(w, h * 0.58)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  private drawSand() {
    const { ctx, w, h, palette: p } = this
    const g = ctx.createLinearGradient(0, h * 0.55, 0, h)
    g.addColorStop(0, p.sand)
    g.addColorStop(1, p.sandDeep)

    ctx.beginPath()
    ctx.moveTo(0, h * 0.58)
    ctx.bezierCurveTo(w * 0.14, h * 0.54, w * 0.28, h * 0.62, w * 0.5, h * 0.595)
    ctx.bezierCurveTo(w * 0.72, h * 0.57, w * 0.86, h * 0.64, w, h * 0.6)
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = g
    ctx.fill()
  }

  private drawWetSand(surface: { x: number; y: number }[]) {
    const beachY = this.h * 0.58
    const { ctx, w, palette: p } = this

    ctx.beginPath()
    let started = false
    for (const pt of surface) {
      if (pt.y >= beachY - 2) {
        if (!started) {
          ctx.moveTo(pt.x, pt.y)
          started = true
        } else ctx.lineTo(pt.x, pt.y)
      }
    }
    if (!started) return

    for (let x = w; x >= 0; x -= 3) {
      const t = x / w
      const by =
        beachY +
        4 * Math.sin(t * Math.PI * 2 + 0.3) * (t > 0.28 && t < 0.72 ? 0.5 : 0.2)
      ctx.lineTo(x, by)
    }
    ctx.closePath()
    ctx.globalAlpha = 0.22
    ctx.fillStyle = p.waterLight
    ctx.fill()
    ctx.globalAlpha = 1
  }

  private drawWater(surface: { x: number; y: number }[], baseY: number) {
    const { ctx, w, h, palette: p } = this

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, h * 0.28)
    ctx.bezierCurveTo(w * 0.18, h * 0.34, w * 0.22, h * 0.52, w * 0.34, h * 0.58)
    ctx.lineTo(w * 0.66, h * 0.58)
    ctx.bezierCurveTo(w * 0.78, h * 0.52, w * 0.82, h * 0.34, w, h * 0.28)
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.clip()

    ctx.beginPath()
    ctx.moveTo(surface[0].x, surface[0].y)
    for (const pt of surface) ctx.lineTo(pt.x, pt.y)
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()

    const wg = ctx.createLinearGradient(0, baseY - 40, 0, h)
    wg.addColorStop(0, p.waterLight)
    wg.addColorStop(0.35, p.water)
    wg.addColorStop(1, p.waterDeep)
    ctx.fillStyle = wg
    ctx.fill()

    ctx.restore()
  }

  private drawSwellWash(baseY: number) {
    const { ctx, w, h, palette: p } = this
    const beachY = h * 0.58

    for (const swell of this.swells) {
      if (swell.phase !== 'break' && swell.phase !== 'retreat') continue
      const strength = swell.phase === 'break' ? 1 - swell.t * 0.35 : 0.45 * (1 - swell.t)
      if (strength < 0.08) continue

      const cx = swell.x * w
      const reach = 22 + swell.amp * 28 * strength
      const half = w * 0.11

      ctx.beginPath()
      for (let x = cx - half; x <= cx + half; x += 4) {
        const sy = this.surfaceY(x, baseY)
        if (x === cx - half) ctx.moveTo(x, sy)
        else ctx.lineTo(x, sy)
      }
      for (let x = cx + half; x >= cx - half; x -= 4) {
        ctx.lineTo(x, Math.min(beachY + 18, this.surfaceY(x, baseY) + reach))
      }
      ctx.closePath()
      ctx.globalAlpha = 0.18 + 0.22 * strength
      ctx.fillStyle = p.waterLight
      ctx.fill()

      ctx.beginPath()
      for (let x = cx - half; x <= cx + half; x += 4) {
        const sy = this.surfaceY(x, baseY)
        if (x === cx - half) ctx.moveTo(x, sy)
        else ctx.lineTo(x, sy)
      }
      ctx.strokeStyle = p.foam
      ctx.globalAlpha = 0.35 * strength
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }

  private drawShimmer(baseY: number) {
    const { ctx, w, palette: p } = this
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, baseY, w, this.h - baseY)
    ctx.clip()
    ctx.globalAlpha = 0.07
    ctx.strokeStyle = p.foam
    ctx.lineWidth = 1.2
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath()
      const yOff = baseY + 30 + i * 38 + Math.sin(this.time * 0.8 + i) * 4
      for (let x = 0; x <= w; x += 8) {
        const y = yOff + 3 * Math.sin(x * 0.04 + this.time * 1.1 + i * 1.7)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  private drawSurfaceFoam(surface: { x: number; y: number }[]) {
    const { ctx, palette: p } = this
    ctx.beginPath()
    ctx.moveTo(surface[0].x, surface[0].y)
    for (const pt of surface) ctx.lineTo(pt.x, pt.y)
    ctx.strokeStyle = p.foam
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 10
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.globalAlpha = 0.92
    ctx.lineWidth = 2.8
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  private drawParticles() {
    const { ctx, palette: p } = this
    for (const part of this.particles) {
      const a = 1 - part.life / part.maxLife
      ctx.globalAlpha = a * 0.8
      ctx.fillStyle = p.foam
      ctx.beginPath()
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawTideStaff(baseY: number) {
    const { ctx, w, h, palette: p } = this
    const x0 = w * 0.05
    const highY = h * 0.42
    const lowY = h * 0.74

    ctx.globalAlpha = 0.55
    ctx.strokeStyle = p.inkFaint
    ctx.lineWidth = 1
    ctx.font = '500 10px var(--font-ui, sans-serif)'
    ctx.fillStyle = p.inkFaint

    ctx.beginPath()
    ctx.moveTo(x0, highY)
    ctx.lineTo(x0 + w * 0.05, highY)
    ctx.stroke()
    ctx.fillText('高潮', x0 + w * 0.055, highY + 4)

    ctx.beginPath()
    ctx.moveTo(x0, lowY)
    ctx.lineTo(x0 + w * 0.05, lowY)
    ctx.stroke()
    ctx.fillText('低潮', x0 + w * 0.055, lowY + 4)

    ctx.globalAlpha = 1
    ctx.strokeStyle = p.tideDeep
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x0 - w * 0.01, baseY)
    ctx.lineTo(x0 + w * 0.07, baseY)
    ctx.stroke()
  }
}
