import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { desktopArea, useLayoutMode } from './layout'
import { appById, type AppId } from './registry'
import { ActionsContext, StateContext, initialState, reducer, type OSActions, type Rect } from './store'

/** Where a new window appears: cascaded, and clear of the desktop icon column(s). */
function initialRect(id: AppId, openCount: number): Rect {
  const def = appById[id]
  const area = desktopArea()
  const w = Math.min(def.w, area.w - 32)
  const h = Math.min(def.h, area.h - 24)
  const iconsWidth = area.h < 790 ? 236 : 136
  const step = (openCount % 8) * 28
  const x = Math.max(12, Math.min(iconsWidth + step, area.w - w - 12))
  const y = Math.max(8, Math.min(32 + step, area.h - h - 8))
  return { x, y, w, h }
}

/**
 * Centralised window state. Two contexts keep re-renders small: components that
 * only trigger actions (icons, menus) subscribe to the stable actions object.
 */
export function OSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const mode = useLayoutMode()
  const stateRef = useRef(state)
  const modeRef = useRef(mode)
  useEffect(() => {
    stateRef.current = state
    modeRef.current = mode
  })

  const actions = useMemo<OSActions>(
    () => ({
      openApp: (id) => {
        if (modeRef.current === 'mobile') {
          dispatch({ type: 'mobileOpen', id })
          return
        }
        const open = stateRef.current.windows
        dispatch({ type: 'open', id, rect: initialRect(id, open.length), maximized: modeRef.current !== 'desktop' })
      },
      close: (id) => dispatch({ type: 'close', id }),
      minimize: (id) => dispatch({ type: 'minimize', id }),
      focus: (id) => dispatch({ type: 'focus', id }),
      toggleMaximize: (id) => dispatch({ type: 'toggleMaximize', id }),
      setRect: (id, rect) => dispatch({ type: 'setRect', id, rect }),
      taskbarToggle: (id) => {
        const s = stateRef.current
        const win = s.windows.find((w) => w.id === id)
        if (!win) return
        if (win.minimized || s.focusedId !== id) dispatch({ type: 'focus', id })
        else dispatch({ type: 'minimize', id })
      },
      showDesktop: () => dispatch({ type: 'showDesktop' }),
      closeAll: () => dispatch({ type: 'closeAll' }),
      setLauncher: (open) => dispatch({ type: 'launcher', open }),
      closeMobile: () => dispatch({ type: 'mobileOpen', id: null }),
    }),
    [],
  )

  // keep windows on screen when the viewport changes (rotation, resize)
  const frame = useRef(0)
  const fit = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => dispatch({ type: 'fit', area: desktopArea() }))
  }, [])
  useEffect(() => {
    window.addEventListener('resize', fit)
    return () => {
      window.removeEventListener('resize', fit)
      cancelAnimationFrame(frame.current)
    }
  }, [fit])

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  )
}
