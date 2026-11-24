import { useCallback, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

/** Kept from the notebook version so a visitor's saved choice survives the redesign. */
const THEME_STORAGE_KEY = 'notebook-theme-v2'

const root = document.documentElement
const read = (): Theme => (root.classList.contains('dark') ? 'dark' : 'light')

function apply(theme: Theme) {
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* storage unavailable */
  }
}

/** The <html class="dark"> flag is the single source of truth, so every consumer stays in sync. */
function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify)
  observer.observe(root, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

/** Graphite (dark) by default, daylight (light) on request. Switching uses a circular view transition when supported. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'dark' as Theme)

  const toggle = useCallback((event?: { clientX: number; clientY: number }) => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce || !event) {
      apply(next)
      return
    }
    const { clientX: x, clientY: y } = event
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transition = document.startViewTransition(() => apply(next))
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`],
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }, [])

  return { theme, toggle }
}
