/** Sample content for first-pass secondary screens (PRD-aligned). */

export const OBSERVE_ACTIVE = {
  question: '为什么我每次经前都睡不好？',
  try: '减少晚间咖啡因',
  watch: ['睡眠', '压力', '精力'],
  day: 5,
  total: 14,
  status: '进行中',
}

export const OBSERVE_CLUES = [
  { title: '经前第 3 天睡眠变浅', note: '近 3 个周期都出现过', shells: 2 },
  { title: '涨潮期精力更高', note: '适合安排重要事情', shells: 1 },
  { title: '压力高的日子疼痛更明显', note: '待继续观察', shells: 1 },
]

export const EXPERIMENT_PRESETS = [
  { category: 'sleep', question: '为什么我每次经前都睡不好？', try: '减少晚间咖啡因', watch: ['睡眠', '压力', '精力'] },
  { category: 'pain', question: '压力高的日子，疼痛会更明显吗？', try: '每天留出 5 分钟放松', watch: ['疼痛', '压力', '睡眠'] },
  { category: 'energy', question: '涨潮期的精力是否更高？', try: '把重要事情安排在上午', watch: ['精力', '情绪', '完成感'] },
  { category: 'exercise', question: '经前减少高强度运动会更舒服吗？', try: '改为轻量散步或拉伸', watch: ['疼痛', '精力', '情绪'] },
] as const

export const EXPERIMENT_CATEGORIES = [
  { id: 'sleep', label: '睡眠' }, { id: 'mood', label: '情绪' }, { id: 'pain', label: '疼痛' },
  { id: 'energy', label: '精力' }, { id: 'stress', label: '压力' }, { id: 'diet', label: '饮食' }, { id: 'exercise', label: '运动' },
] as const

export const BAY_PRACTICES = [
  {
    id: 'breath',
    title: '3 分钟舒缓呼吸',
    reason: '适合经前焦虑或压力偏高时',
    mins: 3,
    tone: 'calm',
  },
  {
    id: 'scan',
    title: '身体扫描',
    reason: '睡眠状态差时，先回来感受身体',
    mins: 5,
    tone: 'soft',
  },
  {
    id: 'soothe',
    title: '情绪安抚',
    reason: '今天情绪像薄雾时可以试试',
    mins: 4,
    tone: 'mist',
  },
  {
    id: 'sleep',
    title: '睡前放松',
    reason: '平潮期常见睡眠波动',
    mins: 6,
    tone: 'night',
  },
] as const

export const BAY_THEMES = [
  { name: '月夜海湾', locked: false },
  { name: '星空海面', locked: true },
  { name: '水墨荷塘', locked: true },
  { name: '灿烂花田', locked: true },
]

export const EXPLORE_STARS = 14

export const EXPLORE_ISLANDS = [
  {
    id: 'cycle',
    title: '周期四季',
    short: '周期',
    blurb: '退潮、涨潮、满潮、平潮分别意味着什么',
    stars: 3,
    starsMax: 3,
    locked: false,
    current: false,
    x: 18,
    y: 62,
    tone: 'meadow',
  },
  {
    id: 'pms',
    title: 'PMS 小岛',
    short: 'PMS',
    blurb: '经前情绪、睡眠与身体变化的常见线索',
    stars: 1,
    starsMax: 3,
    locked: false,
    current: true,
    x: 28,
    y: 28,
    tone: 'autumn',
  },
  {
    id: 'sleep',
    title: '睡眠潮汐',
    short: '睡眠',
    blurb: '为什么有些夜晚更容易醒',
    stars: 1,
    starsMax: 3,
    locked: false,
    current: false,
    x: 58,
    y: 18,
    tone: 'frost',
  },
  {
    id: 'mood',
    title: '情绪海湾',
    short: '情绪',
    blurb: '情绪像天气一样变化，也可以被温柔观察',
    stars: 0,
    starsMax: 3,
    locked: false,
    current: false,
    x: 78,
    y: 38,
    tone: 'magic',
  },
  {
    id: 'pain',
    title: '疼痛灯塔',
    short: '痛经',
    blurb: '痛经与压力、睡眠的关系',
    stars: 0,
    starsMax: 3,
    locked: false,
    current: false,
    x: 72,
    y: 68,
    tone: 'rock',
  },
  {
    id: 'move',
    title: '运动海岸',
    short: '运动',
    blurb: '不同阶段适合怎样的活动强度',
    stars: 0,
    starsMax: 3,
    locked: true,
    current: false,
    x: 48,
    y: 78,
    tone: 'tropic',
  },
  {
    id: 'food',
    title: '饮食潮池',
    short: '饮食',
    blurb: '轻量调整饮食，观察身体反馈',
    stars: 1,
    starsMax: 3,
    locked: false,
    current: false,
    x: 42,
    y: 48,
    tone: 'sand',
  },
  {
    id: 'health',
    title: '健康灯塔',
    short: '健康',
    blurb: '女性健康知识的起点，慢慢展开',
    stars: 0,
    starsMax: 3,
    locked: true,
    current: false,
    x: 12,
    y: 42,
    tone: 'harbor',
  },
] as const

export type ExploreIsland = (typeof EXPLORE_ISLANDS)[number]

export const ME_PROFILE = {
  name: '阿纯',
  shells: 128,
  streak: 12,
  cycleAvg: 28,
  clues: 6,
  experiments: 2,
}

export const ME_ROWS = [
  { id: 'journal', title: '身体航海日志', desc: '周期特点与个人经验' },
  { id: 'clues', title: '身体线索', desc: '小实验留下的发现' },
  { id: 'brief', title: 'Health Brief', desc: '整理一段时间的状态摘要' },
  { id: 'crab', title: '和 Crab 聊聊', desc: '记得、连接、提醒和陪伴' },
  { id: 'shells', title: '贝壳与装扮', desc: '解锁海湾主题与首页装扮' },
  { id: 'privacy', title: '隐私与数据', desc: '本地优先，你决定分享什么' },
]
