import { createHash } from 'node:crypto'
import { COPY_STYLE_BRIEF } from './copyStyleBrief.mjs'
import { MOCK_CYCLE_HISTORY } from './mockCycleHistory.mjs'
import { REF_INDEX } from './refIndex.generated.mjs'
import { RESEARCH_BRIEFS } from './researchBriefs.mjs'

const OPENAI_NEXT_BASE_URL = 'https://api.openai-next.com/v1'
const DEFAULT_OPENAI_NEXT_MODEL = 'gpt-5.6-terra'
const ADVICE_CATEGORIES = ['emotion', 'diet', 'exercise', 'sleep', 'work']
const ADVICE_LABEL_PREFIXES = ['情绪：', '饮食：', '运动：', '睡眠：', '工作：']
const MAX_RESEARCH_ITEMS = 7
const MAX_HISTORY_ITEMS = 8
const CACHE_TTL_MS = 1000 * 60 * 60 * 6
const FIELD_LIMITS = {
  todayHeadline: { min: 4, max: 24 },
  todayIntro: { min: 20, max: 110 },
  advice: { min: 16, max: 95 },
}
const RESPONSE_CACHE = new Map()
const IN_FLIGHT_CACHE_WRITES = new Map()
const FAST_COPY_BY_PHASE = {
  menstrual: {
    todayHeadline: '低潮日，先照顾身体',
    todayIntro:
      '今天更适合把节奏放慢。结合过往记录，经期前两天更容易疲惫或疼痛，先把照顾身体放在前面。',
    advice: {
      emotion: '情绪敏感时先减少外界刺激，给自己十分钟安静时间，再决定是否回应消息。',
      diet: '优先温热、易消化的一餐，搭配蛋白质和水；若出血多，留意含铁食物。',
      exercise: '以休息和舒展为主，散步或轻柔拉伸即可；疼痛明显时不需要勉强运动。',
      sleep: '今晚尽量早点收尾，热敷下腹或腰背，减少睡前屏幕和临时任务。',
      work: '把待办压到最必要的几件，重会议和高消耗任务能后移就后移。',
    },
  },
  follicular: {
    todayHeadline: '上升潮，先安排一件要事',
    todayIntro:
      '今天接近卵泡期中段，精力可能比经期回升。上午留给最重要的一件事，运动和饮食先从可持续的量开始。',
    advice: {
      emotion: '如果表达欲比前几天强，可以约一次轻量沟通；若仍疲惫，先写下三句话再回复重要消息。',
      diet: '早餐或午餐补一份蛋白质，比如鸡蛋、豆腐或鱼虾，搭配燕麦、糙米等慢碳水。',
      exercise: '今天可做20分钟快走、骑行或轻力量；全程以能顺畅说话为度，结束后拉伸小腿和髋部。',
      sleep: '晚上固定一个收尾时间，睡前30分钟放下屏幕；如果想继续工作，先把明早第一步写下来。',
      work: '把方案、阅读或写作放在上午45分钟专注块里；临时会议超过两场，就删掉一件低优先级待办。',
    },
  },
  ovulatory: {
    todayHeadline: '满潮前后，留意边界',
    todayIntro:
      '今天接近能量高点，适合表达和协作。状态好时也别排得太满，给身体信号留出位置。',
    advice: {
      emotion: '表达欲增强时也先确认边界，重要消息发出前给自己三次深呼吸。',
      diet: '饮食保持均衡，多水和蔬果，减少一次性大量咖啡因或酒精。',
      exercise: '可以维持中等强度，充分热身；若下腹一侧不适，就改成低冲击活动。',
      sleep: '如果夜晚更兴奋，提前调暗灯光，把未完成的想法写下再休息。',
      work: '适合沟通、展示和推进协作，但给会后留复盘时间，不把日程塞满。',
    },
  },
  luteal: {
    todayHeadline: '平潮里，少一点拉扯',
    todayIntro:
      '今天更适合稳定节奏。从目前记录看，经前睡眠和情绪可能更敏感，先降低摩擦感。',
    advice: {
      emotion: '若情绪起伏，先不要急着归因；写下此刻感受，再选择一个低成本回应。',
      diet: '用复合碳水和蛋白质稳住能量，想吃甜时可以安排小份量，不必自责。',
      exercise: '把强度调到身体愿意配合的水平，散步、拉伸或轻力量都可以。',
      sleep: '今晚提前收尾，卧室保持凉爽；若容易醒，减少下午后的咖啡因。',
      work: '把复杂决策拆小，先完成一件明确任务，减少不必要的会议和社交消耗。',
    },
  },
}

function jsonResponse(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 24_000) {
        reject(new Error('Request body is too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function compactHistoryForCycleDay(cycleDay, periodRecords = []) {
  if (periodRecords.length > 0) {
    return periodRecords
      .slice()
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, MAX_HISTORY_ITEMS)
      .map((record) => ({
        date: record.startDate,
        periodStart: record.startDate,
        periodEnd: record.endDate,
        durationDays: record.durationDays,
      }))
  }

  const records = MOCK_CYCLE_HISTORY.records
    .map((record) => ({
      ...record,
      distance: Math.abs(record.cycleDay - cycleDay),
    }))
    .sort((a, b) => a.distance - b.distance || b.date.localeCompare(a.date))
    .slice(0, MAX_HISTORY_ITEMS)

  return records.map(({ distance: _distance, ...record }) => record)
}

function selectResearchBriefs(request, history) {
  const phase = request.cycle.phase
  const historyTerms = termsFromHistory(history, request.cycle.cycleDay)
  const fileBriefs = REF_INDEX.map((brief) => ({
    ...brief,
    relevance: scoreReferenceBrief(brief, phase, historyTerms),
  }))
    .filter((brief) => brief.relevance > 0)
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        b.score - a.score ||
        a.source.localeCompare(b.source),
    )
    .filter(uniqueEvidenceBrief())
    .slice(0, MAX_RESEARCH_ITEMS - 2)
    .map(({ relevance: _relevance, score: _score, ...brief }) => brief)

  const selected = RESEARCH_BRIEFS.filter((brief) =>
    brief.phases.includes(phase),
  ).slice(0, 2)

  const builtIns = selected.some((brief) => brief.id === 'moonwave-tone')
    ? selected
    : [
        ...selected,
        RESEARCH_BRIEFS.find((brief) => brief.id === 'moonwave-tone'),
      ].filter(Boolean)

  return [...fileBriefs, ...builtIns].slice(0, MAX_RESEARCH_ITEMS)
}

function uniqueEvidenceBrief() {
  const seenTitles = new Set()
  const seenTexts = new Set()
  return (brief) => {
    const titleKey = brief.title?.toLowerCase().replace(/\W+/g, ' ').trim()
    const textKey = brief.text.toLowerCase().replace(/\W+/g, ' ').slice(0, 180)
    if (titleKey && seenTitles.has(titleKey)) return false
    if (seenTexts.has(textKey)) return false
    if (titleKey) seenTitles.add(titleKey)
    seenTexts.add(textKey)
    return true
  }
}

function termsFromHistory(history, cycleDay) {
  const values = new Set()
  for (const record of history) {
    if (Math.abs(record.cycleDay - cycleDay) > 5) continue
    for (const symptom of record.symptoms ?? []) values.add(symptom)
    for (const mood of record.mood ?? []) values.add(mood)
    if (record.sleep === '低') values.add('sleep')
    if (record.energy === '低') values.add('fatigue')
    if (record.flow === 'heavy') values.add('heavy bleeding')
  }
  return [...values]
}

function scoreReferenceBrief(brief, phase, historyTerms) {
  let score = 0
  const source = brief.source.toLowerCase()
  if (source.includes('www_nhs') || source.includes('www_nice') || source.includes('www_who')) {
    score += 8
  }
  if (source.includes('acog-cycle-care')) score += 10
  if (source.includes('www_acog')) score -= 10
  if (source.includes('1-s2.md') || source.includes('piis')) score -= 4
  if (brief.phases.includes(phase)) score += 8
  if (brief.phases.length === 4) score += 2
  for (const category of brief.categories) {
    if (ADVICE_CATEGORIES.includes(category)) score += 1
  }
  const text = `${brief.title} ${brief.text}`.toLowerCase()
  const phaseTerms = {
    menstrual: ['menses', 'menstruation', 'bleeding', 'period', '经期', '出血'],
    follicular: ['follicular', 'estrogen', 'estradiol', '卵泡'],
    ovulatory: ['ovulation', 'lh surge', 'fertile', '排卵'],
    luteal: ['luteal', 'progesterone', 'pms', 'premenstrual', '黄体', '经前'],
  }
  if (phaseTerms[phase]?.some((term) => text.includes(term))) score += 6
  if (/conclusion:.*risk|cardiovascular|mortality|dementia|fertility|pregnancy/.test(text)) {
    score -= 6
  }
  if (/nsaids?|progestogen|contraception|hysterectomy|myomectomy|embolisation|tranexamic|levonorgestrel|lng-ius|gnrh|uterine fibroids/.test(text)) {
    score -= 20
  }
  if (/marijuana|cannabis|air pollution|endocrine disrupting|pesticide|cardiovascular|cerebrovascular|dementia/.test(text)) {
    score -= 12
  }
  if (/should|can|may|try|help|advice|建议|可以|避免|优先/.test(text)) {
    score += 4
  }
  for (const term of historyTerms) {
    if (text.includes(String(term).toLowerCase())) score += 3
  }
  if (phase === 'menstrual' && brief.topics.some((topic) => topic === 'pain' || topic === 'bleeding')) {
    score += 4
  }
  if (phase === 'luteal' && brief.topics.some((topic) => topic === 'mood' || topic === 'sleep')) {
    score += 4
  }
  return score
}

async function buildPromptInput(request) {
  const history = compactHistoryForCycleDay(
    request.cycle.cycleDay,
    request.cycle.periodRecords,
  )
  const research = selectResearchBriefs(request, history)

  return {
    product: {
      name: 'MoonWave 月潮',
      surface: '首页潮汐日志',
      tone: '中文、温柔、具体、非诊断、保留潮汐隐喻但不要堆砌修辞',
    },
    task:
      '基于今日周期位置、用户真实往期经期记录和参考摘要，生成首页 todayHeadline、todayIntro 和五类 advice。',
    copy_style_reference: COPY_STYLE_BRIEF,
    copy_style_examples: {
      phase: request.cycle.phase,
      note: '以下是工程内置静态文案的句式参考。请学习结构、信息密度和语气，不要照抄原句；输出要结合用户历史数据改写。',
      example: FAST_COPY_BY_PHASE[request.cycle.phase],
    },
    output_contract: {
      type: 'json_object_only',
      shape: {
        todayHeadline: 'string, 4-24 Chinese chars',
        todayIntro: 'string, 20-110 Chinese chars',
        advice: {
          emotion: 'string, 16-95 Chinese chars',
          diet: 'string, 16-95 Chinese chars',
          exercise: 'string, 16-95 Chinese chars',
          sleep: 'string, 16-95 Chinese chars',
          work: 'string, 16-95 Chinese chars',
        },
      },
    },
    safety_rules: [
      '不要诊断疾病，不要暗示确定患有 PMS、PMDD、贫血、内异症等。',
      '不要给药物剂量或治疗方案。',
      '如果提到异常出血或剧烈疼痛，只能作为边界提醒，语气简短。',
      '优先使用用户重复出现的模式；数据不足时使用“从目前记录看/可以先观察”。',
      '每条建议必须具体可执行，适合手机首页短文案展示。',
      '每条 advice 必须包含动作对象或例子，不能只写感受、态度或抽象原则。',
      'todayHeadline 使用“潮汐状态 + 一个具体提醒”的短句结构；todayIntro 用两句完成“阶段状态/可能感受 + 今天可以做什么”。',
      '每条 advice 尽量用“如果/当……，可以/优先……；如果……，就……”的自然句式，先解释状态，再给动作，最后给身体反馈边界。',
      '不要使用 copy_style_reference.bannedPatterns 中的空泛表达；如果必须表达相近意思，改写成具体动作。',
      '参考文献只作为 evidence_briefs 使用；不要复制长句，不要输出英文引用，不要声称确定因果。',
      '静态示例只用于学习表达风格，禁止逐字或近似复述示例中的标题、引导语和建议；必须根据 today、用户历史记录和 evidence_briefs 重新组织内容。',
    ],
    today: request,
    user_history_summary: {
      source: request.cycle.periodRecords.length > 0 ? '用户导入的经期数据' : MOCK_CYCLE_HISTORY.sourceLabel,
      cycleCount: request.cycle.periodRecords.length || MOCK_CYCLE_HISTORY.cycleCount,
      selectedRecentAndSimilarRecords: history,
    },
    evidence_workflow: {
      index: 'server/refIndex.generated.mjs',
      source_dir: 'src/ref/*.md',
      method:
        '预先过滤网页噪音、AI 使用受限声明、base64 图片、参考文献表；按主题、阶段、建议类别和用户历史症状选择短片段。',
      selection:
        '每次请求只传入与今日阶段和用户历史记录最相关的 evidence_briefs，避免整篇文档进入 prompt。',
    },
    evidence_briefs: research,
  }
}

function cacheKeyForPrompt(promptInput) {
  return createHash('sha256')
    .update(JSON.stringify(promptInput))
    .digest('hex')
}

function readCachedResult(key) {
  const cached = RESPONSE_CACHE.get(key)
  if (!cached) return null
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    RESPONSE_CACHE.delete(key)
    return null
  }
  return cached.result
}

function writeCachedResult(key, result) {
  RESPONSE_CACHE.set(key, {
    createdAt: Date.now(),
    result,
  })
}

function fastResultForRequest(request) {
  return FAST_COPY_BY_PHASE[request.cycle.phase] ?? FAST_COPY_BY_PHASE.follicular
}

function fillCacheInBackground(cacheKey, promptInput) {
  const existing = IN_FLIGHT_CACHE_WRITES.get(cacheKey)
  if (existing) return existing

  const task = callOpenAiNext(promptInput)
    .then((result) => {
      writeCachedResult(cacheKey, result)
      return result
    })
    .catch(() => null)
    .finally(() => {
      IN_FLIGHT_CACHE_WRITES.delete(cacheKey)
    })

  IN_FLIGHT_CACHE_WRITES.set(cacheKey, task)
  return task
}

function validateRequest(value) {
  if (!value || typeof value !== 'object') return null
  const cycle = value.cycle
  if (!cycle || typeof cycle !== 'object') return null
  if (typeof value.date !== 'string') return null
  if (typeof cycle.cycleDay !== 'number') return null
  if (typeof cycle.cycleLength !== 'number') return null
  if (typeof cycle.phase !== 'string') return null
  if (typeof cycle.tide !== 'string') return null
  if (typeof cycle.currentCycleStart !== 'string') return null
  if (!Array.isArray(cycle.periodStarts)) return null
  if (cycle.periodRecords === undefined) cycle.periodRecords = []
  if (!Array.isArray(cycle.periodRecords)) return null
  if (cycle.periodRecords.some((record) =>
    !record ||
    typeof record.startDate !== 'string' ||
    typeof record.endDate !== 'string' ||
    typeof record.durationDays !== 'number'
  )) return null
  return value
}

function extractOutputText(responseBody) {
  if (typeof responseBody.output_text === 'string') return responseBody.output_text

  const chunks = []
  for (const item of responseBody.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        chunks.push(content.text)
      }
    }
  }
  return chunks.join('\n')
}

function parseAiJson(text) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

function validateAiResult(value) {
  if (!value || typeof value !== 'object') return null
  if (!isDisplayLength(value.todayHeadline, FIELD_LIMITS.todayHeadline)) {
    return null
  }
  if (!isDisplayLength(value.todayIntro, FIELD_LIMITS.todayIntro)) return null
  if (!value.advice || typeof value.advice !== 'object') return null

  const advice = {}
  for (const category of ADVICE_CATEGORIES) {
    const copy = value.advice[category]
    if (!isDisplayLength(copy, FIELD_LIMITS.advice)) return null
    if (ADVICE_LABEL_PREFIXES.some((prefix) => copy.trim().startsWith(prefix))) {
      return null
    }
    advice[category] = copy.trim()
  }

  return {
    todayHeadline: value.todayHeadline.trim(),
    todayIntro: value.todayIntro.trim(),
    advice,
  }
}

function isDisplayLength(value, limit) {
  if (typeof value !== 'string') return false
  if (COPY_STYLE_BRIEF.bannedPatterns.some((pattern) => value.includes(pattern))) {
    return false
  }
  const length = [...value.trim()].length
  return length >= limit.min && length <= limit.max
}

async function callOpenAiNext(promptInput) {
  const apiKey = normalizeSecret(process.env.OPENAI_NEXT_API_KEY)
  const model = normalizeModel(process.env.OPENAI_NEXT_MODEL)

  if (!apiKey) {
    throw new Error('Missing OPENAI_NEXT_API_KEY')
  }

  const response = await fetch(`${OPENAI_NEXT_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: 'high' },
      input: [
        {
          role: 'system',
          content:
            'You are MoonWave daily journal writer. Return only valid JSON that matches the requested contract.',
        },
        {
          role: 'user',
          content: JSON.stringify(promptInput),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'daily_journal',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['todayHeadline', 'todayIntro', 'advice'],
            properties: {
              todayHeadline: { type: 'string' },
              todayIntro: { type: 'string' },
              advice: {
                type: 'object',
                additionalProperties: false,
                required: ADVICE_CATEGORIES,
                properties: Object.fromEntries(
                  ADVICE_CATEGORIES.map((category) => [
                    category,
                    { type: 'string' },
                  ]),
                ),
              },
            },
          },
        },
      },
    }),
  })

  const body = await response.json()
  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      JSON.stringify(body).slice(0, 500) ||
      `OpenAI Next failed: ${response.status}`
    const reason = new Error(
      `OpenAI Next ${response.status} for model ${model}: ${message}`,
    )
    reason.name = 'OpenAiNextError'
    throw reason
  }

  const parsed = validateAiResult(parseAiJson(extractOutputText(body)))
  if (!parsed) throw new Error('AI response does not match daily journal schema')
  return parsed
}

function normalizeSecret(value) {
  const secret = value?.trim()
  if (!secret || secret === 'undefined' || secret === 'null') return ''
  return secret
}

function normalizeModel(value) {
  const model = value?.trim()
  if (!model || model === 'undefined' || model === 'null') {
    return DEFAULT_OPENAI_NEXT_MODEL
  }
  return model
}

export async function handleDailyJournalRequest(req, res) {
  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  try {
    const request = validateRequest(await readJson(req))
    if (!request) {
      jsonResponse(res, 400, { ok: false, error: 'Invalid daily journal request' })
      return
    }

    const promptInput = await buildPromptInput(request)
    const cacheKey = cacheKeyForPrompt(promptInput)
    const cached = readCachedResult(cacheKey)
    if (cached) {
      jsonResponse(res, 200, { ok: true, source: 'cache', result: cached })
      return
    }

    const result = await fillCacheInBackground(cacheKey, promptInput)
    if (!result) {
      jsonResponse(res, 502, {
        ok: false,
        error: 'Daily journal AI response unavailable',
      })
      return
    }

    jsonResponse(res, 200, { ok: true, source: 'ai', result })
  } catch (error) {
    jsonResponse(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Daily journal failed',
    })
  }
}

export const internals = {
  buildPromptInput,
  compactHistoryForCycleDay,
  selectResearchBriefs,
  validateAiResult,
  cacheKeyForPrompt,
}
