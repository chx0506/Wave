import { DayModes, type DayMode } from '@/domain/types'
import { paintTideScene, readTidePalette } from '@/components/coast/tideScene'
import { useEffect, useRef } from 'react'
import styles from './IllustratedTide.module.css'

export function IllustratedTide({
  mode,
  coverage,
}: {
  mode: DayMode
  coverage: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coverageRef = useRef(coverage)

  useEffect(() => {
    coverageRef.current = coverage
  }, [coverage])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let shown = coverageRef.current
    let frame = 0
    let running = true
    const born = performance.now()

    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      if (!running) return
      const rect = canvas.getBoundingClientRect()
      const animate = !reduce.matches
      const target = coverageRef.current
      shown += (target - shown) * (animate ? 0.045 : 1)
      const time = animate ? (now - born) / 1000 : 0
      paintTideScene(
        ctx,
        rect.width,
        rect.height,
        shown,
        time,
        mode === DayModes.night,
        readTidePalette(canvas),
        animate,
      )
      frame = requestAnimationFrame(draw)
    }

    fit()
    frame = requestAnimationFrame(draw)
    const ro = new ResizeObserver(() => fit())
    ro.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [mode])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
