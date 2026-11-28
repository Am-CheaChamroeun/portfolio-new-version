import { describe, expect, it } from 'vitest'
import { publicLiveUrl, repoLink } from './url'

describe('publicLiveUrl', () => {
  it.each([undefined, null, '', '   ', 'TODO_URL', '[LIVE URL]', 'not a url', 'http://app.vercel.app', 'https://localhost:3000', 'https://127.0.0.1', 'https://intranet'])(
    'rejects %j',
    (v) => expect(publicLiveUrl(v)).toBeUndefined(),
  )
  it('rejects the Vercel dashboard', () => {
    expect(publicLiveUrl('https://vercel.com/am-cheachamroeuns-projects/cash-compass')).toBeUndefined()
  })
  it('accepts a public https deployment', () => {
    expect(publicLiveUrl('https://cash-compass-nine.vercel.app')).toBe('https://cash-compass-nine.vercel.app/')
  })
})

describe('repoLink', () => {
  it('only accepts https', () => {
    expect(repoLink('https://github.com/AmCheachamroeun-Portfolio/cash-compass')).toContain('github.com')
    expect(repoLink('http://github.com/x/y')).toBeUndefined()
    expect(repoLink('')).toBeUndefined()
  })
})
