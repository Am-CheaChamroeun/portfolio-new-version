import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { useLayoutMode } from './layout'
import { ActionsContext, StateContext, createInitialState, reducer, type OSActions } from './store'

/**
 * Central OS state: which app is active, the launcher, and the phone's open app.
 * Two contexts keep re-renders small: components that only trigger actions
 * (icons, menus) subscribe to the stable actions object.
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
      openApp: (id) => dispatch({ type: 'open', id, mobile: modeRef.current === 'mobile' }),
      setLauncher: (open) => dispatch({ type: 'launcher', open }),
      closeMobile: () => dispatch({ type: 'mobileHome' }),
    }),
    [],
  )

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  )
}
