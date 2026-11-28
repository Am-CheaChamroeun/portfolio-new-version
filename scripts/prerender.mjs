/**
 * Build-time prerender (runs after `vite build`, wired into `npm run build`).
 *
 * The app is a single-page React app, so crawlers and link-preview bots would otherwise only see an empty <div>.
 * This script writes one static HTML file per route into dist/ with that page's own title, description,
 * canonical URL, Open Graph / Twitter tags, JSON-LD and readable content. React replaces that content as soon as it loads.
 * It also writes sitemap.xml, robots.txt and 404.html (served with a real 404 status by Vercel).
 *
 * The production domain is the single `siteUrl` in src/data/portfolio.ts; VITE_SITE_URL overrides it (for a custom domain).
 * If VITE_GOOGLE_SITE_VERIFICATION is set, the Google Search Console meta tag is written into every page's static HTML.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.NODE_ENV = 'production' // placeholders stay hidden, exactly like the real build
const { createServer } = await import('vite')

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const exists = (p) => access(p).then(() => true, () => false)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const verification = (process.env.VITE_GOOGLE_SITE_VERIFICATION ?? '').trim()
if (verification && !/^[A-Za-z0-9_-]{20,100}$/.test(verification)) throw new Error('VITE_GOOGLE_SITE_VERIFICATION does not look like a Google verification token (expected only letters, digits, "-" and "_").')

const vite = await createServer({ root, appType: 'custom', server: { middlewareMode: true }, logLevel: 'error', configFile: false, plugins: [] })
let mod
try {
  mod = await vite.ssrLoadModule('/src/seo/content.ts')
} finally {
  await vite.close()
}

const template = await readFile(join(dist, 'index.html'), 'utf8')
const hasOg = await exists(join(dist, 'og-image.png'))
const siteUrl = (process.env.VITE_SITE_URL || mod.siteUrl).replace(/\/+$/, '')
if (!/^https:\/\/[^/\s]+$/.test(siteUrl)) throw new Error(`Site URL must be an https origin with no path, got "${siteUrl}"`)
const image = hasOg ? `${siteUrl}/og-image.png` : null

const pages = mod.buildPages(siteUrl, image)
const about = pages.find((p) => p.path === '/')
pages.push({ ...about, path: '/about', canonical: '/' }) // same page, canonical points at "/"

const headFor = (page) => {
  const canonical = page.noindex ? null : siteUrl + (page.canonical ?? page.path)
  const t = []
  t.push(`<title>${esc(page.title)}</title>`)
  t.push(`<meta name="description" content="${esc(page.description)}" />`)
  t.push(`<meta name="robots" content="${page.noindex ? 'noindex' : 'index, follow'}" />`)
  if (canonical) t.push(`<link rel="canonical" href="${esc(canonical)}" />`)
  t.push(`<meta property="og:type" content="${page.path === '/' ? 'profile' : 'website'}" />`)
  t.push(`<meta property="og:site_name" content="${esc(mod.siteName)}" />`)
  t.push(`<meta property="og:title" content="${esc(page.title)}" />`)
  t.push(`<meta property="og:description" content="${esc(page.description)}" />`)
  t.push(`<meta property="og:locale" content="en_US" /><meta property="og:locale:alternate" content="km_KH" /><meta property="og:locale:alternate" content="zh_CN" />`)
  if (canonical) t.push(`<meta property="og:url" content="${esc(canonical)}" />`)
  if (image) {
    t.push(`<meta property="og:image" content="${esc(image)}" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />`)
    t.push(`<meta property="og:image:type" content="image/png" /><meta property="og:image:alt" content="${esc(page.title)}" />`)
  }
  t.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`)
  t.push(`<meta name="twitter:title" content="${esc(page.title)}" />`)
  t.push(`<meta name="twitter:description" content="${esc(page.description)}" />`)
  if (image) t.push(`<meta name="twitter:image" content="${esc(image)}" /><meta name="twitter:image:alt" content="${esc(page.title)}" />`)
  if (verification) t.push(`<meta name="google-site-verification" content="${esc(verification)}" />`)
  if (page.ld) t.push(`<script type="application/ld+json">${JSON.stringify(page.ld).replace(/</g, '\\u003c')}</script>`)
  return t.join('\n    ')
}

const start = '<!--seo:start-->'
const end = '<!--seo:end-->'
if (!template.includes(start) || !template.includes(end)) throw new Error('index.html is missing the <!--seo:start--> / <!--seo:end--> markers')

for (const page of pages) {
  let html = template.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n    ${headFor(page)}\n    ${end}`)
  html = html.replace('<div id="root"></div>', `<div id="root"><div id="prerender">${page.body}</div></div>`)
  const file = page.path === '/' ? join(dist, 'index.html') : page.path === '/404' ? join(dist, '404.html') : join(dist, page.path, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
}

// only real, indexable pages (no lastmod: the build date would claim a freshness the content does not have)
const urls = pages.filter((p) => !p.noindex && p.path !== '/about').map((p) => `  <url><loc>${siteUrl}${p.path === '/' ? '/' : p.path}</loc></url>`)
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /home\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

console.log(`[prerender] ${pages.length} pages written for ${siteUrl}${verification ? ' (with Google verification tag)' : ''}${hasOg ? '' : ' — no og-image.png found'}`)
