/** Sample content for first-pass secondary screens (PRD-aligned). */

export const OBSERVE_ACTIVE = {
  question: '为什么我每次经前都睡不好？',
  try: '减少晚间咖啡因',
  watch: ['睡眠', '压力', '精力'],
  total: 14,
  status: '进行中',
  observations: [
    { day: 1, sleep: '较低', stress: '较高', energy: '较低', completedTry: true },
    { day: 2, sleep: '一般', stress: '一般', energy: '一般', completedTry: true },
    { day: 3, sleep: '一般', stress: '较低', energy: '一般', completedTry: true },
    { day: 4, sleep: '较高', stress: '一般', energy: '较高', completedTry: false },
    { day: 5, sleep: '较高', stress: '较低', energy: '较高', completedTry: true },
  ],
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
    category: 'sleep',
    question: '睡前少看手机，会更容易入睡吗？',
    try: '睡前 30 分钟放下手机',
    watch: ['入睡速度', '睡眠', '精力'],
  },
  {
    category: 'pain',
    question: '压力高的日子，疼痛会更明显吗？',
    try: '每天留出 5 分钟放松',
    watch: ['疼痛', '压力', '睡眠'],
  },
  {
    category: 'pain',
    question: '经期热敷会让腹部更舒服吗？',
    try: '不适时热敷腹部 15 分钟',
    watch: ['疼痛', '舒适度', '精力'],
  },
  {
    category: 'energy',
    question: '涨潮期的精力是否更高？',
    try: '把重要事情安排在上午',
    watch: ['精力', '情绪', '完成感'],
  },
  {
    category: 'energy',
    question: '午后短暂休息能减少疲惫吗？',
    try: '午后闭眼休息 10 分钟',
    watch: ['精力', '专注', '完成感'],
  },
  {
    category: 'exercise',
    question: '经前减少高强度运动会更舒服吗？',
    try: '改为轻量散步或拉伸',
    watch: ['疼痛', '精力', '情绪'],
  },
  {
    category: 'exercise',
    question: '轻量散步会让经期身体更舒展吗？',
    try: '每天轻松散步 15 分钟',
    watch: ['舒适度', '精力', '情绪'],
  },
  {
    category: 'mood',
    question: '经前留出独处时间，情绪会更稳定吗？',
    try: '每天安排 10 分钟安静时间',
    watch: ['情绪', '压力', '睡眠'],
  },
  {
    category: 'mood',
    question: '写下此刻的感受，会让我更放松吗？',
    try: '每天写三句话记录感受',
    watch: ['情绪', '压力', '睡眠'],
  },
  {
    category: 'stress',
    question: '短暂呼吸练习能缓解下午的压力吗？',
    try: '下午进行 3 分钟舒缓呼吸',
    watch: ['压力', '精力', '情绪'],
  },
  {
    category: 'stress',
    question: '把任务拆小，会减少今天的压力吗？',
    try: '每天只列出三个优先任务',
    watch: ['压力', '完成感', '精力'],
  },
  {
    category: 'diet',
    question: '规律吃早餐会让上午更有精力吗？',
    try: '连续吃一份简单早餐',
    watch: ['精力', '情绪', '饥饿感'],
  },
  {
    category: 'diet',
    question: '下午及时加餐，会减少晚间饥饿吗？',
    try: '下午准备一份简单加餐',
    watch: ['饥饿感', '精力', '情绪'],
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
    id: 'nutrition',
    title: '营养',
    short: '营养',
    blurb: '轻量调整饮食，观察身体反馈',
    stars: 3,
    starsMax: 3,
    locked: false,
    current: false,
    x: 18,
    y: 60,
    tone: 'meadow',
  },
  {
    id: 'pain',
    title: '疼痛',
    short: '疼痛',
    blurb: '识别疼痛的表现、强度与生活背景',
    stars: 1,
    starsMax: 3,
    locked: false,
    current: true,
    x: 20,
    y: 28,
    tone: 'autumn',
  },
  {
    id: 'sleep',
    title: '睡眠',
    short: '睡眠',
    blurb: '为什么有些夜晚更容易醒',
    stars: 1,
    starsMax: 3,
    locked: false,
    current: false,
    x: 58,
    y: 20,
    tone: 'frost',
  },
  {
    id: 'mood',
    title: '情绪',
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
    id: 'disease',
    title: '疾病',
    short: '疾病',
    blurb: '理解健康边界，知道何时寻求专业帮助',
    stars: 0,
    starsMax: 3,
    locked: false,
    current: false,
    x: 75,
    y: 68,
    tone: 'rock',
  },
  {
    id: 'move',
    title: '运动',
    short: '运动',
    blurb: '不同阶段适合怎样的活动强度',
    stars: 0,
    starsMax: 3,
    locked: false,
    current: false,
    x: 44,
    y: 74,
    tone: 'tropic',
  },
  {
    id: 'relief',
    title: '缓解',
    short: '缓解',
    blurb: '从呼吸、休息和轻量调整开始照顾自己',
    stars: 1,
    starsMax: 3,
    locked: false,
    current: false,
    x: 50,
    y: 45,
    tone: 'sand',
  },
] as const

export type ExploreIsland = (typeof EXPLORE_ISLANDS)[number]

export type ExploreObjectKind =
  | 'book'
  | 'camp'
  | 'coconut'
  | 'crystal'
  | 'flower'
  | 'lighthouse'
  | 'moon'
  | 'mushroom'
  | 'shell'
  | 'tea'
  | 'tent'
  | 'tree'

export type ExploreArticle = {
  id: string
  islandId: ExploreIsland['id']
  title: string
  objectLabel: string
  objectKind: ExploreObjectKind
  objectX: number
  objectY: number
  eyebrow: string
  readTime: string
  lead: string
  paragraphs: string[]
  takeaway: string
  locked?: boolean
}

/** Demo-only article locks; islands themselves remain freely viewable. */
export const EXPLORE_LOCKED_ARTICLE_IDS = new Set([
  'cycle-length',
  'pms-observe',
  'sleep-caffeine',
  'mood-space',
  'pain-help',
  'move-build',
  'food-after-period',
])

export const EXPLORE_ARTICLES: ExploreArticle[] = [
  {
    id: 'cycle-four-seasons',
    islandId: 'disease',
    title: '认识周期的四个季节',
    objectLabel: '四季树',
    objectKind: 'tree',
    objectX: -5,
    objectY: -8,
    eyebrow: '周期入门',
    readTime: '约 3 分钟',
    lead: '身体的每一次潮汐，都是生命温柔的节律。',
    paragraphs: [
      '月经周期从月经出血的第一天开始，到下一次月经开始的前一天结束。平均周期约 28 天，通常在 21–35 天之间。',
      '一个周期可以从月经期、卵泡期、排卵期和黄体期来观察。每个阶段的身体感受都可能不同，记录变化比追求“标准答案”更重要。',
    ],
    takeaway: '先从今天的潮位开始，留意身体正在经历哪个阶段。',
  },
  {
    id: 'cycle-length',
    islandId: 'disease',
    title: '周期一定是 28 天吗？',
    objectLabel: '潮汐石',
    objectKind: 'shell',
    objectX: 7,
    objectY: 4,
    eyebrow: '周期入门',
    readTime: '约 2 分钟',
    lead: '28 天是常见的平均值，不是每个人都要达到的标准答案。',
    paragraphs: [
      '月经周期从出血第一天开始，到下一次月经开始的前一天结束。一般来说，21–35 天都可能是常见范围。',
      '比起只盯着某一次的天数，更值得观察的是自己的周期是否长期保持相对稳定，以及身体感受有没有明显变化。',
    ],
    takeaway: '记录自己的节律，比追赶统一的 28 天更有意义。',
  },
  {
    id: 'cycle-follicular',
    islandId: 'disease',
    title: '经后为什么常感觉轻快？',
    objectLabel: '新芽帐篷',
    objectKind: 'tent',
    objectX: 4,
    objectY: -7,
    eyebrow: '卵泡期',
    readTime: '约 2 分钟',
    lead: '经后身体进入新的生长阶段，精力和舒适度可能慢慢回升。',
    paragraphs: [
      '随着卵泡发育，雌激素水平逐渐上升，子宫内膜开始增厚。很多人在这一阶段腹胀等不适减轻。',
      '个体差异始终存在。可以观察自己的睡眠、精力和社交意愿，而不必预设自己一定会更有活力。',
    ],
    takeaway: '把身体变轻快的时刻记下来，它可能是你的个人线索。',
  },
  {
    id: 'pms-signals',
    islandId: 'relief',
    title: '经前身体会发出哪些信号？',
    objectLabel: '红叶营地',
    objectKind: 'camp',
    objectX: -4,
    objectY: -5,
    eyebrow: '经前观察',
    readTime: '约 3 分钟',
    lead: '经前的变化可以被看见，也值得被温柔对待。',
    paragraphs: [
      '经前可能出现情绪波动、睡眠变化、疲劳、腹胀、头痛或乳房胀痛等表现。每个人的组合和程度都不一样。',
      '不需要因为这些变化感到羞耻或自责。可以从减少晚间咖啡因、留出安静时间或降低运动强度开始，连续观察自己的反馈。',
    ],
    takeaway: '把“我是不是不够好”换成“我最近需要什么”。',
  },
  {
    id: 'pms-self-care',
    islandId: 'relief',
    title: '经前不舒服时，先做什么？',
    objectLabel: '暖茶桌',
    objectKind: 'tea',
    objectX: 6,
    objectY: -3,
    eyebrow: '经前照顾',
    readTime: '约 2 分钟',
    lead: '先减少一点负担，再决定今天还要完成什么。',
    paragraphs: [
      '经前可以从规律进食、减少晚间咖啡因、给睡眠留出时间和适当降低运动强度开始。一次只调整一件事，更容易看见反馈。',
      '如果情绪更敏感，也可以把任务拆小，为自己保留安静空间。照顾身体不是意志力不足。',
    ],
    takeaway: '把“撑过去”换成“今天怎样能舒服一点”。',
  },
  {
    id: 'pms-observe',
    islandId: 'relief',
    title: '怎样判断变化是否反复出现？',
    objectLabel: '观察手册',
    objectKind: 'book',
    objectX: 4,
    objectY: 7,
    eyebrow: '经前观察',
    readTime: '约 2 分钟',
    lead: '把感受放回时间轴，线索会比单次印象更清楚。',
    paragraphs: [
      '连续记录两到三个周期，留意变化出现于经前第几天、持续多久，以及是否影响睡眠、工作或日常活动。',
      '记录不是为了证明自己“有问题”，而是帮助你在需要时更完整地描述自己的经历。',
    ],
    takeaway: '出现时间、持续时长和影响程度，是三条重要线索。',
  },
  {
    id: 'sleep-night-waking',
    islandId: 'sleep',
    title: '为什么有些夜晚更容易醒？',
    objectLabel: '月亮小屋',
    objectKind: 'moon',
    objectX: -5,
    objectY: -6,
    eyebrow: '睡眠潮汐',
    readTime: '约 2 分钟',
    lead: '有些夜晚更容易醒，先从作息和环境里寻找线索。',
    paragraphs: [
      '规律作息、避免熬夜，尽量保证每晚 7–9 小时的睡眠。下午和晚上限制咖啡因，也可以减少睡前使用手机和电脑。',
      '如果经前反复出现睡眠变浅，可以把睡眠、压力和咖啡因一起记录，和过去相似阶段的自己轻轻比较。',
    ],
    takeaway: '先做一件小改变，再观察它是否让夜晚更安稳。',
  },
  {
    id: 'sleep-caffeine',
    islandId: 'sleep',
    title: '下午的咖啡会影响夜晚吗？',
    objectLabel: '咖啡营帐',
    objectKind: 'tea',
    objectX: 6,
    objectY: -2,
    eyebrow: '睡眠习惯',
    readTime: '约 2 分钟',
    lead: '咖啡因停留在身体里的时间，可能比提神的感觉更久。',
    paragraphs: [
      '如果最近容易入睡困难或夜间醒来，可以尝试把含咖啡因饮品提前到上午，并连续观察几天。',
      '同时记录压力、午睡和睡前屏幕使用，避免把一次睡不好只归因于单一因素。',
    ],
    takeaway: '把咖啡因时间提前，是一个容易开始的小实验。',
  },
  {
    id: 'sleep-bedroom',
    islandId: 'sleep',
    title: '给睡眠准备一个安静入口',
    objectLabel: '雪松树',
    objectKind: 'tree',
    objectX: 4,
    objectY: 7,
    eyebrow: '睡眠环境',
    readTime: '约 2 分钟',
    lead: '稳定的环境线索，会提醒身体慢慢进入休息状态。',
    paragraphs: [
      '尽量保持卧室安静、黑暗和舒适，并在睡前减少使用手机、电脑等电子设备。',
      '不必一次建立完美流程。固定一个很小的动作，例如调暗灯光或提前放下手机，也能成为开始。',
    ],
    takeaway: '选择一个每晚都能重复的小动作，作为睡眠的入口。',
  },
  {
    id: 'mood-weather',
    islandId: 'mood',
    title: '情绪像天气，不是你的全部',
    objectLabel: '天气花',
    objectKind: 'flower',
    objectX: -2,
    objectY: -5,
    eyebrow: '情绪海湾',
    readTime: '约 2 分钟',
    lead: '情绪像天气一样变化，也可以被温柔观察。',
    paragraphs: [
      '周期中的情绪起伏并不需要被立刻解决。先感受它、为自己留一点空间，允许情绪静静地流淌。',
      '正念呼吸与放松训练可以作为一个轻量入口：不追着情绪分析，只花几分钟回到身体。',
    ],
    takeaway: '今天的情绪不是全部的你，它只是此刻经过的天气。',
  },
  {
    id: 'mood-breath',
    islandId: 'mood',
    title: '三分钟，先回到身体',
    objectLabel: '呼吸水晶',
    objectKind: 'crystal',
    objectX: 8,
    objectY: -1,
    eyebrow: '情绪安抚',
    readTime: '约 2 分钟',
    lead: '不急着分析情绪，也可以先让身体获得一点空间。',
    paragraphs: [
      '找一个相对安静的位置，把注意力放在呼吸、肩颈或脚底的触感上。分心很正常，发现后轻轻回来即可。',
      '这不是要求自己立刻平静，而是暂时离开信息和判断，重新听见身体。',
    ],
    takeaway: '练习的目标不是消灭情绪，而是陪自己经过它。',
  },
  {
    id: 'mood-space',
    islandId: 'mood',
    title: '情绪敏感时，怎样减少消耗？',
    objectLabel: '蘑菇避风处',
    objectKind: 'mushroom',
    objectX: 4,
    objectY: 6,
    eyebrow: '情绪照顾',
    readTime: '约 2 分钟',
    lead: '降低今天的噪声，也是一种有效的自我照顾。',
    paragraphs: [
      '可以把非必要任务延后、减少连续社交，或为自己预留十分钟不被打扰的时间。',
      '如果某种情绪反复影响生活，记录它出现的周期阶段和现实压力，会帮助你找到更完整的背景。',
    ],
    takeaway: '先保护一点精力，再处理需要面对的事情。',
  },
  {
    id: 'pain-signals',
    islandId: 'pain',
    title: '痛经时，身体在发生什么？',
    objectLabel: '疼痛灯塔',
    objectKind: 'lighthouse',
    objectX: -5,
    objectY: -7,
    eyebrow: '疼痛观察',
    readTime: '约 2 分钟',
    lead: '疼痛是身体发来的信号，记录它的出现时机和强度。',
    paragraphs: [
      '痛经常表现为下腹部痉挛性疼痛，也可能伴随疲劳、腹胀或头痛。压力和睡眠状态也值得一起观察。',
      '可以尝试每天留出几分钟放松，并记录疼痛、压力和睡眠的变化，为下一个周期留下可比较的线索。',
    ],
    takeaway: '观察不是忍耐；如果不适持续或明显影响生活，应及时寻求专业帮助。',
  },
  {
    id: 'pain-context',
    islandId: 'pain',
    title: '疼痛为什么值得和睡眠一起记？',
    objectLabel: '线索石',
    objectKind: 'crystal',
    objectX: 6,
    objectY: -1,
    eyebrow: '疼痛观察',
    readTime: '约 2 分钟',
    lead: '疼痛不是孤立发生的，压力与休息也可能构成它的背景。',
    paragraphs: [
      '记录疼痛强度时，也可以顺手记下睡眠和压力状态，观察它们是否常在同一段时间发生变化。',
      '这种记录不能替代诊断，但能帮助你更清楚地表达自己的体验，并发现值得进一步关注的模式。',
    ],
    takeaway: '把疼痛放进完整生活背景里观察，而不是只记一个数字。',
  },
  {
    id: 'pain-help',
    islandId: 'pain',
    title: '什么时候应该寻求专业帮助？',
    objectLabel: '求助信标',
    objectKind: 'shell',
    objectX: 4,
    objectY: 7,
    eyebrow: '健康提醒',
    readTime: '约 2 分钟',
    lead: '观察不是忍耐，明显影响生活的不适值得被认真对待。',
    paragraphs: [
      '如果疼痛持续、明显加重，或反复影响学习、工作、睡眠和日常活动，应及时寻求专业医疗帮助。',
      '就诊前可以整理疼痛发生时间、持续时长、强度、伴随表现和已经尝试过的方法。',
    ],
    takeaway: '需要帮助时及时求助，本身就是照顾身体的一部分。',
  },
  {
    id: 'move-period',
    islandId: 'move',
    title: '经期运动一定要停吗？',
    objectLabel: '海岸营地',
    objectKind: 'camp',
    objectX: -4,
    objectY: -5,
    eyebrow: '运动节奏',
    readTime: '约 2 分钟',
    lead: '运动强度可以顺着身体的潮汐调整。',
    paragraphs: [
      '经期可以降低强度，以休息和恢复性运动为主，例如散步、轻度有氧、瑜伽和拉伸。',
      '经后体能和耐力通常回升，可以尝试力量训练、跑步或游泳，并让强度循序渐进。',
    ],
    takeaway: '没有必须完成的强度，舒服和可持续同样重要。',
  },
  {
    id: 'move-recovery',
    islandId: 'move',
    title: '恢复性运动可以怎么选？',
    objectLabel: '椰林小径',
    objectKind: 'coconut',
    objectX: 6,
    objectY: -1,
    eyebrow: '运动节奏',
    readTime: '约 2 分钟',
    lead: '身体需要放慢时，轻量活动也可以是一种运动。',
    paragraphs: [
      '散步、温和瑜伽和拉伸都可以作为恢复性活动。重点不是完成多少，而是动作后是否更舒适。',
      '如果活动让疼痛、疲劳或不适明显加重，就暂停并重新选择今天适合的节奏。',
    ],
    takeaway: '用运动后的身体反馈，决定下一次的强度。',
  },
  {
    id: 'move-build',
    islandId: 'move',
    title: '经后如何逐渐恢复强度？',
    objectLabel: '训练帐篷',
    objectKind: 'tent',
    objectX: 4,
    objectY: 7,
    eyebrow: '运动节奏',
    readTime: '约 2 分钟',
    lead: '体能回升时，可以循序渐进地增加挑战。',
    paragraphs: [
      '经后可根据自身状态尝试力量训练、跑步或游泳，但不需要因为周期阶段而强迫自己达到某个强度。',
      '从熟悉的训练量开始，观察精力、恢复和睡眠，再决定是否增加。',
    ],
    takeaway: '阶段建议是参考，身体当天的反馈才是决定依据。',
  },
  {
    id: 'food-energy',
    islandId: 'nutrition',
    title: '一餐怎样更稳定地补充能量？',
    objectLabel: '能量餐桌',
    objectKind: 'tea',
    objectX: -6,
    objectY: -7,
    eyebrow: '饮食潮池',
    readTime: '约 2 分钟',
    lead: '吃饭不是完成任务，而是给身体补回能量。',
    paragraphs: [
      '优先选择能稳定血糖、补充能量的食物，搭配优质蛋白、复合碳水和健康脂肪，并注意饮水。',
      '经期可以关注含铁食物和富含维生素 C 的食物；经后则侧重鱼虾、蛋类、奶制品、豆制品、燕麦和糙米等。',
    ],
    takeaway: '从下一餐开始，做一个让自己更有能量的选择。',
  },
  {
    id: 'food-iron',
    islandId: 'nutrition',
    title: '经期饮食可以关注什么？',
    objectLabel: '铁元素贝壳',
    objectKind: 'shell',
    objectX: 8,
    objectY: -1,
    eyebrow: '经期饮食',
    readTime: '约 2 分钟',
    lead: '经期不需要一套完美菜单，可以先关注能量、水分和含铁食物。',
    paragraphs: [
      '可以搭配含铁食物与富含维生素 C 的食物，同时保证优质蛋白、复合碳水和水分摄入。',
      '如果食欲或胃口变化明显，就从容易吃下、能稳定补充能量的选择开始，不必追求复杂。',
    ],
    takeaway: '让下一餐更容易被身体接受，比“吃得完美”更重要。',
  },
  {
    id: 'food-after-period',
    islandId: 'nutrition',
    title: '经后如何把能量慢慢补回来？',
    objectLabel: '椰子树',
    objectKind: 'coconut',
    objectX: 4,
    objectY: 7,
    eyebrow: '经后饮食',
    readTime: '约 2 分钟',
    lead: '经后可以把注意力放在持续补充，而不是短时间“大补”。',
    paragraphs: [
      '优质蛋白可以来自鱼虾、蛋类、奶制品和豆制品；复合碳水可以选择燕麦、玉米或糙米。',
      '适量健康脂肪也能提供支持。最重要的是形成自己可以长期维持的搭配。',
    ],
    takeaway: '稳定、可持续的一餐，比短暂的补偿式进食更可靠。',
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
