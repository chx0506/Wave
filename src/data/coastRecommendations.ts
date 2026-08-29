import articleCycleFourSeasons from '@/assets/articles/article-cycle-four-seasons.png'
import articleCycleFollicular from '@/assets/articles/article-cycle-follicular.png'
import articleCycleLength from '@/assets/articles/article-cycle-length.png'
import articleFoodAfterPeriod from '@/assets/articles/article-food-after-period.png'
import articleFoodEnergy from '@/assets/articles/article-food-energy.png'
import articleFoodIron from '@/assets/articles/article-food-iron.png'
import articleMoodBreath from '@/assets/articles/article-mood-breath.png'
import articleMoodSpace from '@/assets/articles/article-mood-space.png'
import articleMoodWeather from '@/assets/articles/article-mood-weather.png'
import articleMoveBuild from '@/assets/articles/article-move-build.png'
import articleMovePeriod from '@/assets/articles/article-move-period.png'
import articleMoveRecovery from '@/assets/articles/article-move-recovery.png'
import articlePainContext from '@/assets/articles/article-pain-context.png'
import articlePainHelp from '@/assets/articles/article-pain-help.png'
import articlePainSignals from '@/assets/articles/article-pain-signals.png'
import articlePmsObserve from '@/assets/articles/article-pms-observe.png'
import articlePmsSelfCare from '@/assets/articles/article-pms-self-care.png'
import articlePmsSignals from '@/assets/articles/article-pms-signals.png'
import articleSleepBedroom from '@/assets/articles/article-sleep-bedroom.png'
import articleSleepCaffeine from '@/assets/articles/article-sleep-caffeine.png'
import articleSleepNightWaking from '@/assets/articles/article-sleep-night-waking.png'
import experimentDiet from '@/assets/experiments/experiment-diet.png'
import experimentEnergy from '@/assets/experiments/experiment-energy.png'
import experimentExercise from '@/assets/experiments/experiment-exercise.png'
import experimentMood from '@/assets/experiments/experiment-mood.png'
import experimentPain from '@/assets/experiments/experiment-pain.png'
import experimentSleep from '@/assets/experiments/experiment-sleep.png'
import experimentStress from '@/assets/experiments/experiment-stress.png'
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

/** Dedicated article art — unique icon + color per card, no shared decode logos. */
const ARTICLE_COVER: Record<
  string,
  { src: string; bg: string }
> = {
  'cycle-four-seasons': {
    src: articleCycleFourSeasons,
    bg: 'linear-gradient(160deg, #e8f4fc 0%, #d4e8f6 100%)',
  },
  'cycle-length': {
    src: articleCycleLength,
    bg: 'linear-gradient(160deg, #e4eaf8 0%, #d2dbf0 100%)',
  },
  'cycle-follicular': {
    src: articleCycleFollicular,
    bg: 'linear-gradient(160deg, #eaf6e8 0%, #d8ebd4 100%)',
  },
  'pms-signals': {
    src: articlePmsSignals,
    bg: 'linear-gradient(160deg, #f3e8f0 0%, #eadcf0 100%)',
  },
  'pms-self-care': {
    src: articlePmsSelfCare,
    bg: 'linear-gradient(160deg, #fceee8 0%, #f5e0d6 100%)',
  },
  'pms-observe': {
    src: articlePmsObserve,
    bg: 'linear-gradient(160deg, #e8e6f5 0%, #d8d4ee 100%)',
  },
  'sleep-night-waking': {
    src: articleSleepNightWaking,
    bg: 'linear-gradient(160deg, #dde6f5 0%, #c9d6ec 100%)',
  },
  'sleep-caffeine': {
    src: articleSleepCaffeine,
    bg: 'linear-gradient(160deg, #ebe6df 0%, #ddd4c8 100%)',
  },
  'sleep-bedroom': {
    src: articleSleepBedroom,
    bg: 'linear-gradient(160deg, #e2eaf6 0%, #d0dceb 100%)',
  },
  'mood-weather': {
    src: articleMoodWeather,
    bg: 'linear-gradient(160deg, #f7f0e0 0%, #ebe2cc 100%)',
  },
  'mood-breath': {
    src: articleMoodBreath,
    bg: 'linear-gradient(160deg, #e4ecf8 0%, #d0dcf0 100%)',
  },
  'mood-space': {
    src: articleMoodSpace,
    bg: 'linear-gradient(160deg, #f4e6ec 0%, #e8d4de 100%)',
  },
  'pain-signals': {
    src: articlePainSignals,
    bg: 'linear-gradient(160deg, #fce8e4 0%, #f2d4ce 100%)',
  },
  'pain-context': {
    src: articlePainContext,
    bg: 'linear-gradient(160deg, #f0ebe4 0%, #e2d8cc 100%)',
  },
  'pain-help': {
    src: articlePainHelp,
    bg: 'linear-gradient(160deg, #fde8e0 0%, #f3d4c8 100%)',
  },
  'move-period': {
    src: articleMovePeriod,
    bg: 'linear-gradient(160deg, #dff2ee 0%, #c8e6e0 100%)',
  },
  'move-recovery': {
    src: articleMoveRecovery,
    bg: 'linear-gradient(160deg, #e6eef6 0%, #d2dfea 100%)',
  },
  'move-build': {
    src: articleMoveBuild,
    bg: 'linear-gradient(160deg, #e4f0f8 0%, #cfe2f0 100%)',
  },
  'food-energy': {
    src: articleFoodEnergy,
    bg: 'linear-gradient(160deg, #faf0e4 0%, #f0e0cc 100%)',
  },
  'food-iron': {
    src: articleFoodIron,
    bg: 'linear-gradient(160deg, #e8f0e6 0%, #d4e2d0 100%)',
  },
  'food-after-period': {
    src: articleFoodAfterPeriod,
    bg: 'linear-gradient(160deg, #f5ebe2 0%, #e8d8cc 100%)',
  },
}

const EXPERIMENT_COVER: Record<
  ExperimentCategory,
  { src: string; bg: string }
> = {
  sleep: {
    src: experimentSleep,
    bg: 'linear-gradient(160deg, #e2ecf8 0%, #cfdff2 100%)',
  },
  pain: {
    src: experimentPain,
    bg: 'linear-gradient(160deg, #fce8e2 0%, #f3d5cc 100%)',
  },
  energy: {
    src: experimentEnergy,
    bg: 'linear-gradient(160deg, #faf0dc 0%, #f0e0c4 100%)',
  },
  exercise: {
    src: experimentExercise,
    bg: 'linear-gradient(160deg, #dcefee 0%, #c5e4e2 100%)',
  },
  mood: {
    src: experimentMood,
    bg: 'linear-gradient(160deg, #f5e4ec 0%, #ead4e0 100%)',
  },
  stress: {
    src: experimentStress,
    bg: 'linear-gradient(160deg, #ebe6f6 0%, #ddd4ef 100%)',
  },
  diet: {
    src: experimentDiet,
    bg: 'linear-gradient(160deg, #f7efe4 0%, #ebe0d0 100%)',
  },
}

const ARTICLE_IDS_BY_PHASE: Record<Phase, string[]> = {
  menstrual: [
    'cycle-four-seasons',
    'pain-help',
    'sleep-night-waking',
    'food-iron',
    'move-period',
    'mood-space',
  ],
  follicular: [
    'cycle-follicular',
    'move-build',
    'food-energy',
    'mood-breath',
    'sleep-bedroom',
    'pain-context',
  ],
  ovulatory: [
    'move-recovery',
    'food-after-period',
    'mood-weather',
    'cycle-length',
    'mood-breath',
    'pain-signals',
  ],
  luteal: [
    'pms-signals',
    'pms-self-care',
    'sleep-caffeine',
    'mood-space',
    'pms-observe',
    'food-energy',
  ],
}

const EXPERIMENT_INDEX_BY_PHASE: Record<Phase, number[]> = {
  menstrual: [2, 5, 9, 3, 7, 12],
  follicular: [4, 7, 11, 0, 8, 13],
  ovulatory: [4, 6, 9, 1, 10, 12],
  luteal: [0, 1, 9, 11, 3, 6],
}

function articleById(id: string): ExploreArticle | undefined {
  return EXPLORE_ARTICLES.find((item) => item.id === id)
}

function withCover(article: ExploreArticle): CoastArticlePick {
  const cover = ARTICLE_COVER[article.id] ?? {
    src: articleMoodBreath,
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
    .slice(0, 6)
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
    if (picks.length >= 6) break
  }

  return picks
}
