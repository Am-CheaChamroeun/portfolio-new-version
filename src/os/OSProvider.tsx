import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { playSound } from '../lib/sound'
import { useLayoutMode } from './layout'
import { ActionsContext, RECENT_KEY, StateContext, createInitialState, reducer, type OSActions } from './store'

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
