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

const read = (): LayoutMode => (mqDesktop.matches ? 'desktop' : mqTablet.matches ? 'tablet' : 'mobile')

/** mobile < 768 ≤ tablet < 1024 ≤ desktop */
export function useLayoutMode() {
  return useSyncExternalStore(subscribe, read, () => 'desktop' as LayoutMode)
}

/** Usable desktop area (everything above the taskbar) */
export const desktopArea = () => ({ w: window.innerWidth, h: Math.max(240, window.innerHeight - TASKBAR_H) })
