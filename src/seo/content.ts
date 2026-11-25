/**
 * Build-time content for the prerender step (scripts/prerender.mjs) — plain data + HTML strings, no React.
 * Everything comes from the same sources as the app (portfolio.ts + the English locale), and entries that are
 * still [PLACEHOLDERS] are left out, so crawlers only ever see real information.
 */
import en from '../i18n/locales/en.json'
import { profile, services, skillGroups, socials } from '../data/portfolio'
import { visibleProjects, visibleExperience, visibleEducation } from '../data/visible'
import { isPlaceholder } from '../lib/placeholder'

type Dict = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const c = en.content as Dict
const pages = en.meta.pages as Dict
const real = (s: unknown): s is string => typeof s === 'string' && s.trim() !== '' && !isPlaceholder(s)

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export type PageDef = { path: string; title: string; description: string; body: string; noindex?: boolean }

const li = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '')
const nav = `<nav aria-label="Primary"><ul>${[
  ['/', 'About'],
  ['/projects', 'Projects'],
  ['/skills', 'Skills'],
  ['/education', 'Education'],
  ['/experience', 'Experience'],
  ['/services', 'Services'],
  ['/contact', 'Contact'],
]
  .map(([h, l]) => `<li><a href="${h}">${l}</a></li>`)
  .join('')}</ul></nav>`

const shell = (h1: string, inner: string) =>
  `<header><p>${esc(profile.name)} — ${esc(c.profile.role)}</p>${nav}</header><main><h1>${esc(h1)}</h1>${inner}</main><footer><p>${esc(c.profile.footerBlurb)}</p></footer>`

const links = [
  ['GitHub', socials.github.url],
  ['LinkedIn', socials.linkedin.url],
  ['Telegram', socials.telegram.url],
]

export function buildPages(): PageDef[] {
  const out: PageDef[] = []
  const meta = (k: string) => ({ title: `${pages[k].title} — ${profile.name}`, description: pages[k].description as string })

  out.push({
    path: '/',
    title: en.meta.title.replace('{{name}}', profile.name),
    description: en.meta.description.replace('{{name}}', profile.name),
    body: shell(
      `${profile.name} — ${c.profile.role}`,
      `<p>${esc(c.profile.tagline)}</p>` +
        (c.about.paragraphs as string[]).filter(real).map((p) => `<p>${esc(p)}</p>`).join('') +
        `<p>${esc(c.profile.location)}</p>` +
        li(links.map(([l, u]) => `<a href="${esc(u)}" rel="noopener">${l}</a>`)),
    ),
  })

  const projectList = visibleProjects.map((p) => {
    const text = (c.projects as Dict)[p.slug] ?? {}
    return { p, tagline: real(text.tagline) ? text.tagline : '', description: real(text.description) ? text.description : '', highlights: ((text.highlights ?? []) as string[]).filter(real) }
  })
  out.push({
    path: '/projects',
    ...meta('projects'),
    noindex: projectList.length === 0, // an empty section is not worth indexing — this lifts itself once projects are added
    body: shell(
      pages.projects.title,
      projectList.length
        ? li(projectList.map(({ p, tagline }) => `<a href="/projects/${esc(p.slug)}">${esc(p.name)}</a>${tagline ? ` — ${esc(tagline)}` : ''}`))
        : `<p>${esc(en.os.empty.projects.text)}</p>`,
    ),
  })
  for (const { p, tagline, description, highlights } of projectList) {
    const text = [tagline, description].filter(Boolean)
    out.push({
      path: `/projects/${p.slug}`,
      title: `${p.name} — ${pages.projects.title} — ${profile.name}`,
      description: description || tagline || pages.projects.description,
      body: shell(
        p.name,
        text.map((t) => `<p>${esc(t)}</p>`).join('') +
          `<p>Technologies: ${esc(p.tech.join(', '))}</p>` +
          li(highlights.map(esc)) +
          li(
            [p.liveUrl && `<a href="${esc(p.liveUrl)}" rel="noopener">Live site</a>`, p.repoUrl && `<a href="${esc(p.repoUrl)}" rel="noopener">Source code</a>`].filter(
              (x): x is string => !!x && !x.includes('['),
            ),
          ),
      ),
    })
  }

  out.push({
    path: '/skills',
    ...meta('skills'),
    body: shell(
      pages.skills.title,
      skillGroups.map((g) => `<section><h2>${esc((c.skills as Dict)[g.key] ?? g.key)}</h2>${li(g.skills.map((s) => esc(s.name)))}</section>`).join(''),
    ),
  })
  out.push({
    path: '/education',
    ...meta('education'),
    noindex: visibleEducation.length === 0,
    body: shell(pages.education.title, visibleEducation.length ? li(visibleEducation.map((e) => `${esc(e.school)} (${esc(e.period)})`)) : `<p>${esc(en.os.empty.education.text)}</p>`),
  })
  out.push({
    path: '/experience',
    ...meta('experience'),
    noindex: visibleExperience.length === 0,
    body: shell(
      pages.experience.title,
      visibleExperience.length
        ? visibleExperience
            .map((x) => {
              const t = (c.experience as Dict)[x.id] ?? {}
              const when = `${x.start} – ${x.end ?? 'Present'}`
              const projectNames = Object.values((t.projects as Dict) ?? {}).map((x) => (x as Dict).name as string)
              const bullets = [...((t.responsibilities as string[]) ?? []), ...((t.achievements as string[]) ?? []), ...projectNames].filter(real)
              return (
                `<section><h2>${esc(real(t.title) ? t.title : x.company)} — ${esc(x.company)}</h2><p>${esc(when)}</p>` +
                (real(t.description) ? `<p>${esc(t.description)}</p>` : '') +
                li(bullets.map(esc)) +
                `</section>`
              )
            })
            .join('')
        : `<p>${esc(en.os.empty.experience.text)}</p>`,
    ),
  })
  out.push({
    path: '/services',
    ...meta('services'),
    body: shell(
      pages.services.title,
      services
        .map((s) => {
          const t = (c.services as Dict)[s.id]
          return t ? `<section><h2>${esc(t.title)}</h2><p>${esc(t.description)}</p></section>` : ''
        })
        .join(''),
    ),
  })
  out.push({ path: '/monitor', ...meta('monitor'), body: shell(pages.monitor.title, `<p>${esc(pages.monitor.description)}</p>`) })
  out.push({ path: '/terminal', ...meta('terminal'), body: shell(pages.terminal.title, `<p>${esc(pages.terminal.description)}</p>`) })
  out.push({
    path: '/contact',
    ...meta('contact'),
    body: shell(pages.contact.title, `<p>${esc(c.profile.availability)}</p>` + li([`<a href="mailto:${esc(socials.email)}">${esc(socials.email)}</a>`, ...links.map(([l, u]) => `<a href="${esc(u)}" rel="noopener">${l}</a>`)])),
  })
  out.push({ path: '/settings', ...meta('settings'), body: shell(pages.settings.title, `<p>${esc(pages.settings.description)}</p>`) })
  // the phone home screen shares the About content; it is not listed in the sitemap
  out.push({ path: '/home', title: out[0].title, description: out[0].description, body: out[0].body, noindex: true })
  out.push({
    path: '/404',
    title: `${pages.notFound.title} — ${profile.name}`,
    description: pages.notFound.description,
    body: shell(pages.notFound.title, `<p>${esc(pages.notFound.description)}</p><p><a href="/">Back to About</a></p>`),
    noindex: true,
  })
  return out
}

/** Person + ProfilePage structured data — only facts that are already public on the site. */
export function jsonLd(siteUrl: string | null, image: string | null) {
  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': siteUrl ? `${siteUrl}/#person` : undefined,
    name: profile.name,
    jobTitle: c.profile.role,
    description: c.profile.tagline,
    address: { '@type': 'PostalAddress', addressLocality: 'Phnom Penh', addressCountry: 'KH' },
    url: siteUrl ?? undefined,
    image: image ?? undefined,
    sameAs: [socials.github.url, socials.linkedin.url, socials.telegram.url],
    knowsAbout: [...new Set(skillGroups.flatMap((g) => g.skills.map((s) => s.name)))],
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [{ '@type': 'ProfilePage', ...(siteUrl && { url: siteUrl }), name: en.meta.title.replace('{{name}}', profile.name), mainEntity: person }],
  }
}

export const siteName = profile.name
