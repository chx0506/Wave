import { useInViewOnce } from '@/lib/useInViewOnce'
import type { ReactNode } from 'react'
import styles from './CoastScrollSection.module.css'

type Props = {
  children: ReactNode
  className?: string
  label?: string
}

export function CoastScrollSection({ children, className, label }: Props) {
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.14)

  return (
    <div
      ref={ref}
      className={[styles.section, className].filter(Boolean).join(' ')}
      data-visible={visible ? '1' : '0'}
      {...(label ? { 'aria-label': label } : {})}
    >
      {children}
    </div>
  )
}
