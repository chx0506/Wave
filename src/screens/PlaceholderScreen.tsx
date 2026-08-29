import { CRAB_NAME, TAB_SECTION } from '@/domain/copy'
import type { TabId } from '@/domain/types'
import styles from './PlaceholderScreen.module.css'

const BODY: Record<TabId, string> = {
  home: '',
  calendar: '在日历上查看周期阶段、潮汐高度与每日摘要，补记过往状态。',
  stats: '汇总经期历史、身体线索与小实验，生成温和的身体洞察。',
  explore: '周期、PMS、睡眠与情绪……健康知识变成可逐渐探索的岛屿与图鉴。',
}

export function PlaceholderScreen({ tab }: { tab: TabId }) {
  return (
    <div className={styles.screen}>
      <div className={styles.panel}>
        <p className={styles.kicker}>{CRAB_NAME} 说</p>
        <h1 className={styles.title}>{TAB_SECTION[tab]}</h1>
        <p className={styles.body}>{BODY[tab]}</p>
        <p className={styles.note}>这一页还在涨潮中，先从首页潮汐日志用起来。</p>
      </div>
    </div>
  )
}
