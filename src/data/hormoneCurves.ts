export type HormoneId =
  | 'estrogen'
  | 'progesterone'
  | 'testosterone'
  | 'lh'
  | 'fsh'

export type HormoneMeta = {
  id: HormoneId
  label: string
  color: string
  colorLight: string
  colorDeep: string
  shadow: string
  fillOpacity: number
}

/**
 * Luminous paper-sea palette — bright tide pastels, aligned with MoonWave tokens.
 * Translucent layers; mid tones carry hue, lights stay airy.
 */
export const HORMONE_SERIES: HormoneMeta[] = [
  {
    id: 'estrogen',
    label: '雌激素',
    color: '#f0a0b4',
    colorLight: '#fff2f6',
    colorDeep: '#d87090',
    shadow: 'rgba(240, 130, 160, 0.22)',
    fillOpacity: 0.38,
  },
  {
    id: 'progesterone',
    label: '孕激素',
    color: '#f0c868',
    colorLight: '#fff8e8',
    colorDeep: '#d8a840',
    shadow: 'rgba(240, 190, 80, 0.2)',
    fillOpacity: 0.36,
  },
  {
    id: 'testosterone',
    label: '睾酮',
    color: '#84c8f0',
    colorLight: '#eaf6fd',
    colorDeep: '#5aa8d8',
    shadow: 'rgba(90, 180, 235, 0.2)',
    fillOpacity: 0.34,
  },
  {
    id: 'lh',
    label: '黄体生成素',
    color: '#c4acf0',
    colorLight: '#f3edfc',
    colorDeep: '#9c80d0',
    shadow: 'rgba(170, 140, 235, 0.18)',
    fillOpacity: 0.33,
  },
  {
    id: 'fsh',
    label: '促卵泡激素',
    color: '#88d8b4',
    colorLight: '#eafaf2',
    colorDeep: '#58b890',
    shadow: 'rgba(110, 210, 165, 0.18)',
    fillOpacity: 0.33,
  },
]

function gaussian(day: number, center: number, width: number, amp: number) {
  const x = (day - center) / width
  return amp * Math.exp(-0.5 * x * x)
}

export function hormoneLevel(id: HormoneId, day: number): number {
  const d = Math.min(28, Math.max(1, day))
  switch (id) {
    case 'estrogen':
      return (
        0.12 +
        (d <= 5 ? 0.06 : 0.22) +
        gaussian(d, 12.5, 4.2, 0.72) +
        gaussian(d, 21, 5.5, 0.48)
      )
    case 'progesterone':
      return 0.08 + gaussian(d, 8, 6, 0.08) + gaussian(d, 22, 5.5, 0.92)
    case 'testosterone':
      return 0.18 + gaussian(d, 10, 5.5, 0.52)
    case 'lh':
      return 0.06 + gaussian(d, 14, 1.05, 1)
    case 'fsh':
      return 0.1 + gaussian(d, 5, 3.2, 0.62) + gaussian(d, 13.5, 1.4, 0.32)
    default:
      return 0
  }
}

function hormoneMax(id: HormoneId, cycleLength: number, samples = 160) {
  let max = 0.001
  for (let i = 0; i <= samples; i += 1) {
    const day = 1 + (i / samples) * (cycleLength - 1)
    max = Math.max(max, hormoneLevel(id, day))
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
  samples = 160,
): PlotPoint[] {
  const { width, padX, padY, plotH } = layout
  const plotW = width - padX * 2
  const ceiling = hormoneMax(id, cycleLength, samples)
  const floor = 0.08
  const span = 0.84

  return Array.from({ length: samples + 1 }, (_, i) => {
    const day = 1 + (i / samples) * (cycleLength - 1)
    const raw = hormoneLevel(id, day) / ceiling
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
