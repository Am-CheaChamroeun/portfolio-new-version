import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { profile } from '../data/portfolio'
import en from './locales/en.json'
import km from './locales/km.json'
import zhCN from './locales/zh-CN.json'

/** Supported languages. `short` is what the switcher shows; `name` is the language's own name. */
export const languages = [
  { code: 'en', short: 'EN', name: 'English', dateLocale: 'en-GB' },
  { code: 'km', short: 'ខ្មែរ', name: 'ភាសាខ្មែរ', dateLocale: 'km-KH' },
  { code: 'zh-CN', short: '中文', name: '简体中文', dateLocale: 'zh-CN' },
] as const

export type LanguageCode = (typeof languages)[number]['code']

/** Must match the key read by the inline script in index.html */
export const LANGUAGE_STORAGE_KEY = 'notebook-lang'

const isSupported = (code: string | null): code is LanguageCode => languages.some((l) => l.code === code)

function readSaved(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    // English on first visit; we never guess from the browser language.
    return isSupported(saved) ? saved : 'en'
  } catch {
    return 'en'
  }
}

/** Keeps <html lang>, the tab title and the meta description in step with the language. */
function syncDocument(lng: string) {
  document.documentElement.lang = lng
  document.title = i18n.t('meta.title', { name: profile.name })
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description', { name: profile.name }))
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    km: { translation: km },
    'zh-CN': { translation: zhCN },
  },
  lng: readSaved(),
  fallbackLng: 'en',
  supportedLngs: languages.map((l) => l.code),
  load: 'currentOnly',
  // resources are bundled, so initialise synchronously: the first render is
  // already in the saved language (no flash of English)
  initAsync: false,
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
})

syncDocument(i18n.language)

i18n.on('languageChanged', (lng) => {
  syncDocument(lng)
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
})

const KHMER_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']

/**
 * Formats a date for the given language — "22 Nov 2026", "22 វិច្ឆិកា 2026", "2026年11月22日".
 * `iso` gives YYYY-MM-DD in every language. Falls back to built-in Khmer month
 * names on browsers whose Intl data has no Khmer.
 */
export function formatDate(date: Date, lng: string, variant: 'short' | 'long' | 'iso' = 'long') {
  if (variant === 'iso') {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
  }
  const locale = languages.find((l) => l.code === lng)?.dateLocale ?? 'en-GB'
  if (lng === 'km' && Intl.DateTimeFormat.supportedLocalesOf([locale]).length === 0) {
    return `${date.getDate()} ${KHMER_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  }
  return date.toLocaleDateString(locale, {
    day: variant === 'short' ? '2-digit' : 'numeric',
    month: variant === 'short' ? 'short' : 'long',
    year: 'numeric',
  })
}

/** "Jan 2023", "មករា 2023", "2023年1月" */
export function formatMonthYear(date: Date, lng: string) {
  const locale = languages.find((l) => l.code === lng)?.dateLocale ?? 'en-GB'
  if (lng === 'km' && Intl.DateTimeFormat.supportedLocalesOf([locale]).length === 0) {
    return `${KHMER_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  }
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' })
}

export default i18n
