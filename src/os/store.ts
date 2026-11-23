import { createContext } from 'react'
import type { AppId } from './registry'

export type Rect = { x: number; y: number; w: number; h: number }

export type WinState = Rect & {
  id: AppId
  z: number
  minimized: boolean
  maximized: boolean
}

export type OSState = {
  /** in the order the apps were opened — the taskbar follows this order */
  windows: WinState[]
  focusedId: AppId | null
  zTop: number
  launcher: boolean
  /** the app showing full-screen on the mobile home screen */
  mobileApp: AppId | null
}

export const initialState: OSState = { windows: [], focusedId: null, zTop: 10, launcher: false, mobileApp: null }

export type Action =
  | { type: 'open'; id: AppId; rect: Rect; maximized: boolean }
  | { type: 'close'; id: AppId }
  | { type: 'minimize'; id: AppId }
  | { type: 'focus'; id: AppId }
  | { type: 'toggleMaximize'; id: AppId }
  | { type: 'setRect'; id: AppId; rect: Partial<Rect> }
  | { type: 'fit'; area: { w: number; h: number } }
  | { type: 'showDesktop' }
  | { type: 'closeAll' }
  | { type: 'launcher'; open: boolean }
  | { type: 'mobileOpen'; id: AppId | null }

/** The visible window with the highest z-index, if any */
const topVisible = (windows: WinState[]) =>
  windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null

const patch = (windows: WinState[], id: AppId, change: Partial<WinState>) => windows.map((w) => (w.id === id ? { ...w, ...change } : w))

export function reducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case 'open': {
      const exists = state.windows.some((w) => w.id === action.id)
      const z = state.zTop + 1
      const windows = exists
        ? patch(state.windows, action.id, { minimized: false, z })
        : [...state.windows, { id: action.id, ...action.rect, z, minimized: false, maximized: action.maximized }]
      return { ...state, windows, focusedId: action.id, zTop: z, launcher: false }
    }
    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id)
      return { ...state, windows, focusedId: state.focusedId === action.id ? topVisible(windows) : state.focusedId }
    }
    case 'minimize': {
      const windows = patch(state.windows, action.id, { minimized: true })
      return { ...state, windows, focusedId: state.focusedId === action.id ? topVisible(windows) : state.focusedId }
    }
    case 'focus': {
      if (state.focusedId === action.id && !state.windows.find((w) => w.id === action.id)?.minimized) return state
      const z = state.zTop + 1
      return { ...state, windows: patch(state.windows, action.id, { minimized: false, z }), focusedId: action.id, zTop: z }
    }
    case 'toggleMaximize':
      return { ...state, windows: state.windows.map((w) => (w.id === action.id ? { ...w, maximized: !w.maximized } : w)) }
    case 'setRect':
      return { ...state, windows: patch(state.windows, action.id, action.rect) }
    case 'fit': {
      const { w: aw, h: ah } = action.area
      const windows = state.windows.map((win) => {
        const w = Math.min(win.w, aw)
        const h = Math.min(win.h, ah)
        const x = Math.min(Math.max(win.x, -(w - 140)), aw - 140)
        const y = Math.min(Math.max(win.y, 0), Math.max(0, ah - 44))
        return w === win.w && h === win.h && x === win.x && y === win.y ? win : { ...win, w, h, x, y }
      })
      return { ...state, windows }
    }
    case 'showDesktop':
      return { ...state, windows: state.windows.map((w) => ({ ...w, minimized: true })), focusedId: null, launcher: false }
    case 'closeAll':
      return { ...state, windows: [], focusedId: null }
    case 'launcher':
      return { ...state, launcher: action.open }
    case 'mobileOpen':
      return { ...state, mobileApp: action.id }
  }
}

export type OSActions = {
  /** Open (or restore + focus) an app — a window on desktop/tablet, a full-screen view on mobile */
  openApp: (id: AppId) => void
  close: (id: AppId) => void
  minimize: (id: AppId) => void
  focus: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  setRect: (id: AppId, rect: Partial<Rect>) => void
  /** Taskbar behaviour: restore if minimized, minimize if it is the active one, otherwise focus */
  taskbarToggle: (id: AppId) => void
  showDesktop: () => void
  closeAll: () => void
  setLauncher: (open: boolean) => void
  closeMobile: () => void
}

export const StateContext = createContext<OSState>(initialState)
export const ActionsContext = createContext<OSActions | null>(null)
