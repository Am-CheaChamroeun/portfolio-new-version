import { formatMonthYear } from '../i18n'

/** 'YYYY-MM' → a Date (1st of the month), or null while the value is still a [PLACEHOLDER] */
export function parseMonth(value?: string): Date | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value ?? '')
  if (!m) return null
  const month = Number(m[2])
  return month >= 1 && month <= 12 ? new Date(Number(m[1]), month - 1, 1) : null
}

/** Months worked, counting both the first and the last month ("Jan 2023 – Mar 2023" = 3 months). */
export function monthsBetween(start?: string, end?: string, now: Date = new Date()): number | null {
  const a = parseMonth(start)
  const b = end ? parseMonth(end) : new Date(now.getFullYear(), now.getMonth(), 1)
  if (!a || !b) return null
  const n = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1
  return n > 0 ? n : null
}

/** "2 yr 3 mo" — units come from Intl, so Khmer and Chinese read naturally without extra translations. */
export function formatDuration(months: number, lng: string): string {
  const years = Math.floor(months / 12)
  const rest = months % 12
  const locale = lng === 'zh-CN' ? 'zh-CN' : lng === 'km' ? 'km-KH' : 'en'
  const unit = (n: number, u: 'year' | 'month') => {
    // browsers without Khmer unit data: use plain Khmer words instead of falling back to English
    if (lng === 'km' && Intl.NumberFormat.supportedLocalesOf([locale]).length === 0) return `${n} ${u === 'year' ? 'ឆ្នាំ' : 'ខែ'}`
    try {
      return new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'short' }).format(n)
    } catch {
      return `${n} ${u === 'year' ? 'yr' : 'mo'}`
    }
  }
  const parts: string[] = []
  if (years) parts.push(unit(years, 'year'))
  if (rest || !years) parts.push(unit(rest, 'month'))
  return parts.join(' ')
}

/** "Jan 2023" — or the raw text while a date is still a placeholder */
export const formatMonth = (value: string | undefined, lng: string): string => {
  const d = parseMonth(value)
  return d ? formatMonthYear(d, lng) : (value ?? '')
}
