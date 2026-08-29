import type { CycleConfig } from '@/domain/types'

export type HormoneId = 'estrogen' | 'progesterone' | 'lh' | 'fsh'

export type HormoneMeta = {
  id: HormoneId
  label: string
  shortLabel: string
  color: string
  colorLight: string
  colorDeep: string
  shadow: string
  colorSoft: string
  fillOpacity: number
  explain: string
}

/**
 * Luminous paper-sea palette — translucent tide pastels.
 */
export const HORMONE_SERIES: HormoneMeta[] = [
  {
    id: 'estrogen',
    label: '雌激素',
    shortLabel: 'E2',
    color: '#f0a0b4',
    colorLight: '#fff2f6',
    colorDeep: '#d87090',
    shadow: 'rgba(240, 130, 160, 0.22)',
    colorSoft: 'rgba(240, 160, 180, 0.14)',
    fillOpacity: 0.38,
    explain:
      '卵泡期逐渐升高，在排卵前达到高峰，可促进子宫内膜增生；排卵后略有波动，在黄体期维持中等水平。',
  },
  {
    id: 'progesterone',
    label: '孕酮',
    shortLabel: 'P4',
    color: '#f0c868',
    colorLight: '#fff8e8',
    colorDeep: '#d8a840',
    shadow: 'rgba(240, 190, 80, 0.2)',
    colorSoft: 'rgba(240, 200, 100, 0.14)',
    fillOpacity: 0.36,
    explain:
      '排卵后由黄体分泌，水平显著升高，为子宫内膜分泌期做好准备；若未受孕，黄体退化，孕酮下降。',
  },
  {
    id: 'lh',
    label: '黄体生成素',
    shortLabel: 'LH',
    color: '#c4acf0',
    colorLight: '#f3edfc',
    colorDeep: '#9c80d0',
    shadow: 'rgba(170, 140, 235, 0.18)',
    colorSoft: 'rgba(180, 150, 230, 0.14)',
    fillOpacity: 0.33,
    explain:
      '排卵前出现短暂而剧烈的高峰，触发卵泡破裂和排卵；随后迅速下降，维持较低水平。',
  },
  {
    id: 'fsh',
    label: '促卵泡激素',
    shortLabel: 'FSH',
    color: '#88d8b4',
    colorLight: '#eafaf2',
    colorDeep: '#58b890',
    shadow: 'rgba(110, 210, 165, 0.18)',
    colorSoft: 'rgba(100, 210, 170, 0.14)',
    fillOpacity: 0.33,
    explain:
      '月经早期略有升高，促进卵泡发育；排卵前有小幅上升；之后在黄体期维持较低水平。',
  },
]

export const HORMONE_DISCLAIMER =
  '图示为典型周期的激素变化趋势，个体可能存在差异。'

type PhaseBounds = {
  menstrualEnd: number
  follicularEnd: number
  ovulatoryEnd: number
  cycleLength: number
  ovCenter: number
  lutealMid: number
}

const DEFAULT_BOUNDS: PhaseBounds = {
  menstrualEnd: 5,
  follicularEnd: 13,
  ovulatoryEnd: 15,
  cycleLength: 28,
  ovCenter: 14,
  lutealMid: 21.5,
}

export function phaseBoundsFromConfig(config?: CycleConfig): PhaseBounds {
  if (!config) return DEFAULT_BOUNDS
  const { menstrual, follicular, ovulatory, luteal } = config.phaseWindows
  const menstrualEnd = menstrual
  const follicularEnd = menstrual + follicular
  const ovulatoryEnd = follicularEnd + ovulatory
  return {
    menstrualEnd,
    follicularEnd,
    ovulatoryEnd,
    cycleLength: config.cycleLength,
    ovCenter: follicularEnd + ovulatory / 2,
    lutealMid: ovulatoryEnd + luteal / 2,
  }
}

function gaussian(day: number, center: number, width: number, amp: number) {
  const x = (day - center) / Math.max(0.35, width)
  return amp * Math.exp(-0.5 * x * x)
}

export function hormoneLevel(
  id: HormoneId,
  day: number,
  config?: CycleConfig,
): number {
  const b = phaseBoundsFromConfig(config)
  const d = Math.min(b.cycleLength, Math.max(1, day))
  const estrogenPeak = Math.max(b.menstrualEnd + 2, b.ovCenter - 1.2)
  const estrogenSecond = b.lutealMid

  switch (id) {
    case 'estrogen':
      return (
        0.12 +
        gaussian(d, estrogenPeak, Math.max(2.8, b.follicularEnd - b.menstrualEnd) * 0.42, 0.72) +
        gaussian(d, estrogenSecond, Math.max(3.2, (b.cycleLength - b.ovulatoryEnd) * 0.28), 0.48)
      )
    case 'progesterone':
      return (
        0.08 +
        (d <= b.ovCenter
          ? 0.02
          : gaussian(
              d,
              b.lutealMid,
              Math.max(3.5, (b.cycleLength - b.ovulatoryEnd) * 0.32),
              0.92,
            ))
      )
    case 'lh':
      return 0.06 + gaussian(d, b.ovCenter, 1.05, 1)
    case 'fsh':
      return (
        0.1 +
        gaussian(d, Math.max(2.5, b.menstrualEnd * 0.55), 3.2, 0.62) +
        gaussian(d, b.ovCenter, 1.4, 0.32)
      )
    default:
      return 0
  }
}

function hormoneMax(
  id: HormoneId,
  cycleLength: number,
  config?: CycleConfig,
  samples = 160,
) {
  let max = 0.001
  for (let i = 0; i <= samples; i += 1) {
    const day = 1 + (i / samples) * (cycleLength - 1)
    max = Math.max(max, hormoneLevel(id, day, config))
  }
  return max
}

export type PlotPoint = { x: number; y: number; day: number; value: number }

export function hormonePlotPoints(
  id: HormoneId,
  cycleLength: number,
  layout: {
    width: number
    padX: number
    padY: number
    plotH: number
  },
  config?: CycleConfig,
  samples = 160,
): PlotPoint[] {
  const { width, padX, padY, plotH } = layout
  const plotW = width - padX * 2
  const ceiling = hormoneMax(id, cycleLength, config, samples)
  const floor = 0.08
  const span = 0.84

  return Array.from({ length: samples + 1 }, (_, i) => {
    const day = 1 + (i / samples) * (cycleLength - 1)
    const raw = hormoneLevel(id, day, config) / ceiling
    const value = floor + raw * span
    return {
      day,
      value,
      x: padX + ((day - 1) / Math.max(1, cycleLength - 1)) * plotW,
      y: padY + (1 - value) * plotH,
    }
  })
}

export function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  }
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`
  }

  const parts = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`]

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    parts.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    )
  }

  return parts.join(' ')
}

export function paperLayerPath(
  points: { x: number; y: number }[],
  baselineY: number,
): string {
  const crest = catmullRomPath(points)
  if (!crest || points.length === 0) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${crest} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`
}
