import styles from './StatusBar.module.css'

export function StatusBar() {
  return (
    <div className={styles.bar} aria-hidden="true">
      <span className={styles.time}>9:41</span>
      <span className={styles.icons}>
        <Signal />
        <Wifi />
        <Battery />
      </span>
    </div>
  )
}

function Signal() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <rect x="0" y="7.5" width="3" height="4.5" rx="0.6" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.6" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="0.6" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.6" opacity="0.35" />
    </svg>
  )
}

function Wifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1.2 4.6a10 10 0 0 1 13.6 0" />
      <path d="M3.6 7a6.4 6.4 0 0 1 8.8 0" />
      <circle cx="8" cy="10.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Battery() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.6" y="0.6" width="20.8" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.4" y="2.4" width="17.2" height="7.2" rx="1.2" fill="currentColor" />
      <rect x="22.2" y="3.6" width="2" height="4.8" rx="0.7" fill="currentColor" />
    </svg>
  )
}
