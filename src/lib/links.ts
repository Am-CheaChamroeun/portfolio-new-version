import { profile } from '../data/portfolio'

/** A link or value is "real" once the [PLACEHOLDER] in portfolio.ts has been replaced. */
export const isReal = (value: string | undefined): value is string => !!value && !value.includes('[')

let cvCheck: Promise<boolean> | null = null

/** Is a CV file actually deployed? (Hosts often answer 200 + the app's HTML for a missing file, so check the type.) */
export function cvAvailable() {
  cvCheck ??= fetch(profile.cvUrl, { method: 'HEAD' })
    .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
    .catch(() => false)
  return cvCheck
}

/** Start the CV download. Resolves false when there is no CV file yet. */
export async function downloadCv() {
  if (!(await cvAvailable())) return false
  const a = document.createElement('a')
  a.href = profile.cvUrl
  a.download = profile.cvFilename
  document.body.appendChild(a)
  a.click()
  a.remove()
  return true
}

/** Open the CV in the browser's own PDF viewer (new tab). Call straight from a click so pop-up blockers allow it. */
export const viewCv = () => window.open(profile.cvUrl, '_blank', 'noopener,noreferrer')

/** Open an external link in a new tab, safely. */
export const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
