import i18n from '../i18n'
import { profile } from '../data/portfolio'
import type { Route } from '../os/routes'
import { pathFor } from '../os/routes'

type PageKey = 'about' | 'projects' | 'skills' | 'education' | 'certificates' | 'services' | 'monitor' | 'terminal' | 'contact' | 'settings' | 'notFound'

const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/**
 * Keeps the tab title, description, canonical URL and social tags in step with the page being shown.
 * (Search engines and link previews read the prerendered copies in dist/ — this covers in-app navigation.)
 */
export function applyRouteMeta(route: Route, projectName?: string) {
  const page: PageKey = route.kind === 'notFound' ? 'notFound' : route.kind === 'home' ? 'about' : route.app
  const t = i18n.t.bind(i18n) as unknown as (k: string, o?: object) => string
  const name = profile.name
  let title = page === 'about' ? t('meta.title', { name }) : `${t(`meta.pages.${page}.title`)} — ${name}`
  let description = page === 'about' ? t('meta.description', { name }) : t(`meta.pages.${page}.description`)
  if (route.kind === 'app' && route.app === 'projects' && route.slug && projectName) {
    title = `${projectName} — ${t('meta.pages.projects.title')} — ${name}`
    description = t(`content.projects.${route.slug}.description`)
  }
  document.title = title
  setMeta('meta[name="description"]', 'name', 'description', description)
  setMeta('meta[property="og:title"]', 'property', 'og:title', title)
  setMeta('meta[property="og:description"]', 'property', 'og:description', description)
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

  // The 404 must not be indexed; every other page points at its own canonical address.
  setMeta('meta[name="robots"]', 'name', 'robots', page === 'notFound' ? 'noindex' : 'index, follow') // (prerendered pages carry the authoritative value)
  const path = route.kind === 'app' ? (route.app === 'about' ? '/' : pathFor(route.app, route.slug)) : '/'
  const url = location.origin + path
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (page === 'notFound') link?.remove()
  else {
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
  }
}
