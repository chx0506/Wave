import { APP_NAME, APP_NAME_ZH } from '@/domain/copy'
import { clearImportIntent, hasImportIntent } from '@/lib/importLink'
import styles from './WelcomeScreen.module.css'

const HERO_SRC = '/textures/welcome-hero-blue.png'

type Props = {
  onEnter: () => void
}

export function WelcomeScreen({ onEnter }: Props) {
  const showImportEntry = hasImportIntent()

  return (
    <div className={styles.screen}>
      <section className={styles.heroStage} aria-hidden="true">
        <img className={styles.hero} src={HERO_SRC} alt="" draggable={false} />
        <div className={styles.brandBlock}>
          <p className={styles.brand}>{APP_NAME}</p>
          <p className={styles.brandZh}>{APP_NAME_ZH}</p>
        </div>
      </section>

      <section className={styles.copy}>
        <h1 className={styles.title}>感知身体的潮汐</h1>
        <p className={styles.subtitle}>
          <span className={styles.subDot} aria-hidden="true" />
          用涨潮与退潮，读懂你的28天节律
          <span className={styles.subDot} aria-hidden="true" />
        </p>
      </section>

      <section className={styles.actions}>
        {showImportEntry ? (
          <>
            <p className={styles.importHint}>
              打开后需你授权，并从原 App 选择导出文件
            </p>
            <button type="button" className={styles.cta} onClick={onEnter}>
              导入已有经期数据
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                clearImportIntent()
                onEnter()
              }}
            >
              先随便看看
            </button>
          </>
        ) : (
          <button type="button" className={styles.cta} onClick={onEnter}>
            开始感知
          </button>
        )}
        <div className={styles.mark} aria-hidden="true">
          <span className={styles.markSun} />
          <span className={styles.markWave} />
        </div>
      </section>
    </div>
  )
}
