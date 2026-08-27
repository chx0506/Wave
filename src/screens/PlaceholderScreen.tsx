import { CRAB_NAME, TAB_SECTION } from '@/domain/copy'
import type { TabId } from '@/domain/types'
import styles from './PlaceholderScreen.module.css'

const BODY: Record<TabId, string> = {
  home: '',
  observe: '围绕一个真实困扰，做简单可持续的身体小实验：提出问题 → 尝试改变 → 持续观察 → 对比反馈。',
  bay: '呼吸、身体扫描、冥想与睡前放松。当你需要的时候，给自己几分钟从外界回到身体。',
  explore: '周期、PMS、睡眠与情绪……健康知识变成可逐渐探索的岛屿与图鉴。',
  me: '周期特点、身体线索、小实验与个人经验，会慢慢汇成一份身体航海日志。',
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
