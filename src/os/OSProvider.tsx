import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { playSound } from '../lib/sound'
import { useLayoutMode } from './layout'
import { applyRouteMeta } from '../lib/seo'
import i18n from '../i18n'
import { visibleProjects } from '../data/visible'
import { HOME_PATH, parsePath, pathFor, samePath, type Route } from './routes'
import { ActionsContext, RECENT_KEY, StateContext, createInitialState, projectSlugs, reducer, type OSActions } from './store'

/**
 * Central OS state: the active app, the launcher, the command palette, the open case study
 * and the phone's open app. Two contexts keep re-renders small: components that only trigger
 * actions (icons, menus) subscribe to the stable actions object.
 */
export function OSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const mode = useLayoutMode()
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  })

  const actions = useMemo<OSActions>(
    () => ({
      openApp: (id) => {
        if (stateRef.current.activeApp !== id || modeRef.current === 'mobile') playSound('switch')
        dispatch({ type: 'open', id, mobile: modeRef.current === 'mobile' })
      },
      openProject: (slug) =>
        dispatch({
          type: 'openProject',
          slug,
          mobile: modeRef.current === 'mobile',
        }),
      setLauncher: (open) => dispatch({ type: 'launcher', open }),
      setPalette: (open) => {
        if (open) playSound('open')
        dispatch({ type: 'palette', open })
      },
      closeMobile: () => dispatch({ type: 'mobileHome' }),
    }),
    [],
  )

  // Cmd + K (macOS) / Ctrl + K (Windows, Linux) toggles the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (!stateRef.current.palette) playSound('open')
        dispatch({ type: 'palette', open: !stateRef.current.palette })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  // ── URL ⇄ state: the address bar mirrors the store (one source of truth) ──
  const routeOf = (s: typeof state): Route =>
    s.notFound ? { kind: 'notFound', path: s.notFound } : modeRef.current === 'mobile' && s.mobileApp === null ? { kind: 'home' } : { kind: 'app', app: s.activeApp, slug: s.projectSlug }
  const pathOf = (r: Route) => (r.kind === 'home' ? HOME_PATH : r.kind === 'notFound' ? r.path : pathFor(r.app, r.slug))

  useEffect(() => {
    const route = routeOf(state)
    const path = pathOf(route)
    if (!samePath(location.pathname, path)) history.pushState({ os: 1 }, '', path + location.search)
    const name = route.kind === 'app' && route.slug ? visibleProjects.find((p) => p.slug === route.slug)?.name : undefined
    applyRouteMeta(route, name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeApp, state.projectSlug, state.notFound, state.mobileApp, mode])

  // keep the title / description in the visitor's language
  useEffect(() => {
    const on = () => {
      const s = stateRef.current
      const r = routeOf(s)
      applyRouteMeta(r, r.kind === 'app' && r.slug ? visibleProjects.find((p) => p.slug === r.slug)?.name : undefined)
    }
    i18n.on('languageChanged', on)
    return () => i18n.off('languageChanged', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Back / Forward and edited addresses
  useEffect(() => {
    const onPop = () => dispatch({ type: 'navigate', route: parsePath(location.pathname, projectSlugs) })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // remember which apps were opened, across visits
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(state.recent))
    } catch {
      /* storage unavailable — recents just won't persist */
    }
  }, [state.recent])

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  )
}
