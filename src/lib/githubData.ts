import { githubConfig } from '../data/github'

/**
 * Loads public GitHub data (official REST API, no token) with a cache so switching apps
 * never refetches: in-memory for the visit, localStorage across visits (1 h fresh).
 * Failures and rate limits fall back to the last cached copy, flagged as stale.
 */
export type GhProfile = { login: string; avatar: string; url: string; repos: number; followers: number; following: number; name: string | null }
export type GhRepo = {
  name: string
  url: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  pushedAt: string
  fork: boolean
}
export type GhEvent = { id: string; type: 'push' | 'pr' | 'create' | 'release' | 'fork'; repo: string; at: string; detail: string }
export type GhDay = { date: string; count: number }
export type GhData = {
  profile: GhProfile
  repos: GhRepo[]
  events: GhEvent[]
  days: GhDay[]
  /** 'calendar' = full contribution calendar from the configured proxy; 'events' = public events only */
  daysSource: 'calendar' | 'events'
  fetchedAt: number
}
export type GhResult = { data: GhData | null; stale: boolean; error: 'rate' | 'network' | 'notfound' | null }

const TTL = 60 * 60 * 1000
const API = 'https://api.github.com'
const memory = new Map<string, GhData>()
const inflight = new Map<string, Promise<GhResult>>()

const cacheKey = (u: string) => `devos-gh-${u.toLowerCase()}`
const readCache = (u: string): GhData | null => {
  const m = memory.get(u)
  if (m) return m
  try {
    const d = JSON.parse(localStorage.getItem(cacheKey(u)) ?? 'null') as GhData | null
    return d && d.profile?.login && Array.isArray(d.repos) && Array.isArray(d.events) && Array.isArray(d.days) ? d : null
  } catch {
    return null
  }
}
const writeCache = (u: string, d: GhData) => {
  memory.set(u, d)
  try {
    localStorage.setItem(cacheKey(u), JSON.stringify(d))
  } catch {
    /* storage full or unavailable */
  }
}

class GhError extends Error {
  kind: 'rate' | 'network' | 'notfound'
  constructor(kind: 'rate' | 'network' | 'notfound') {
    super(kind)
    this.kind = kind
  }
}

async function get<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } })
  } catch {
    throw new GhError('network')
  }
  if (res.status === 404) throw new GhError('notfound')
  if (res.status === 403 || res.status === 429) throw new GhError('rate')
  if (!res.ok) throw new GhError('network')
  return res.json() as Promise<T>
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const ymd = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

function mapEvents(raw: any[]): GhEvent[] {
  const out: GhEvent[] = []
  for (const e of raw) {
    const repo =
      String(e.repo?.name ?? '')
        .split('/')
        .pop() ?? ''
    const base = { id: String(e.id), repo, at: String(e.created_at) }
    if (e.type === 'PushEvent') {
      const n = e.payload?.size ?? e.payload?.commits?.length ?? 1
      out.push({ ...base, type: 'push', detail: String(n) })
    } else if (e.type === 'PullRequestEvent') out.push({ ...base, type: 'pr', detail: `${e.payload?.action ?? ''}` })
    else if (e.type === 'CreateEvent' && e.payload?.ref_type === 'repository') out.push({ ...base, type: 'create', detail: '' })
    else if (e.type === 'ReleaseEvent') out.push({ ...base, type: 'release', detail: String(e.payload?.release?.tag_name ?? '') })
    else if (e.type === 'ForkEvent') out.push({ ...base, type: 'fork', detail: '' })
  }
  return out
}

/** Real public events per day over the last ~13 weeks (GitHub only serves 90 days / 300 events). */
function eventDays(raw: any[]): GhDay[] {
  const counts = new Map<string, number>()
  for (const e of raw) {
    const day = String(e.created_at).slice(0, 10)
    counts.set(day, (counts.get(day) ?? 0) + (e.type === 'PushEvent' ? Math.max(1, e.payload?.size ?? 1) : 1))
  }
  const days: GhDay[] = []
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    days.push({ date: ymd(d), count: counts.get(ymd(d)) ?? 0 })
  }
  return days
}

async function calendarDays(): Promise<GhDay[] | null> {
  if (!githubConfig.contributionsUrl) return null
  try {
    const res = await fetch(githubConfig.contributionsUrl)
    if (!res.ok) return null
    const json = (await res.json()) as { contributions?: { date: string; count: number }[] }
    const list = json.contributions
    return Array.isArray(list) && list.length ? list.map((c) => ({ date: String(c.date), count: Number(c.count) || 0 })) : null
  } catch {
    return null
  }
}

async function load(username: string): Promise<GhResult> {
  const cached = readCache(username)
  try {
    const [user, repos, events] = await Promise.all([
      get<any>(`/users/${username}`),
      get<any[]>(`/users/${username}/repos?per_page=100&sort=pushed&type=owner`),
      get<any[]>(`/users/${username}/events/public?per_page=100`).catch(() => [] as any[]),
    ])
    const calendar = await calendarDays()
    const data: GhData = {
      profile: {
        login: user.login,
        avatar: user.avatar_url,
        url: user.html_url,
        repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        name: user.name ?? null,
      },
      repos: repos.map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        pushedAt: r.pushed_at,
        fork: !!r.fork,
      })),
      events: mapEvents(events),
      days: calendar ?? eventDays(events),
      daysSource: calendar ? 'calendar' : 'events',
      fetchedAt: Date.now(),
    }
    writeCache(username, data)
    return { data, stale: false, error: null }
  } catch (e) {
    const error = e instanceof GhError ? e.kind : 'network'
    return error === 'notfound' ? { data: null, stale: false, error } : { data: cached, stale: !!cached, error }
  }
}

/** Fresh cache → no request. Otherwise one shared request, whoever asks. */
export function loadGithub(username: string, force = false): Promise<GhResult> {
  const cached = readCache(username)
  if (cached && !force && Date.now() - cached.fetchedAt < TTL) {
    memory.set(username, cached)
    return Promise.resolve({ data: cached, stale: false, error: null })
  }
  let p = inflight.get(username)
  if (!p) {
    p = load(username).finally(() => inflight.delete(username))
    inflight.set(username, p)
  }
  return p
}

/** The last cached copy, if any — lets the panel paint instantly while it revalidates. */
export const peekGithub = (username: string) => readCache(username)
