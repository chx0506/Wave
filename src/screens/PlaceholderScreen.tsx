import { TAB_LABEL } from '@/domain/copy'
import type { TabId } from '@/domain/types'
import styles from './PlaceholderScreen.module.css'

export function PlaceholderScreen({ tab }: { tab: TabId }) {
  const copy =
    tab === 'record'
      ? {
          title: '记录',
          body: '潮汐、天气、海滩。三问记完一天。',
        }
      : {
          title: '图鉴',
          body: '记过的身体线索，会慢慢在这里浮出水面。',
        }

  return (
    <div className={styles.screen}>
      <div className={styles.panel}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.body}>{copy.body}</p>
        <p className={styles.note}>「{TAB_LABEL[tab]}」页还在打磨，先从海岸和日历用起来。</p>
      </div>
    </div>
  )
}
