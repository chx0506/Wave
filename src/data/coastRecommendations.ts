import decodeDiet from '@/assets/decode/decode-diet.png'
import decodeEmotion from '@/assets/decode/decode-emotion.png'
import decodeExercise from '@/assets/decode/decode-exercise.png'
import decodeSleep from '@/assets/decode/decode-sleep.png'
import decodeWork from '@/assets/decode/decode-work.png'
import {
  EXPERIMENT_PRESETS,
  EXPLORE_ARTICLES,
  EXPLORE_LOCKED_ARTICLE_IDS,
  type ExploreArticle,
} from '@/data/content'
import type { DaySnapshot, ExperimentCategory, Phase } from '@/domain/types'

export type CoastArticlePick = ExploreArticle & {
  coverSrc: string
  coverBg: string
  locked: boolean
}

export type CoastExperimentPick = {
  id: string
  category: ExperimentCategory
  question: string
  try: string
  watch: readonly string[]
  coverSrc: string
  coverBg: string
}

const ARTICLE_COVER: Record<
  string,
  { src: string; bg: string }
> = {
  'cycle-four-seasons': { src: decodeExercise, bg: 'linear-gradient(160deg, #e8f4fc 0%, #d4e8f6 100%)' },
  'cycle-length': { src: decodeWork, bg: 'linear-gradient(160deg, #eef5fb 0%, #dcecf8 100%)' },
  'cycle-follicular': { src: decodeExercise, bg: 'linear-gradient(160deg, #e6f3ea 0%, #d8ebe0 100%)' },
  'pms-signals': { src: decodeEmotion, bg: 'linear-gradient(160deg, #f3e8f0 0%, #eadcf0 100%)' },
  'pms-self-care': { src: decodeEmotion, bg: 'linear-gradient(160deg, #fceee8 0%, #f5e4dc 100%)' },
  'pms-observe': { src: decodeEmotion, bg: 'linear-gradient(160deg, #ede8f5 0%, #e0daf0 100%)' },
  'sleep-night-waking': { src: decodeSleep, bg: 'linear-gradient(160deg, #e4edf8 0%, #d5e3f4 100%)' },
  'sleep-caffeine': { src: decodeSleep, bg: 'linear-gradient(160deg, #e8eef8 0%, #d8e4f2 100%)' },
  'sleep-bedroom': { src: decodeSleep, bg: 'linear-gradient(160deg, #edf2fa 0%, #dfe9f6 100%)' },
  'mood-weather': { src: decodeEmotion, bg: 'linear-gradient(160deg, #f0e8f4 0%, #e6dcf0 100%)' },
  'mood-breath': { src: decodeEmotion, bg: 'linear-gradient(160deg, #e8f0f8 0%, #dce8f4 100%)' },
  'mood-space': { src: decodeEmotion, bg: 'linear-gradient(160deg, #f2eaf0 0%, #e8deec 100%)' },
  'pain-signals': { src: decodeExercise, bg: 'linear-gradient(160deg, #fcece8 0%, #f5e0dc 100%)' },
  'pain-context': { src: decodeEmotion, bg: 'linear-gradient(160deg, #f5ebe8 0%, #ecded8 100%)' },
  'pain-help': { src: decodeExercise, bg: 'linear-gradient(160deg, #fdeee8 0%, #f3e2da 100%)' },
  'move-period': { src: decodeExercise, bg: 'linear-gradient(160deg, #e6f2ea 0%, #d6e8de 100%)' },
  'move-recovery': { src: decodeExercise, bg: 'linear-gradient(160deg, #e8f4ee 0%, #d9ebe2 100%)' },
  'move-build': { src: decodeExercise, bg: 'linear-gradient(160deg, #e4f0e8 0%, #d4e6dc 100%)' },
  'food-energy': { src: decodeDiet, bg: 'linear-gradient(160deg, #faf0e4 0%, #f0e4d4 100%)' },
  'food-iron': { src: decodeDiet, bg: 'linear-gradient(160deg, #f8ece8 0%, #eee0da 100%)' },
  'food-after-period': { src: decodeDiet, bg: 'linear-gradient(160deg, #f5eee6 0%, #ebe2d6 100%)' },
}

const EXPERIMENT_COVER: Record<
  ExperimentCategory,
  { src: string; bg: string }
> = {
  sleep: { src: decodeSleep, bg: 'linear-gradient(160deg, #e4edf8 0%, #d5e3f4 100%)' },
  pain: { src: decodeExercise, bg: 'linear-gradient(160deg, #fceee8 0%, #f3e2da 100%)' },
  energy: { src: decodeWork, bg: 'linear-gradient(160deg, #e8f2ea 0%, #d8e8de 100%)' },
  exercise: { src: decodeExercise, bg: 'linear-gradient(160deg, #e6f2ea 0%, #d6e8de 100%)' },
  mood: { src: decodeEmotion, bg: 'linear-gradient(160deg, #f0e8f4 0%, #e6dcf0 100%)' },
  stress: { src: decodeEmotion, bg: 'linear-gradient(160deg, #ede8f5 0%, #e0daf0 100%)' },
  diet: { src: decodeDiet, bg: 'linear-gradient(160deg, #faf0e4 0%, #f0e4d4 100%)' },
}

const ARTICLE_IDS_BY_PHASE: Record<Phase, string[]> = {
  menstrual: ['cycle-four-seasons', 'pain-help', 'sleep-night-waking', 'food-iron'],
  follicular: ['cycle-follicular', 'move-build', 'food-energy', 'mood-breath'],
  ovulatory: ['move-recovery', 'food-after-period', 'mood-weather', 'cycle-length'],
  luteal: ['pms-signals', 'pms-self-care', 'sleep-caffeine', 'mood-space'],
}

const EXPERIMENT_INDEX_BY_PHASE: Record<Phase, number[]> = {
  menstrual: [2, 5, 9],
  follicular: [4, 7, 11],
  ovulatory: [4, 6, 9],
  luteal: [0, 1, 9, 11],
}

function articleById(id: string): ExploreArticle | undefined {
  return EXPLORE_ARTICLES.find((item) => item.id === id)
}

function withCover(article: ExploreArticle): CoastArticlePick {
  const cover = ARTICLE_COVER[article.id] ?? {
    src: decodeEmotion,
    bg: 'linear-gradient(160deg, #eef5fb 0%, #e2edf8 100%)',
  }
  return {
    ...article,
    coverSrc: cover.src,
    coverBg: cover.bg,
    locked: EXPLORE_LOCKED_ARTICLE_IDS.has(article.id),
  }
}

export function recommendArticles(snapshot: DaySnapshot): CoastArticlePick[] {
  const ids = ARTICLE_IDS_BY_PHASE[snapshot.phase]
  return ids
    .map(articleById)
    .filter((item): item is ExploreArticle => Boolean(item))
    .slice(0, 4)
    .map(withCover)
}

export function recommendExperiments(snapshot: DaySnapshot): CoastExperimentPick[] {
  const indices = EXPERIMENT_INDEX_BY_PHASE[snapshot.phase]
  const seen = new Set<number>()
  const picks: CoastExperimentPick[] = []

  for (const index of indices) {
    if (seen.has(index) || index >= EXPERIMENT_PRESETS.length) continue
    seen.add(index)
    const preset = EXPERIMENT_PRESETS[index]
    const cover = EXPERIMENT_COVER[preset.category]
    picks.push({
      id: `preset-${index}`,
      category: preset.category,
      question: preset.question,
      try: preset.try,
      watch: preset.watch,
      coverSrc: cover.src,
      coverBg: cover.bg,
    })
    if (picks.length >= 3) break
  }

  return picks
}
