/**
 * Public link helpers for project actions.
 *
 * A Live Demo link is only shown when it is a real public https address. Empty values, placeholders (TODO…, [..]),
 * plain http, localhost / private addresses and Vercel's management dashboard (vercel.com) are all rejected,
 * so the button simply does not appear until a proper deployment URL is configured.
 */

/** Empty values and obvious placeholders (TODO…, REPLACE…, [..], whitespace) are never links. */
const isPlaceholder = (v?: string | null) => {
  const x = (v ?? '').trim()
  return x === '' || /^(todo|replace|your_|changeme)/i.test(x) || /[[\]{}<>\s]/.test(x)
}

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0|\[::1\])/i

/** The cleaned https URL, or `undefined` when it is empty, a placeholder, not https, local, or the Vercel dashboard. */
export function publicLiveUrl(raw?: string | null): string | undefined {
  if (isPlaceholder(raw)) return undefined
  let u: URL
  try {
    u = new URL(String(raw).trim())
  } catch {
    return undefined
  }
  const host = u.hostname.toLowerCase()
  if (u.protocol !== 'https:' || !host.includes('.') || PRIVATE_HOST.test(host)) return undefined
  if (host === 'vercel.com' || host.endsWith('.vercel.com')) return undefined // dashboard, not a deployment
  return u.href
}

/** A GitHub (or other https) repository link, or `undefined`. */
export function repoLink(raw?: string | null): string | undefined {
  if (isPlaceholder(raw)) return undefined
  try {
    const u = new URL(String(raw).trim())
    return u.protocol === 'https:' ? u.href : undefined
  } catch {
    return undefined
  }
}
