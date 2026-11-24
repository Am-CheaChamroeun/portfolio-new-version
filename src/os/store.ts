import { createContext } from 'react'
import type { AppId } from './registry'
import { readLayoutMode } from './layout'

export type OSState = {
  /** the one app shown in the main workspace — About Me until the visitor picks another */
  activeApp: AppId
  launcher: boolean
  /** the app showing full-screen on the phone layout (null = the home screen) */
  mobileApp: AppId | null
}

export const DEFAULT_APP: AppId = 'about'

/** About Me is the first thing visitors see on every layout, phones included. */
export const createInitialState = (): OSState => ({
  activeApp: DEFAULT_APP,
  launcher: false,
  mobileApp: readLayoutMode() === 'mobile' ? DEFAULT_APP : null,
})

export type Action = { type: 'open'; id: AppId; mobile: boolean } | { type: 'launcher'; open: boolean } | { type: 'mobileHome' }

export function reducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case 'open':
      return { ...state, activeApp: action.id, launcher: false, mobileApp: action.mobile ? action.id : state.mobileApp }
    case 'launcher':
      return { ...state, launcher: action.open }
    case 'mobileHome':
      return { ...state, mobileApp: null }
  }
}

export type OSActions = {
  /** Show an app in the workspace (a single click anywhere) — full-screen on phones */
  openApp: (id: AppId) => void
  setLauncher: (open: boolean) => void
  closeMobile: () => void
}

export const StateContext = createContext<OSState>(createInitialState())
export const ActionsContext = createContext<OSActions | null>(null)
