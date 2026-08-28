import { useEffect, useRef, useState } from 'react'

export function useInViewOnce<T extends Element>(
  threshold = 0.18,
  rootMargin = '0px 0px -6% 0px',
) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, visible])

  return { ref, visible }
}
