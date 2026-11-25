import { socials } from './portfolio'
import { isReal } from '../lib/links'

/**
 * ─────────────────────────────────────────────────────────────
 *  GITHUB ACTIVITY (System Monitor → GitHub)
 *
 *  The username is taken from `socials.github.url` in portfolio.ts as soon as
 *  you replace the [YOUR GITHUB] placeholder — nothing else to configure.
 *  (To override it, set `username` below, or VITE_GITHUB_USERNAME at build time.)
 *
 *  Data comes from GitHub's official public REST API, called straight from the
 *  browser. No token is used or needed — never put a token in this file or in a
 *  VITE_* variable, because anything bundled into the site is public.
 *
 *  CONTRIBUTION HEATMAP
 *  GitHub's official REST API has no contribution-calendar endpoint (it needs the GraphQL API
 *  and a private token). So by default the heatmap shows your real *public events*
 *  (pushes, pull requests, …) from the last ~90 days, labelled as such.
 *  For the full yearly calendar, deploy a tiny server-side proxy that holds the token
 *  and returns  { "contributions": [{ "date": "2026-01-31", "count": 3 }, …] },
 *  then put its public URL in `contributionsUrl` (or VITE_GITHUB_CONTRIBUTIONS_URL).
 *  A ready-made public proxy with this format is https://github-contributions-api.jogruber.de
 *  (third-party, no token needed) — e.g. 'https://github-contributions-api.jogruber.de/v4/<username>?y=last'.
 * ─────────────────────────────────────────────────────────────
 */
const env = import.meta.env as Record<string, string | undefined>

export const githubConfig = {
  /** Leave empty to derive it from socials.github.url */
  username: env.VITE_GITHUB_USERNAME ?? '',
  /** Optional URL of a contribution-calendar proxy (see above). Must not contain secrets. */
  contributionsUrl: env.VITE_GITHUB_CONTRIBUTIONS_URL ?? '',
}

/** The GitHub username in use, or '' while it is still a placeholder. */
export function githubUsername() {
  if (githubConfig.username) return githubConfig.username
  const url = socials.github.url
  if (!isReal(url)) return ''
  return /github\.com\/([A-Za-z0-9-]+)/.exec(url)?.[1] ?? ''
}
