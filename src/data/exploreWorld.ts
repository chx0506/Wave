import type { ExploreIsland } from '@/data/content'

/** Pixel size of the sail-able paper sea. */
export const WORLD_W = 2400
export const WORLD_H = 3000

export const ISLAND_ART: Record<ExploreIsland['id'], string> = {
  pain: '/textures/explore/islands/pain.png',
  relief: '/textures/explore/islands/relief.png',
  nutrition: '/textures/explore/islands/nutrition.png',
  move: '/textures/explore/islands/move.png',
  disease: '/textures/explore/islands/disease.png',
  sleep: '/textures/explore/islands/sleep.png',
  mood: '/textures/explore/islands/mood.png',
}

/** Island anchors in world pixels (center of sprite). Spread for sailing. */
export const ISLAND_WORLD: Record<
  ExploreIsland['id'],
  { x: number; y: number; scale: number }
> = {
  pain: { x: 520, y: 620, scale: 0.92 },
  sleep: { x: 1480, y: 480, scale: 0.88 },
  mood: { x: 1980, y: 980, scale: 0.9 },
  relief: { x: 1180, y: 1280, scale: 0.86 },
  nutrition: { x: 420, y: 1680, scale: 0.9 },
  move: { x: 1100, y: 2140, scale: 0.88 },
  disease: { x: 1880, y: 1960, scale: 0.9 },
}

export const PAPER_BOAT_SRC = '/textures/explore/paper-boat.png'
export const PAPER_SEA_TILE = '/textures/explore/paper-sea-tile.jpg'
