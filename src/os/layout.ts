import { useSyncExternalStore } from 'react'

/** Height of the bottom taskbar on desktop / tablet (px) */
export const TASKBAR_H = 56

export type LayoutMode = 'mobile' | 'tablet' | 'desktop'

const mqTablet = window.matchMedia('(min-width: 768px)')
const mqDesktop = window.matchMedia('(min-width: 1024px)')

const subscribe = (notify: () => void) => {
  mqTablet.addEventListener('change', notify)
  mqDesktop.addEventListener('change', notify)
  return () => {
    mqTablet.removeEventListener('change', notify)
    mqDesktop.removeEventListener('change', notify)
  }
}

export const readLayoutMode = (): LayoutMode => (mqDesktop.matches ? 'desktop' : mqTablet.matches ? 'tablet' : 'mobile')

/** mobile < 768 ≤ tablet < 1024 ≤ desktop */
export function useLayoutMode() {
  return useSyncExternalStore(subscribe, readLayoutMode, () => 'desktop' as LayoutMode)
}
