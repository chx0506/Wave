import type { AdviceCategory } from '@/data/tideJournal'

export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy'

export type MockCycleDayRecord = {
  date: string
  cycleDay: number
  flow: FlowLevel
  symptoms: string[]
  mood: string[]
  sleep: '低' | '一般' | '较好'
  energy: '低' | '一般' | '较高'
  note?: string
}

export type MockCycleHistory = {
  sourceLabel: string
  cycleCount: number
  categoriesTracked: AdviceCategory[]
  records: MockCycleDayRecord[]
}

export const MOCK_CYCLE_HISTORY: MockCycleHistory = {
  sourceLabel: 'MoonWave mock history',
  cycleCount: 4,
  categoriesTracked: ['emotion', 'diet', 'exercise', 'sleep', 'work'],
  records: [
    {
      date: '2026-05-26',
      cycleDay: 1,
      flow: 'medium',
      symptoms: ['下腹坠胀', '腰酸'],
      mood: ['敏感'],
      sleep: '一般',
      energy: '低',
      note: '第一天更想独处，热敷后舒服一些。',
    },
    {
      date: '2026-05-27',
      cycleDay: 2,
      flow: 'heavy',
      symptoms: ['痛经', '疲惫', '轻微腹泻'],
      mood: ['烦躁'],
      sleep: '低',
      energy: '低',
    },
    {
      date: '2026-06-18',
      cycleDay: 24,
      flow: 'spotting',
      symptoms: ['乳房胀痛', '腹胀'],
      mood: ['焦虑', '容易分心'],
      sleep: '低',
      energy: '一般',
      note: '经前几天睡眠变浅，下午更想吃甜食。',
    },
    {
      date: '2026-06-23',
      cycleDay: 1,
      flow: 'medium',
      symptoms: ['下腹痛', '头痛'],
      mood: ['低落'],
      sleep: '一般',
      energy: '低',
    },
    {
      date: '2026-06-24',
      cycleDay: 2,
      flow: 'heavy',
      symptoms: ['痛经', '乏力'],
      mood: ['易怒'],
      sleep: '低',
      energy: '低',
      note: '上午安排太满后疼痛感更明显。',
    },
    {
      date: '2026-07-16',
      cycleDay: 25,
      flow: 'spotting',
      symptoms: ['腹胀', '肩颈紧'],
      mood: ['焦虑'],
      sleep: '低',
      energy: '一般',
    },
    {
      date: '2026-07-21',
      cycleDay: 1,
      flow: 'medium',
      symptoms: ['腰酸', '痛经'],
      mood: ['敏感'],
      sleep: '一般',
      energy: '低',
    },
    {
      date: '2026-07-22',
      cycleDay: 2,
      flow: 'heavy',
      symptoms: ['痛经', '疲惫'],
      mood: ['烦躁'],
      sleep: '低',
      energy: '低',
      note: '第二天通常是流量和疲惫最高的一天。',
    },
    {
      date: '2026-08-14',
      cycleDay: 25,
      flow: 'spotting',
      symptoms: ['腹胀', '乳房胀痛'],
      mood: ['情绪起伏'],
      sleep: '低',
      energy: '一般',
    },
    {
      date: '2026-08-19',
      cycleDay: 1,
      flow: 'medium',
      symptoms: ['下腹坠胀', '腰酸'],
      mood: ['安静', '敏感'],
      sleep: '一般',
      energy: '低',
    },
    {
      date: '2026-08-20',
      cycleDay: 2,
      flow: 'heavy',
      symptoms: ['痛经', '乏力'],
      mood: ['易怒'],
      sleep: '低',
      energy: '低',
      note: '适合减少会议和高强度运动。',
    },
    {
      date: '2026-08-25',
      cycleDay: 7,
      flow: 'spotting',
      symptoms: ['残余疲惫'],
      mood: ['平稳'],
      sleep: '较好',
      energy: '一般',
    },
  ],
}
