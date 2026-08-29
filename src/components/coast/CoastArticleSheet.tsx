import type { ExploreArticle } from '@/data/content'
import { X } from '@phosphor-icons/react'
import styles from './CoastArticleSheet.module.css'

type Props = {
  article: ExploreArticle
  locked: boolean
  onClose: () => void
}

export function CoastArticleSheet({ article, locked, onClose }: Props) {
  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={article.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{article.eyebrow}</p>
            <h2 className={styles.title}>{article.title}</h2>
            <p className={styles.subtitle}>{article.readTime}</p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className={styles.body}>
          {locked ? (
            <p className={styles.lockedLead}>
              这篇科普文章是岛上的特别藏品，解锁后即可阅读完整内容。
            </p>
          ) : (
            <>
              <p className={styles.lead}>{article.lead}</p>
              {article.paragraphs.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
              <blockquote className={styles.takeaway}>{article.takeaway}</blockquote>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
