import { describe, expect, it } from 'vitest'
import { gifUrl, mediaUrl } from '../lib/cloudinary'
import { getProjectMedia } from './projectMedia'

describe('Cloudinary URLs', () => {
  it('builds versionless, optimised image URLs from a public ID', () => {
    expect(mediaUrl('cashcompass-desktop-01-landing-page', 'image', 960)).toBe(
      'https://res.cloudinary.com/df3cyznc/image/upload/f_auto,q_auto,c_limit,w_960/cashcompass-desktop-01-landing-page',
    )
  })
  it('builds a video URL without a size', () => {
    expect(mediaUrl('cashcompass-demo', 'video')).toBe('https://res.cloudinary.com/df3cyznc/video/upload/f_auto,q_auto/cashcompass-demo')
  })
  it('delivers GIFs untransformed', () => {
    expect(gifUrl('cashcompass-demo')).toBe('https://res.cloudinary.com/df3cyznc/image/upload/cashcompass-demo.gif')
  })
  it('never turns placeholders or unsafe IDs into URLs', () => {
    for (const v of ['', undefined, 'TODO_CLOUDINARY_x', '[x]', '../x', 'a?b']) expect(mediaUrl(v)).toBeUndefined()
  })
})

describe('project media', () => {
  it('has 15 + 5 CashCompass and 13 + 4 ResumeCraft screenshots', () => {
    const cc = getProjectMedia('cashcompass')
    const rc = getProjectMedia('resumecraft')
    expect([cc?.desktop.length, cc?.mobile.length]).toEqual([15, 5])
    expect([rc?.desktop.length, rc?.mobile.length]).toEqual([13, 4])
  })
  it('has unique image URLs', () => {
    for (const slug of ['cashcompass', 'resumecraft']) {
      const m = getProjectMedia(slug)!
      const urls = [...m.desktop, ...m.mobile].map((s) => s.remote.full.src)
      expect(new Set(urls).size).toBe(urls.length)
    }
  })
  it('keeps covers and posters local', () => {
    for (const slug of ['cashcompass', 'resumecraft']) {
      const m = getProjectMedia(slug)!
      for (const u of [m.coverDark, m.coverLight, m.poster]) expect(u && !u.includes('cloudinary')).toBeTruthy()
    }
  })
})
