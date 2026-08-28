import decodeDiet from '@/assets/decode/decode-diet.png'
import decodeEmotion from '@/assets/decode/decode-emotion.png'
import decodeExercise from '@/assets/decode/decode-exercise.png'
import decodeSleep from '@/assets/decode/decode-sleep.png'
import decodeWork from '@/assets/decode/decode-work.png'
import type { AdviceCategory } from '@/data/tideJournal'

/** 纸浮雕风格分类图标，用于首页今日解读横滑卡 */
export const DECODE_ART: Record<AdviceCategory, string> = {
  emotion: decodeEmotion,
  diet: decodeDiet,
  exercise: decodeExercise,
  sleep: decodeSleep,
  work: decodeWork,
}
