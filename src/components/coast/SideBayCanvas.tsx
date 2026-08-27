import { readCssPalette } from '@/components/coast/game/palette'
import { SideBayEngine } from '@/components/coast/game/SideBayEngine'
import { DayModes, type DayMode } from '@/domain/types'
import { useEffect, useRef } from 'react'
import styles from './SideBayCanvas.module.css'

/** Side-view bay rendered with a Canvas game loop (swells + foam particles). */
export function SideBayCanvas({
  mode,
  coverage,
}: {
  mode: DayMode
  coverage: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SideBayEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const engine = new SideBayEngine(canvas, ctx, readCssPalette(canvas))
    engineRef.current = engine
    engine.setCoverage(coverage)
    engine.setNight(mode === DayModes.night)
    engine.setPalette(readCssPalette(canvas))
    engine.start()

    const ro = new ResizeObserver(() => engine.fit())
    ro.observe(canvas)

    return () => {
      ro.disconnect()
      engine.dispose()
      if (engineRef.current === engine) engineRef.current = null
    }
  }, [mode])

  useEffect(() => {
    engineRef.current?.setCoverage(coverage)
  }, [coverage])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.setNight(mode === DayModes.night)
    engine.setPalette(readCssPalette(canvasRef.current ?? document.documentElement))
  }, [mode])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
