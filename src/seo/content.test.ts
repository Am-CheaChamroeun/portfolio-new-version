/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildPages, jsonLd } from './content'

const site = 'https://amcheachamroeun.vercel.app'
const pages = buildPages(site, `${site}/og-image.png`)
const indexable = pages.filter((p) => !p.noindex)

describe('SEO pages', () => {
  it('gives every indexable page a unique title and a real description', () => {
    expect(new Set(indexable.map((p) => p.title)).size).toBe(indexable.length)
    for (const p of indexable) {
      expect(p.title.length).toBeGreaterThan(8)
      expect(p.title.length).toBeLessThanOrEqual(75)
      expect(p.description.length).toBeGreaterThan(40)
      expect(p.description).not.toMatch(/\[|TODO|lorem/i)
    }
  })
  it('keeps the home page title and keeps tool pages out of search', () => {
    expect(pages.find((p) => p.path === '/')?.title).toBe('Am Cheachamroeun | Full-Stack Developer Portfolio')
    for (const path of ['/settings', '/terminal', '/home', '/404']) expect(pages.find((p) => p.path === path)?.noindex).toBe(true)
  })
  it('builds valid structured data on the home page and on every case study', () => {
    const home = jsonLd(site, null)
    expect(home['@graph'].map((n) => n['@type'])).toEqual(['WebSite', 'ProfilePage', 'Person'])
    const studies = pages.filter((p) => p.path.startsWith('/projects/'))
    expect(studies.length).toBeGreaterThan(0)
    for (const p of studies) {
      const g = JSON.parse(JSON.stringify(p.ld))['@graph']
      expect(g.map((n: { '@type': string }) => n['@type'])).toEqual(['BreadcrumbList', 'SoftwareSourceCode'])
      expect(g[0].itemListElement.at(-1).item).toBe(site + p.path)
    }
  })
})

describe('security headers (vercel.json)', () => {
  const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'))
  const headers: { key: string; value: string }[] = cfg.headers.find((h: { source: string }) => h.source === '/(.*)').headers
  const get = (k: string) => headers.find((h) => h.key === k)?.value ?? ''
  const csp = get('Content-Security-Policy')

  it('sets each security header once', () => {
    const keys = headers.map((h) => h.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const k of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options']) expect(keys).toContain(k)
  })
  it('has no wildcard sources and blocks plugins and framing', () => {
    expect(csp).not.toMatch(/\*|unsafe-eval/)
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'self'")
  })
  it('allows exactly the inline theme script that index.html contains (hash must be updated if that script changes)', () => {
    const html = readFileSync('index.html', 'utf8')
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
    expect(inline).toHaveLength(1)
    const hash = `'sha256-${createHash('sha256').update(inline[0]).digest('base64')}'`
    expect(csp).toContain(hash)
  })
  it('allows the hosts the app really talks to', () => {
    for (const host of ['https://res.cloudinary.com', 'https://api.web3forms.com', 'https://api.github.com']) expect(csp).toContain(host)
  })
})
