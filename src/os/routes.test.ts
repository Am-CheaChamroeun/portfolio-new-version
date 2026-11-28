import { describe, expect, it } from 'vitest'
import { APP_IDS, parsePath, pathFor, samePath } from './routes'

const known = ['cashcompass', 'resumecraft']

describe('routes', () => {
  it('maps / and /about to About Me', () => {
    expect(parsePath('/', known)).toEqual({ kind: 'app', app: 'about', slug: null })
    expect(samePath('/', '/about')).toBe(true)
  })
  it('round-trips every app and every project', () => {
    for (const app of APP_IDS) expect(parsePath(pathFor(app, null), known)).toMatchObject({ kind: 'app', app })
    for (const slug of known) expect(parsePath(pathFor('projects', slug), known)).toEqual({ kind: 'app', app: 'projects', slug })
  })
  it('ignores a trailing slash', () => {
    expect(parsePath('/projects/cashcompass/', known)).toMatchObject({ slug: 'cashcompass' })
  })
  it('sends unknown addresses and unknown projects to 404', () => {
    expect(parsePath('/nope', known).kind).toBe('notFound')
    expect(parsePath('/projects/not-a-project', known).kind).toBe('notFound')
    expect(parsePath('/cv.pdf', known).kind).toBe('notFound')
  })
})
