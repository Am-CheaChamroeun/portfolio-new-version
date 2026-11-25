import type { AppId } from './registry'

/**
 * URL ⇄ app mapping. The URL is a *mirror* of the OS store (activeApp + projectSlug) —
 * there is no second navigation state. '/' is About Me.
 */
export const APP_IDS: AppId[] = ['about', 'projects', 'skills', 'education', 'certificates', 'services', 'monitor', 'terminal', 'contact', 'settings']

/** Phone home screen (the icon grid) — has its own address so Back/Forward work there too */
export const HOME_PATH = '/home'

export type Route =
  | { kind: 'app'; app: AppId; slug: string | null }
  | { kind: 'home' }
  | { kind: 'notFound'; path: string }

export function pathFor(app: AppId, slug: string | null): string {
  if (app === 'projects' && slug) return `/projects/${encodeURIComponent(slug)}`
  return `/${app}`
}

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p)

/** `known` is the list of valid project slugs (so unknown case studies show the 404) */
export function parsePath(rawPath: string, known: readonly string[]): Route {
  const path = trim(rawPath || '/')
  if (path === '/') return { kind: 'app', app: 'about', slug: null }
  if (path === HOME_PATH) return { kind: 'home' }
  const parts = path.split('/').filter(Boolean)
  const [first, second] = parts
  if (parts.length === 1 && (APP_IDS as string[]).includes(first)) return { kind: 'app', app: first as AppId, slug: null }
  if (first === 'projects' && parts.length === 2) {
    const slug = decodeURIComponent(second)
    if (known.includes(slug)) return { kind: 'app', app: 'projects', slug }
  }
  return { kind: 'notFound', path }
}

/** '/' and '/about' are the same screen */
export const samePath = (a: string, b: string) => {
  const n = (p: string) => (trim(p) === '/' ? '/about' : trim(p))
  return n(a) === n(b)
}
