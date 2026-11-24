import { createContext } from 'react'
import type { AppId } from './registry'
import { readLayoutMode } from './layout'

export type OSState = {
  /** the one app shown in the main workspace — About Me until the visitor picks another */
  activeApp: AppId
  launcher: boolean
  /** the command palette (Cmd/Ctrl + K) */
  palette: boolean
  /** the project whose case study is open in the Projects app (null = the project list) */
  projectSlug: string | null
  /** apps the visitor opened, most recent first */
  recent: AppId[]
  /** the app showing full-screen on the phone layout (null = the home screen) */
  mobileApp: AppId | null
}

export const DEFAULT_APP: AppId = 'about'
export const RECENT_KEY = 'devos-recent'
const MAX_RECENT = 5

function readRecent(): AppId[] {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter((x): x is AppId => typeof x === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

/** About Me is the first thing visitors see on every layout, phones included. */
export const createInitialState = (): OSState => ({
  activeApp: DEFAULT_APP,
  launcher: false,
  palette: false,
  projectSlug: null,
  recent: readRecent(),
  mobileApp: readLayoutMode() === 'mobile' ? DEFAULT_APP : null,
})

export type Action =
  | { type: 'open'; id: AppId; mobile: boolean }
  | { type: 'openProject'; slug: string | null; mobile: boolean }
  | { type: 'launcher'; open: boolean }
  | { type: 'palette'; open: boolean }
  | { type: 'mobileHome' }

const remember = (recent: AppId[], id: AppId) => [id, ...recent.filter((r) => r !== id)].slice(0, MAX_RECENT)

export function reducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        activeApp: action.id,
        launcher: false,
        palette: false,
        recent: action.id === state.activeApp && state.recent[0] === action.id ? state.recent : remember(state.recent, action.id),
        mobileApp: action.mobile ? action.id : state.mobileApp,
      }
    case 'openProject':
      return {
        ...state,
        activeApp: 'projects',
        projectSlug: action.slug,
        launcher: false,
        palette: false,
        recent: remember(state.recent, 'projects'),
        mobileApp: action.mobile ? 'projects' : state.mobileApp,
      }
    case 'launcher':
      return {
        ...state,
        launcher: action.open,
        palette: action.open ? false : state.palette,
      }
    case 'palette':
      return {
        ...state,
        palette: action.open,
        launcher: action.open ? false : state.launcher,
      }
    case 'mobileHome':
      return { ...state, mobileApp: null }
  }
}

export type OSActions = {
  /** Show an app in the workspace (a single click anywhere) — full-screen on phones */
  openApp: (id: AppId) => void
  /** Show a project's case study inside the Projects app (null = back to the list) */
  openProject: (slug: string | null) => void
  setLauncher: (open: boolean) => void
  setPalette: (open: boolean) => void
  closeMobile: () => void
}

export const StateContext = createContext<OSState>(createInitialState())
export const ActionsContext = createContext<OSActions | null>(null)
