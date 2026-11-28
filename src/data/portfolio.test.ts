import { describe, expect, it } from 'vitest'
import { projects, featuredProject, profile } from './portfolio'
import { getProjectMedia } from './projectMedia'
import { publicLiveUrl } from '../lib/url'

describe('CV configuration', () => {
  it('uses the public/documents URL and the download file name', () => {
    expect(profile.cvUrl).toBe('/documents/am-cheachamroeun-cv.pdf')
    expect(profile.cvFilename).toBe('Am-Cheachamroeun-CV.pdf')
  })
  it('is not duplicated inside src/assets (the e2e suite checks the served file)', () => {
    expect(Object.keys(import.meta.glob('../assets/**/*.pdf'))).toEqual([])
  })
})

describe('projects', () => {
  const all = [featuredProject, ...projects]
  it('have unique slugs', () => {
    expect(new Set(all.map((p) => p.slug)).size).toBe(all.length)
  })
  it.each(all.map((p) => [p.slug, p] as const))('%s has a public live URL and an organisation repo', (_slug, p) => {
    expect(publicLiveUrl(p.liveUrl)).toBeTruthy()
    expect(p.repoUrl).toMatch(/^https:\/\/github\.com\/AmCheachamroeun-Portfolio\//)
  })
  it.each(all.map((p) => [p.slug] as const))('%s has media configured', (slug) => {
    const m = getProjectMedia(slug)
    expect(m?.desktop.length).toBeGreaterThan(0)
    expect(m?.video).toContain('/video/upload/')
    expect(m?.gif).toMatch(/\/image\/upload\/[^/]+\.gif$/)
  })
})
