import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const REF_DIR = path.join(ROOT, 'src', 'ref')
const OUT_FILE = path.join(ROOT, 'server', 'refIndex.generated.mjs')
const MAX_CHUNKS_PER_DOC = 18
const MIN_CHARS = 120
const MAX_CHARS = 520

const TOPIC_KEYWORDS = {
  cycle: [
    'menstrual cycle',
    'cycle length',
    'regular cycle',
    'irregular',
    'follicular',
    'luteal',
    'ovulation',
    'progesterone',
    'estrogen',
    'estradiol',
    '月经周期',
    '卵泡期',
    '黄体期',
    '排卵',
  ],
  bleeding: [
    'bleeding',
    'menstruation',
    'menses',
    'period',
    'heavy menstrual bleeding',
    'abnormal uterine bleeding',
    '经血',
    '出血',
    '经期',
  ],
  pain: [
    'pain',
    'dysmenorrhea',
    'cramp',
    'pelvic pain',
    'prostaglandin',
    '痛经',
    '疼痛',
    '痉挛',
  ],
  mood: [
    'mood',
    'emotion',
    'anxiety',
    'irritability',
    'depression',
    'PMS',
    'PMDD',
    '情绪',
    '焦虑',
    '易怒',
  ],
  sleep: [
    'sleep',
    'insomnia',
    'fatigue',
    'tired',
    'HRV',
    'heart rate variability',
    '睡眠',
    '疲惫',
    '疲劳',
  ],
  diet: [
    'diet',
    'nutrition',
    'iron',
    'vitamin',
    'magnesium',
    'caffeine',
    'alcohol',
    '饮食',
    '营养',
    '铁',
    '维生素',
    '咖啡因',
  ],
  exercise: [
    'exercise',
    'physical activity',
    'training',
    'sport',
    'aerobic',
    'strength',
    '运动',
    '训练',
  ],
  work: [
    'stress',
    'concentration',
    'cognition',
    'performance',
    'work',
    '压力',
    '专注',
    '工作',
  ],
}

const BOILERPLATE_PATTERNS = [
  /contents lists available/i,
  /journal homepage/i,
  /article history/i,
  /cookies?/i,
  /privacy/i,
  /advertising partners/i,
  /javascript:void/i,
  /data:image/i,
  /base64/i,
  /download and print pdf/i,
  /all rights reserved/i,
  /copyright/i,
  /references/i,
  /bibliography/i,
  /^table\s+\d+/i,
  /^fig(ure)?\./i,
]

const TREATMENT_PATTERNS = [
  /NSAIDs?/i,
  /progestogen/i,
  /contraception/i,
  /hysterectomy/i,
  /myomectomy/i,
  /embolisation/i,
  /tranexamic/i,
  /levonorgestrel/i,
  /LNG-IUS/i,
  /GnRH/i,
  /uterine fibroids/i,
  /marijuana/i,
  /cannabis/i,
  /air pollution/i,
  /endocrine disrupting/i,
  /pesticide/i,
]

const AI_RESTRICTED_PATTERNS = [
  /not be .*used.*train.*artificial intelligence/i,
  /generative artificial intelligence/i,
  /language model/i,
]

function classify(text) {
  const lower = text.toLowerCase()
  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) =>
      keywords.some((keyword) => lower.includes(keyword.toLowerCase())),
    )
    .map(([topic]) => topic)
}

function inferPhases(topics, text) {
  const lower = text.toLowerCase()
  const phases = []
  if (/menses|menstruation|bleeding|period|dysmenorrhea|经期|出血|痛经/.test(lower)) {
    phases.push('menstrual')
  }
  if (/follicular|estrogen|estradiol|卵泡/.test(lower)) phases.push('follicular')
  if (/ovulation|fertile|lh surge|排卵/.test(lower)) phases.push('ovulatory')
  if (/luteal|progesterone|pms|pmdd|黄体|经前/.test(lower)) phases.push('luteal')
  if (phases.length === 0 && topics.includes('cycle')) {
    phases.push('menstrual', 'follicular', 'ovulatory', 'luteal')
  }
  return [...new Set(phases)]
}

function inferCategories(topics) {
  const categories = new Set()
  if (topics.includes('mood')) categories.add('emotion')
  if (topics.includes('diet')) categories.add('diet')
  if (topics.includes('exercise')) categories.add('exercise')
  if (topics.includes('sleep')) categories.add('sleep')
  if (topics.includes('work')) categories.add('work')
  if (topics.includes('pain') || topics.includes('bleeding')) {
    categories.add('emotion')
    categories.add('work')
    categories.add('sleep')
  }
  if (categories.size === 0) {
    categories.add('emotion')
    categories.add('diet')
    categories.add('exercise')
    categories.add('sleep')
    categories.add('work')
  }
  return [...categories]
}

function cleanLine(line) {
  return line
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/URL\s*🔗/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#*_`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isReferenceSection(line) {
  return /^#+?\s*(references|bibliography|works cited|reference list)\b/i.test(
    line.trim(),
  )
}

function isCitationListItem(line) {
  const text = line.trim()
  return (
    /^\d{1,3}\.\s+[A-Z][A-Za-z-]+(\s+[A-Z][A-Za-z-]+)?\s+[A-Z]{1,4}/.test(
      text,
    ) ||
    /\b[A-Z][a-z]+ [A-Z][a-z]+ \d{4};\d+:\d+/.test(text) ||
    /\bdoi:\s*\d+\./i.test(text)
  )
}

function isUsefulParagraph(text) {
  if (text.length < MIN_CHARS) return false
  if (BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text))) return false
  if (TREATMENT_PATTERNS.some((pattern) => pattern.test(text))) return false
  if (AI_RESTRICTED_PATTERNS.some((pattern) => pattern.test(text))) return false
  if ((text.match(/[A-Za-z0-9+/=]{80,}/g) ?? []).length > 0) return false
  if ((text.match(/\bURL\b/g) ?? []).length > 1) return false
  if (isCitationListItem(text)) return false
  return classify(text).length > 0
}

function chunkDocument(raw) {
  const cleaned = []
  for (const rawLine of raw.split(/\r?\n/)) {
    if (isReferenceSection(rawLine)) break
    const line = cleanLine(rawLine)
    if (!line) continue
    if (isCitationListItem(line)) continue
    if (BOILERPLATE_PATTERNS.some((pattern) => pattern.test(line))) continue
    cleaned.push(line)
  }

  const chunks = []
  let buffer = ''
  for (const line of cleaned) {
    const next = buffer ? `${buffer} ${line}` : line
    if (next.length > MAX_CHARS) {
      if (isUsefulParagraph(buffer)) chunks.push(buffer)
      buffer = line
    } else {
      buffer = next
    }
  }
  if (isUsefulParagraph(buffer)) chunks.push(buffer)
  return chunks
}

function titleFor(filename, raw) {
  const heading = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#\s+/.test(line))
  return heading ? cleanLine(heading) : filename.replace(/\.md$/i, '')
}

function scoreChunk(text) {
  const topics = classify(text)
  let score = topics.length * 3
  if (/abstract|summary|conclusion|key findings|recommend|guideline/i.test(text)) {
    score += 5
  }
  if (/\b\d+([–-]\d+)?\s*(days?|hours?|minutes?|%|ml|mmol|nmol)\b/i.test(text)) {
    score += 2
  }
  if (/should|may|can|associated|increase|decrease|higher|lower|建议|可以|通常/.test(text)) {
    score += 1
  }
  return score
}

async function main() {
  const files = (await readdir(REF_DIR))
    .filter((file) => /\.md$/i.test(file))
    .sort()

  const documents = []
  for (const file of files) {
    const fullPath = path.join(REF_DIR, file)
    const raw = await readFile(fullPath, 'utf8')
    const chunks = chunkDocument(raw)
      .map((text, index) => {
        const topics = classify(text)
        return {
          id: `${file}#${index + 1}`,
          source: `src/ref/${file}`,
          title: titleFor(file, raw),
          topics,
          phases: inferPhases(topics, text),
          categories: inferCategories(topics),
          text: text.slice(0, MAX_CHARS),
          score: scoreChunk(text),
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CHUNKS_PER_DOC)

    documents.push(...chunks)
  }

  const body = `// Generated by scripts/build-ref-index.mjs. Do not edit by hand.\nexport const REF_INDEX = ${JSON.stringify(documents, null, 2)}\n`
  await writeFile(OUT_FILE, body)
  console.log(
    JSON.stringify(
      {
        output: path.relative(ROOT, OUT_FILE),
        files: files.length,
        chunks: documents.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
