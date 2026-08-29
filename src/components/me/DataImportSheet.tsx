import { X, UploadSimple, CheckCircle, WarningCircle, LinkSimple, ShareNetwork } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import {
  IMPORT_FORMAT_HINTS,
  type ImportResult,
  parseImportFile,
} from '@/domain/importCycle'
import { formatMonthDay } from '@/domain/dates'
import { readImportFile } from '@/lib/importFileReader'
import { buildImportShareUrl, copyImportShareLink } from '@/lib/importLink'
import styles from './DataImportSheet.module.css'

type Props = {
  onClose: () => void
  onImport: (result: Extract<ImportResult, { ok: true }>) => void
  importedFrom?: string
  /** Share-link entry — show consent before file picker. */
  requireConsent?: boolean
}

type Step = 'consent' | 'pick' | 'preview'

export function DataImportSheet({
  onClose,
  onImport,
  importedFrom,
  requireConsent = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>(requireConsent ? 'consent' : 'pick')
  const [preview, setPreview] = useState<Extract<ImportResult, { ok: true }> | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const shareUrl = buildImportShareUrl()

  const handleCopyLink = async () => {
    const copied = await copyImportShareLink()
    if (copied) {
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2200)
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'MoonWave 月潮',
          text: '从其他经期 App 导入历史记录，在 MoonWave 继续读懂自己的潮汐。',
          url: shareUrl,
        })
        return
      } catch {
        /* user cancelled or share failed */
      }
    }
    void handleCopyLink()
  }

  const handleFile = async (file: File) => {
    setBusy(true)
    setError(null)
    setPreview(null)

    try {
      const { text, filename } = await readImportFile(file)
      const result = parseImportFile(text, filename)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setPreview(result)
      setStep('preview')
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '读取文件失败，请重试。',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = () => {
    if (!preview) return
    onImport(preview)
    onClose()
  }

  const handleConsent = () => {
    setStep('pick')
    window.requestAnimationFrame(() => inputRef.current?.click())
  }

  const handleDecline = () => {
    onClose()
  }

  if (step === 'consent') {
    return (
      <div className={styles.overlay} role="presentation" onClick={handleDecline}>
        <div
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-label="授权导入经期记录"
          onClick={(event) => event.stopPropagation()}
        >
          <span className={styles.handle} aria-hidden="true" />
          <button
            type="button"
            className={styles.close}
            onClick={handleDecline}
            aria-label="关闭"
          >
            <X size={17} weight="bold" />
          </button>

          <h2 className={styles.title}>授权导入经期记录</h2>
          <p className={styles.lead}>
            你通过邀请链接进入 MoonWave。接下来可以把你已在其他 App 里记录的经期数据带过来。
          </p>

          <section className={styles.consentBlock} aria-label="授权说明">
            <p className={styles.consentNote}>
              浏览器<strong>无法直接读取</strong>手机里的 Clue、Flo、美柚或 Apple 健康 App。
              需要你先从原 App 导出数据文件，再<strong>授权 MoonWave 读取该文件</strong>。
            </p>
            <dl className={styles.consentList}>
              <div>
                <dt>将读取</dt>
                <dd>经期开始日期，用于推算周期节奏</dd>
              </div>
              <div>
                <dt>不会</dt>
                <dd>上传服务器、访问其他 App 内部数据、未经同意读取文件</dd>
              </div>
              <div>
                <dt>保存位置</dt>
                <dd>仅保存在本设备，可随时重新导入</dd>
              </div>
            </dl>
          </section>

          <div className={styles.consentActions}>
            <button type="button" className={styles.pickBtn} onClick={handleConsent}>
              <UploadSimple size={18} weight="bold" />
              <span>同意并选择文件</span>
            </button>
            <button type="button" className={styles.declineBtn} onClick={handleDecline}>
              暂不同意
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="数据导入"
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.handle} aria-hidden="true" />
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={17} weight="bold" />
        </button>

        <h2 className={styles.title}>数据导入</h2>
        <p className={styles.lead}>
          从其他经期 App 导入历史记录，MoonWave 会自动推算你的周期节奏。
        </p>

        {importedFrom ? (
          <p className={styles.importedBadge}>
            <CheckCircle size={15} weight="fill" />
            已导入自 {importedFrom}
          </p>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,.xml,.zip,text/csv,application/json,text/xml,application/zip,application/x-zip-compressed"
          className={styles.fileInput}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />

        <button
          type="button"
          className={styles.pickBtn}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <UploadSimple size={18} weight="bold" />
          <span>{busy ? '正在读取…' : '选择导出文件'}</span>
        </button>

        <ul className={styles.hints}>
          {IMPORT_FORMAT_HINTS.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>

        <section className={styles.shareBlock} aria-label="分享邀请链接">
          <p className={styles.shareKicker}>分享给朋友</p>
          <p className={styles.shareCopy}>
            朋友打开链接后会先看到授权说明，同意后再选择她从原 App 导出的数据文件。
          </p>
          <div className={styles.shareActions}>
            <button type="button" className={styles.shareBtn} onClick={() => void handleShare()}>
              <ShareNetwork size={16} weight="bold" />
              <span>分享邀请链接</span>
            </button>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => void handleCopyLink()}
              aria-label="复制邀请链接"
            >
              <LinkSimple size={16} weight="bold" />
              <span>{linkCopied ? '已复制' : '复制链接'}</span>
            </button>
          </div>
        </section>

        {error ? (
          <p className={styles.error} role="alert">
            <WarningCircle size={16} weight="fill" />
            {error}
          </p>
        ) : null}

        {preview ? (
          <section className={styles.preview} aria-label="导入预览">
            <p className={styles.previewKicker}>识别结果</p>
            <h3 className={styles.previewTitle}>{preview.data.sourceLabel}</h3>
            <dl className={styles.previewStats}>
              <div>
                <dt>经期记录</dt>
                <dd>{preview.data.periodStarts.length} 次</dd>
              </div>
              <div>
                <dt>平均周期</dt>
                <dd>{preview.avgCycleLength} 天</dd>
              </div>
              <div>
                <dt>最近经期</dt>
                <dd>{formatMonthDay(preview.cycleConfig.currentCycleStart)}</dd>
              </div>
            </dl>
            <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
              确认导入
            </button>
          </section>
        ) : null}
      </div>
    </div>
  )
}
