import { useState, useEffect } from 'react'

const KEY = 'nbd:theme'

function getPreference(): boolean {
  const stored = localStorage.getItem(KEY)
  if (stored !== null) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(getPreference)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  // Sync with OS preference changes (only when no manual override in localStorage)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onOsChange(e: MediaQueryListEvent) {
      if (!localStorage.getItem(KEY)) setIsDark(e.matches)
    }
    mq.addEventListener('change', onOsChange)
    return () => mq.removeEventListener('change', onOsChange)
  }, [])

  return [isDark, () => setIsDark(d => !d)]
}
