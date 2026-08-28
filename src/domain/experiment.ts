import type { BodyClue, Experiment, ObservationEntry } from '@/domain/types'

type DateValue = Date | string

export type ExperimentPayload = Omit<Experiment, 'startedAt' | 'observations'> & {
  startedAt: DateValue
  observations: Array<Omit<ObservationEntry, 'date'> & { date: DateValue }>
}

export function normalizeExperiment(payload: ExperimentPayload): Experiment {
  return {
    ...payload,
    startedAt: new Date(payload.startedAt),
    observations: payload.observations
      .map((observation) => ({
        ...observation,
        date: new Date(observation.date),
      }))
      .sort((left, right) => left.day - right.day),
  }
}

export function getExperimentProgress(experiment: Experiment) {
  const currentDay = Math.min(
    experiment.totalDays,
    Math.max(0, ...experiment.observations.map((item) => item.day)),
  )

  return {
    currentDay,
    remainingDays: Math.max(experiment.totalDays - currentDay, 0),
    completedTryDays: experiment.observations.filter(
      (item) => item.completedTry,
    ).length,
  }
}

const LEVEL_SCORES: Record<string, number> = {
  较低: 1,
  一般: 2,
  较高: 3,
}

export type ExperimentMetricConclusion = {
  metric: string
  result: string
  detail: string
  trend: 'up' | 'down' | 'steady'
}

export type ExperimentConclusion = {
  title: string
  summary: string
  comparison: string
  metrics: ExperimentMetricConclusion[]
  observationDays: number
}

function averageMetric(items: ObservationEntry[], metric: string) {
  const scores = items
    .map((item) => LEVEL_SCORES[item.values[metric]])
    .filter((score): score is number => score !== undefined)
  return scores.length > 0
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : null
}

export function buildExperimentConclusion(
  experiment: Experiment,
): ExperimentConclusion {
  const records = experiment.observations
  const completed = records.filter((item) => item.completedTry)
  const skipped = records.filter((item) => !item.completedTry)
  const canCompareTry = completed.length > 0 && skipped.length > 0
  const midpoint = Math.max(1, Math.floor(records.length / 2))
  const firstHalf = records.slice(0, midpoint)
  const secondHalf = records.slice(midpoint)
  const before = canCompareTry ? skipped : firstHalf
  const after = canCompareTry ? completed : secondHalf
  const comparison = canCompareTry
    ? '完成尝试的日子，相比未完成尝试的日子'
    : '实验后半段，相比前半段'

  const metrics = experiment.watch.map((metric) => {
    const beforeAverage = averageMetric(before, metric)
    const afterAverage = averageMetric(after, metric)
    const difference =
      beforeAverage !== null && afterAverage !== null
        ? afterAverage - beforeAverage
        : 0
    const trend =
      Math.abs(difference) < 0.35 ? 'steady' : difference > 0 ? 'up' : 'down'
    const result =
      trend === 'steady' ? '暂无明显变化' : trend === 'up' ? '整体较高' : '整体较低'

    return {
      metric,
      result,
      detail: `${comparison}，${metric}${result}`,
      trend,
    } satisfies ExperimentMetricConclusion
  })

  return {
    title: `「${experiment.try}」带来的身体反馈`,
    summary: `根据完整 ${records.length} 天的个人记录，分别观察${experiment.watch.join('、')}的变化。`,
    comparison,
    metrics,
    observationDays: records.length,
  }
}

export function buildExperimentClue(
  experiment: Experiment,
): Pick<BodyClue, 'title' | 'note' | 'category' | 'observationDays'> {
  const conclusion = buildExperimentConclusion(experiment)

  return {
    title: conclusion.title,
    note: conclusion.metrics.map((metric) => metric.detail).join('；'),
    category: experiment.category,
    observationDays: conclusion.observationDays,
  }
}
