import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import km from './locales/km.json'
import zh from './locales/zh-CN.json'

/** "a.b[0].c" style paths for every leaf, so a missing translation in any language is caught. */
const keys = (v: unknown, prefix = ''): string[] =>
  v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => keys(x, prefix ? `${prefix}.${k}` : k)) : [prefix]

/** English has singular/plural forms (`_one`/`_other`); Khmer and Chinese have no plural split, so compare without the suffix. */
const plain = (k: string) => k.replace(/_(zero|one|two|few|many|other)$/, '')
const base = new Set(keys(en).map(plain))

describe('translations', () => {
  for (const [name, data] of [
    ['km', km],
    ['zh-CN', zh],
  ] as const) {
    it(`${name} has every English key`, () => {
      const have = new Set(keys(data).map(plain))
      expect([...base].filter((k) => !have.has(k))).toEqual([])
    })
    it(`${name} has no keys that English lacks`, () => {
      expect(keys(data).filter((k) => !base.has(plain(k)))).toEqual([])
    })
  }
  it('has the CV labels in every language', () => {
    for (const d of [en, km, zh]) {
      expect(d.os.cv.download).toBeTruthy()
      expect(d.os.cv.view).toBeTruthy()
      expect(d.os.palette.actions.cvView).toBeTruthy()
    }
  })
})
