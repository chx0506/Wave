import symptomAcne from '@/assets/symptoms/acne.png'
import symptomBack from '@/assets/symptoms/back.png'
import symptomBloating from '@/assets/symptoms/bloating.png'
import symptomCramps from '@/assets/symptoms/cramps.png'
import symptomFatigue from '@/assets/symptoms/fatigue.png'
import symptomHeadache from '@/assets/symptoms/headache.png'
import symptomLowback from '@/assets/symptoms/lowback.png'
import symptomLowmood from '@/assets/symptoms/lowmood.png'
import symptomNausea from '@/assets/symptoms/nausea.png'
import symptomSleep from '@/assets/symptoms/sleep.png'
import symptomTenderness from '@/assets/symptoms/tenderness.png'

import dischargeClumpy from '@/assets/discharge/clumpy.png'
import dischargeDry from '@/assets/discharge/dry.png'
import dischargeItch from '@/assets/discharge/itch.png'
import dischargeMilky from '@/assets/discharge/milky.png'
import dischargeSticky from '@/assets/discharge/sticky.png'
import dischargeWatery from '@/assets/discharge/watery.png'

import exerciseCycle from '@/assets/exercise/cycle.png'
import exerciseOutdoor from '@/assets/exercise/outdoor.png'
import exerciseRest from '@/assets/exercise/rest.png'
import exerciseRun from '@/assets/exercise/run.png'
import exerciseStrength from '@/assets/exercise/strength.png'
import exerciseSwim from '@/assets/exercise/swim.png'
import exerciseWalk from '@/assets/exercise/walk.png'
import exerciseYoga from '@/assets/exercise/yoga.png'

import intimacyDesireHigh from '@/assets/intimacy/desire_high.png'
import intimacyDesireLow from '@/assets/intimacy/desire_low.png'
import intimacyDiscomfort from '@/assets/intimacy/discomfort.png'
import intimacyIntimate from '@/assets/intimacy/intimate.png'
import intimacyProtected from '@/assets/intimacy/protected.png'
import intimacyUnprotected from '@/assets/intimacy/unprotected.png'

export type RecordChip = {
  id: string
  label: string
  src: string
}

/** 纸浮雕状态选项 — 奶油 + 雾蓝，分区用于今日记录 */

export const SYMPTOM_OPTIONS: readonly RecordChip[] = [
  { id: 'cramps', label: '腹痛', src: symptomCramps },
  { id: 'headache', label: '头痛', src: symptomHeadache },
  { id: 'back', label: '背痛', src: symptomBack },
  { id: 'lowback', label: '腰酸', src: symptomLowback },
  { id: 'tenderness', label: '乳房胀痛', src: symptomTenderness },
  { id: 'bloating', label: '腹胀', src: symptomBloating },
  { id: 'nausea', label: '恶心', src: symptomNausea },
  { id: 'acne', label: '长痘', src: symptomAcne },
  { id: 'fatigue', label: '疲惫', src: symptomFatigue },
  { id: 'lowmood', label: '情绪低落', src: symptomLowmood },
  { id: 'sleep', label: '睡眠不佳', src: symptomSleep },
]

export const DISCHARGE_OPTIONS: readonly RecordChip[] = [
  { id: 'dry', label: '干燥', src: dischargeDry },
  { id: 'watery', label: '液态', src: dischargeWatery },
  { id: 'milky', label: '乳白', src: dischargeMilky },
  { id: 'sticky', label: '粘稠', src: dischargeSticky },
  { id: 'clumpy', label: '块状', src: dischargeClumpy },
  { id: 'itch', label: '瘙痒', src: dischargeItch },
]

export const EXERCISE_OPTIONS: readonly RecordChip[] = [
  { id: 'rest', label: '休息', src: exerciseRest },
  { id: 'walk', label: '步行', src: exerciseWalk },
  { id: 'run', label: '跑步', src: exerciseRun },
  { id: 'yoga', label: '瑜伽', src: exerciseYoga },
  { id: 'strength', label: '力量训练', src: exerciseStrength },
  { id: 'swim', label: '游泳', src: exerciseSwim },
  { id: 'cycle', label: '骑行', src: exerciseCycle },
  { id: 'outdoor', label: '户外', src: exerciseOutdoor },
]

export const INTIMACY_OPTIONS: readonly RecordChip[] = [
  { id: 'intimate', label: '有亲密', src: intimacyIntimate },
  { id: 'desire_high', label: '性欲偏高', src: intimacyDesireHigh },
  { id: 'desire_low', label: '性欲偏低', src: intimacyDesireLow },
  { id: 'protected', label: '有保护', src: intimacyProtected },
  { id: 'unprotected', label: '无保护', src: intimacyUnprotected },
  { id: 'discomfort', label: '不适', src: intimacyDiscomfort },
]
