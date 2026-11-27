/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECT MEDIA  (hybrid: small files local, heavy files on Cloudinary)
 *
 *  LOCAL (in this repo, src/assets/projects/<dir>/): covers (light + dark) and the video poster.
 *  CLOUDINARY: desktop screenshots, mobile screenshots, the demo MP4 and the optional GIF preview.
 *
 *  Each Cloudinary reference below is `TODO_CLOUDINARY_PUBLIC_ID_OR_URL` until you upload the file. Replace it with
 *  the file's real public ID or its full https://res.cloudinary.com/… URL (see docs/CLOUDINARY_MEDIA.md).
 *  While a value is still a placeholder (or VITE_CLOUDINARY_CLOUD_NAME is missing), the portfolio simply uses the
 *  local copy of that screenshot if one exists, and hides the video section. No broken images, no errors.
 *
 *  `dir` is the folder under src/assets/projects/. `slug` (the key) must match the project's slug in portfolio.ts.
 *  Captions are English; add `content.projects.<slug>.media.<id>` to a locale file to translate one.
 * ─────────────────────────────────────────────────────────────
 */
import { mediaUrl, responsiveImage, type ResponsiveSrc } from '../lib/cloudinary'

/** Not a real reference. Replace it after uploading (the site ignores it until then). */
const TODO = 'TODO_CLOUDINARY_PUBLIC_ID_OR_URL'

/** [file name in src/assets/projects/<dir>/<folder>/, caption, Cloudinary public ID or URL] */
type Row = readonly [file: string, caption: string, remote: string]

type Config = {
  dir: string
  /** file names inside covers/ and demo/ (local, bundled) */
  coverDark?: string
  coverLight?: string
  poster?: string
  desktop: readonly Row[]
  mobile: readonly Row[]
  /** public ID or URL of the demo MP4 (preferred) and of the optional GIF preview */
  video?: string
  gif?: string
}

const configs: Record<string, Config> = {
  cashcompass: {
    dir: 'cash-compass',
    coverDark: 'cashcompass-cover-dark.webp',
    coverLight: 'cashcompass-cover-light.webp',
    poster: 'cashcompass-demo-poster.webp',
    video: TODO, // cashcompass-demo.mp4  → portfolio/cashcompass/demo/
    gif: undefined, // optional: cashcompass-demo.gif → set a public ID/URL to offer a GIF when there is no MP4
    desktop: [
      ['01-landing-page.webp', 'Landing page', TODO],
      ['02-dashboard.webp', 'Dashboard', TODO],
      ['03-transactions.webp', 'Transactions', TODO],
      ['04-accounts.webp', 'Accounts', TODO],
      ['05-budgets.webp', 'Budgets', TODO],
      ['06-savings-goals.webp', 'Savings goals', TODO],
      ['07-analytics.webp', 'Analytics', TODO],
      ['08-recurring-payments.webp', 'Recurring payments', TODO],
      ['09-cash-flow-forecast.webp', 'Cash flow forecast', TODO],
      ['10-financial-calendar.webp', 'Financial calendar', TODO],
      ['11-financial-reports.webp', 'Financial reports', TODO],
      ['12-notifications.webp', 'Notifications', TODO],
      ['13-dark-dashboard.webp', 'Dashboard in dark mode', TODO],
      ['14-khmer-dashboard.webp', 'Dashboard in Khmer', TODO],
      ['15-pdf-export.webp', 'PDF export', TODO],
    ],
    mobile: [
      ['01-mobile-home.png', 'Home', TODO],
      ['02-mobile-dashboard.png', 'Dashboard', TODO],
      ['03-mobile-transactions.png', 'Transactions', TODO],
      ['04-mobile-budgets.png', 'Budgets', TODO],
      ['05-mobile-calendar.png', 'Calendar', TODO],
    ],
  },
  resumecraft: {
    dir: 'resume-builder',
    coverDark: 'resumecraft-cover-dark.webp',
    coverLight: 'resumecraft-cover-light.webp',
    poster: 'resumecraft-demo-poster.webp',
    video: TODO, // resumecraft-demo.mp4 → portfolio/resumecraft/demo/
    gif: undefined,
    desktop: [
      ['01-landing-page.webp', 'Landing page', TODO],
      ['02-template-gallery.webp', 'Template gallery', TODO],
      ['03-resume-editor.webp', 'Resume editor', TODO],
      ['04-editor-dark.webp', 'Editor in dark mode', TODO],
      ['05-customization.webp', 'Customization', TODO],
      ['06-ai-assistant.webp', 'AI assistant', TODO],
      ['07-ats-analysis.webp', 'ATS analysis', TODO],
      ['08-my-resumes.webp', 'My resumes', TODO],
      ['09-cover-letter.webp', 'Cover letter', TODO],
      ['10-cover-letter-templates.webp', 'Cover letter templates', TODO],
      ['11-khmer-resume.webp', 'Resume in Khmer', TODO],
      ['12-pdf-export.webp', 'PDF export', TODO],
      ['13-version-history.webp', 'Version history', TODO],
    ],
    mobile: [
      ['01-mobile-home.png', 'Home', TODO],
      ['02-mobile-templates.png', 'Templates', TODO],
      ['03-mobile-editor.png', 'Editor', TODO],
      ['04-mobile-preview.png', 'Preview', TODO],
    ],
  },
}

/* ── local files: Vite turns each into a hashed URL string (the image itself is only downloaded when shown) ── */
const local = import.meta.glob(
  [
    '../assets/projects/*/covers/*.webp',
    '../assets/projects/*/demo/*-poster.webp',
    '../assets/projects/*/screenshots/*.webp',
    '../assets/projects/*/mobile/*.{png,webp}',
  ],
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

const localUrl = (dir: string, folder: string, file?: string) => (file ? local[`../assets/projects/${dir}/${folder}/${file}`] : undefined)

/* ── what the UI receives ── */

export type MediaShot = {
  id: string
  caption: string
  /** Cloudinary delivery sources (undefined until configured) */
  remote?: { thumb: ResponsiveSrc; full: ResponsiveSrc }
  /** the bundled copy: used when there is no (working) Cloudinary source */
  local?: string
}

export type ProjectMedia = {
  coverDark?: string
  coverLight?: string
  poster?: string
  desktop: MediaShot[]
  mobile: MediaShot[]
  video?: string
  gif?: string
}

const stem = (file: string) => file.replace(/\.[a-z]+$/i, '')

function shots(rows: readonly Row[], dir: string, folder: 'screenshots' | 'mobile', portrait: boolean): MediaShot[] {
  const thumbSizes = portrait ? '96px' : '112px'
  const fullSizes = portrait ? '(min-width: 768px) 320px, 90vw' : '(min-width: 1024px) 860px, 100vw'
  return rows
    .map(([file, caption, ref]): MediaShot => {
      const thumb = responsiveImage(ref, thumbSizes, 480)
      const full = responsiveImage(ref, fullSizes, 960)
      return { id: stem(file), caption, remote: thumb && full ? { thumb: { src: thumb.src }, full } : undefined, local: localUrl(dir, folder, file) }
    })
    .filter((s) => s.remote || s.local) // nothing to show for this file → leave it out
}

const cache = new Map<string, ProjectMedia | undefined>()

/** Resolved media for a project slug, or `undefined` when the project has no media configured. */
export function getProjectMedia(slug: string): ProjectMedia | undefined {
  if (cache.has(slug)) return cache.get(slug)
  const c = configs[slug]
  const media: ProjectMedia | undefined = c && {
    coverDark: localUrl(c.dir, 'covers', c.coverDark),
    coverLight: localUrl(c.dir, 'covers', c.coverLight),
    poster: localUrl(c.dir, 'demo', c.poster),
    desktop: shots(c.desktop, c.dir, 'screenshots', false),
    mobile: shots(c.mobile, c.dir, 'mobile', true),
    video: mediaUrl(c.video, 'video'),
    gif: mediaUrl(c.gif, 'image', 960),
  }
  cache.set(slug, media)
  return media
}

/** The local cover that matches the current theme (falls back to the other one). */
export function coverFor(slug: string, dark: boolean): string | undefined {
  const m = getProjectMedia(slug)
  return dark ? (m?.coverDark ?? m?.coverLight) : (m?.coverLight ?? m?.coverDark)
}
