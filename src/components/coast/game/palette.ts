export type TidePalette = {
  skyTop: string
  skyMid: string
  sand: string
  sandDeep: string
  waterLight: string
  water: string
  waterDeep: string
  foam: string
  island: string
  cloud: string
  inkFaint: string
  tideDeep: string
}

export function readCssPalette(el: Element): TidePalette {
  const s = getComputedStyle(el)
  const v = (name: string) => s.getPropertyValue(name).trim()
  return {
    skyTop: v('--coast-sky-top') || '#a8d7f0',
    skyMid: v('--coast-sky-mid') || '#cfeaf8',
    sand: v('--coast-sand') || '#f8fcff',
    sandDeep: v('--sand') || '#eef5fa',
    waterLight: v('--coast-water-light') || '#b6dff4',
    water: v('--coast-water') || '#84c4ea',
    waterDeep: v('--coast-water-deep') || '#5fafdf',
    foam: v('--coast-foam') || '#ffffff',
    island: v('--coast-island') || '#b7d8ea',
    cloud: v('--coast-cloud') || 'rgba(255,255,255,0.75)',
    inkFaint: v('--ink-faint') || '#a8c0d0',
    tideDeep: v('--tide-deep') || '#6aa9dc',
  }
}
