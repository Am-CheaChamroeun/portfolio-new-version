import { useSyncExternalStore } from 'react'

/**
 * Visitor preferences (Settings app). One small external store:
 *  - read once from localStorage, validated field by field (corrupted or missing values fall back to defaults),
 *  - mirrored onto <html data-*> attributes so CSS can react with no React re-render,
 *  - the same attributes are applied by an inline script in index.html before first paint (no flash).
 * The language is NOT stored here — it stays in the existing i18n state.
 */
export const SETTINGS_KEY = 'devos-settings'

export const WALLPAPERS = ['grid', 'wave', 'geometric', 'topo'] as const
export const ACCENTS = ['yellow', 'blue', 'emerald', 'purple', 'orange', 'white'] as const
export const MOTIONS = ['system', 'full', 'reduced'] as const

export type Wallpaper = (typeof WALLPAPERS)[number]
export type Accent = (typeof ACCENTS)[number]
export type MotionPref = (typeof MOTIONS)[number]
export type Settings = { wallpaper: Wallpaper; accent: Accent; motion: MotionPref; sound: boolean }

export const DEFAULTS: Settings = { wallpaper: 'grid', accent: 'yellow', motion: 'system', sound: false }

/** Swatch colours for the accent picker (kept in step with the tokens in index.css). */
export const ACCENT_COLORS: Record<Accent, string> = {
  yellow: '#efff00',
  blue: '#2d9cff',
  emerald: '#2ee59d',
  purple: '#b36bff',
  orange: '#ff8a2b',
  white: '#ffffff',
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback)

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null') as Record<string, unknown> | null
    if (!raw || typeof raw !== 'object') return { ...DEFAULTS }
    return {
      wallpaper: pick(WALLPAPERS, raw.wallpaper, DEFAULTS.wallpaper),
      accent: pick(ACCENTS, raw.accent, DEFAULTS.accent),
      motion: pick(MOTIONS, raw.motion, DEFAULTS.motion),
      sound: raw.sound === true,
    }
  } catch {
    return { ...DEFAULTS } // unavailable storage or invalid JSON
  }
}

const osReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
let state = load()
const listeners = new Set<() => void>()

/** The motion setting resolved against the operating system's preference. */
export const isReducedMotion = (s: Settings = state) => (s.motion === 'system' ? osReduced.matches : s.motion === 'reduced')

function applyToDocument(s: Settings) {
  const el = document.documentElement
  el.dataset.accent = s.accent
  el.dataset.wallpaper = s.wallpaper
  el.dataset.motion = isReducedMotion(s) ? 'reduced' : 'full'
}

function emit() {
  state = { ...state }
  applyToDocument(state)
  listeners.forEach((l) => l())
}

export function updateSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable — the choice applies for this visit only */
  }
  emit()
}

/** Back to the defaults (the caller also resets the language, which lives in i18n). */
export function resetSettings() {
  state = { ...DEFAULTS }
  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch {
    /* ignore */
  }
  emit()
}

osReduced.addEventListener('change', () => {
  if (state.motion === 'system') emit()
})
applyToDocument(state)

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const getSettings = () => state
export const useSettings = () => useSyncExternalStore(subscribe, getSettings, () => DEFAULTS)
