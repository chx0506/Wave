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
  {
    title: '经前第 3 天睡眠变浅',
    note: '近 3 个周期都出现过',
    shells: 2,
    sourceExperimentTitle: '经前睡眠实验',
    observationDays: 14,
    status: 'confirmed',
  },
  {
    title: '涨潮期精力更高',
    note: '适合安排重要事情',
    shells: 1,
    sourceExperimentTitle: '周期精力观察',
    observationDays: 21,
    status: 'confirmed',
  },
  {
    title: '压力高的日子疼痛更明显',
    note: '还需要更多记录来确认',
    shells: 1,
    sourceExperimentTitle: '压力与疼痛观察',
    observationDays: 8,
    status: 'observing',
  },
]

export const EXPERIMENT_PRESETS = [
  {
    category: 'sleep',
    question: '为什么我每次经前都睡不好？',
    try: '减少晚间咖啡因',
    watch: ['睡眠', '压力', '精力'],
  },
  {
    category: 'pain',
    question: '压力高的日子，疼痛会更明显吗？',
    try: '每天留出 5 分钟放松',
    watch: ['疼痛', '压力', '睡眠'],
  },
  {
    category: 'energy',
    question: '涨潮期的精力是否更高？',
    try: '把重要事情安排在上午',
    watch: ['精力', '情绪', '完成感'],
  },
  {
    category: 'exercise',
    question: '经前减少高强度运动会更舒服吗？',
    try: '改为轻量散步或拉伸',
    watch: ['疼痛', '精力', '情绪'],
  },
  {
    category: 'mood',
    question: '经前留出独处时间，情绪会更稳定吗？',
    try: '每天安排 10 分钟安静时间',
    watch: ['情绪', '压力', '睡眠'],
  },
  {
    category: 'stress',
    question: '短暂呼吸练习能缓解下午的压力吗？',
    try: '下午进行 3 分钟舒缓呼吸',
    watch: ['压力', '精力', '情绪'],
  },
  {
    category: 'diet',
    question: '规律吃早餐会让上午更有精力吗？',
    try: '连续吃一份简单早餐',
    watch: ['精力', '情绪', '饥饿感'],
  },
] as const

export const EXPERIMENT_CATEGORIES = [
  { id: 'sleep', label: '睡眠' },
  { id: 'mood', label: '情绪' },
  { id: 'pain', label: '疼痛' },
  { id: 'energy', label: '精力' },
  { id: 'stress', label: '压力' },
  { id: 'diet', label: '饮食' },
  { id: 'exercise', label: '运动' },
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
    category: 'cycle',
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
    category: 'pms',
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
    category: 'sleep',
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
    category: 'mood',
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
    category: 'pain',
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
    category: 'move',
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
    category: 'food',
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
    category: 'health',
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

export type ExploreArticle = {
  islandId: ExploreIsland['id']
  eyebrow: string
  readTime: string
  lead: string
  paragraphs: string[]
  takeaway: string
}

export const EXPLORE_ARTICLES: ExploreArticle[] = [
  {
    islandId: 'cycle', eyebrow: '周期入门', readTime: '约 3 分钟',
    lead: '身体的每一次潮汐，都是生命温柔的节律。',
    paragraphs: [
      '月经周期从月经出血的第一天开始，到下一次月经开始的前一天结束。平均周期约 28 天，通常在 21–35 天之间。',
      '一个周期可以从月经期、卵泡期、排卵期和黄体期来观察。每个阶段的身体感受都可能不同，记录变化比追求“标准答案”更重要。',
    ],
    takeaway: '先从今天的潮位开始，留意身体正在经历哪个阶段。',
  },
  {
    islandId: 'pms', eyebrow: '经前观察', readTime: '约 3 分钟',
    lead: '经前的变化可以被看见，也值得被温柔对待。',
    paragraphs: [
      '经前可能出现情绪波动、睡眠变化、疲劳、腹胀、头痛或乳房胀痛等表现。每个人的组合和程度都不一样。',
      '不需要因为这些变化感到羞耻或自责。可以从减少晚间咖啡因、留出安静时间或降低运动强度开始，连续观察自己的反馈。',
    ],
    takeaway: '把“我是不是不够好”换成“我最近需要什么”。',
  },
  {
    islandId: 'sleep', eyebrow: '睡眠潮汐', readTime: '约 2 分钟',
    lead: '有些夜晚更容易醒，先从作息和环境里寻找线索。',
    paragraphs: [
      '规律作息、避免熬夜，尽量保证每晚 7–9 小时的睡眠。下午和晚上限制咖啡因，也可以减少睡前使用手机和电脑。',
      '如果经前反复出现睡眠变浅，可以把睡眠、压力和咖啡因一起记录，和过去相似阶段的自己轻轻比较。',
    ],
    takeaway: '先做一件小改变，再观察它是否让夜晚更安稳。',
  },
  {
    islandId: 'mood', eyebrow: '情绪海湾', readTime: '约 2 分钟',
    lead: '情绪像天气一样变化，也可以被温柔观察。',
    paragraphs: [
      '周期中的情绪起伏并不需要被立刻解决。先感受它、为自己留一点空间，允许情绪静静地流淌。',
      '正念呼吸与放松训练可以作为一个轻量入口：不追着情绪分析，只花几分钟回到身体。',
    ],
    takeaway: '今天的情绪不是全部的你，它只是此刻经过的天气。',
  },
  {
    islandId: 'pain', eyebrow: '疼痛观察', readTime: '约 2 分钟',
    lead: '疼痛是身体发来的信号，记录它的出现时机和强度。',
    paragraphs: [
      '痛经常表现为下腹部痉挛性疼痛，也可能伴随疲劳、腹胀或头痛。压力和睡眠状态也值得一起观察。',
      '可以尝试每天留出几分钟放松，并记录疼痛、压力和睡眠的变化，为下一个周期留下可比较的线索。',
    ],
    takeaway: '观察不是忍耐；如果不适持续或明显影响生活，应及时寻求专业帮助。',
  },
  {
    islandId: 'move', eyebrow: '运动节奏', readTime: '约 2 分钟',
    lead: '运动强度可以顺着身体的潮汐调整。',
    paragraphs: [
      '经期可以降低强度，以休息和恢复性运动为主，例如散步、轻度有氧、瑜伽和拉伸。',
      '经后体能和耐力通常回升，可以尝试力量训练、跑步或游泳，并让强度循序渐进。',
    ],
    takeaway: '没有必须完成的强度，舒服和可持续同样重要。',
  },
  {
    islandId: 'food', eyebrow: '饮食潮池', readTime: '约 2 分钟',
    lead: '吃饭不是完成任务，而是给身体补回能量。',
    paragraphs: [
      '优先选择能稳定血糖、补充能量的食物，搭配优质蛋白、复合碳水和健康脂肪，并注意饮水。',
      '经期可以关注含铁食物和富含维生素 C 的食物；经后则侧重鱼虾、蛋类、奶制品、豆制品、燕麦和糙米等。',
    ],
    takeaway: '从下一餐开始，做一个让自己更有能量的选择。',
  },
  {
    islandId: 'health', eyebrow: '女性健康', readTime: '约 2 分钟',
    lead: '健康知识是一张地图，先从理解自己的记录开始。',
    paragraphs: [
      'Wave 不试图替你下诊断，而是把周期、睡眠、情绪、疼痛、饮食和运动放在同一张观察地图上。',
      '当某个问题反复出现，可以围绕它做一个简单的身体小实验，持续观察，再和过去的自己比较。',
    ],
    takeaway: '记录、理解、轻轻调整，慢慢形成属于自己的身体使用说明书。',
  },
]

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
