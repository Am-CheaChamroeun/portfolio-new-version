/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECT MEDIA  (hybrid: covers + posters local, everything heavy on Cloudinary)
 *
 *  LOCAL (in this repo, src/assets/projects/<dir>/): light + dark covers and the video poster. Nothing else.
 *  CLOUDINARY: desktop screenshots, mobile screenshots, the demo MP4 and the optional GIF preview.
 *
 *  Every Cloudinary reference below is a placeholder named  TODO_CLOUDINARY_<file name without extension>.
 *  File names are unique across projects ({slug}-desktop-NN-feature, {slug}-mobile-NN-feature, {slug}-demo …), so
 *  the recommended public ID is simply the file name without its extension. See docs/CLOUDINARY_MEDIA.md.
 *  Replace each one with that file's real public ID (needs VITE_CLOUDINARY_CLOUD_NAME) or its full
 *  https://res.cloudinary.com/… URL. With Dynamic folders the public ID may not include the folder, so copy it from Cloudinary.
 *  The first value in each row is the local file name (a label for you, not loaded by the site).
 *  A placeholder is never rendered: that screenshot is simply left out, and the video section stays hidden.
 *
 *  `dir` is the folder under src/assets/projects/. The key (`cashcompass`, `resumecraft`) must match the slug in portfolio.ts.
 *  Captions and alt text come from content.projects.<slug>.media.<file name without extension> in the locale files.
 * ─────────────────────────────────────────────────────────────
 */
import { mediaUrl, responsiveImage, type ResponsiveSrc } from '../lib/cloudinary'

/** [original file name, Cloudinary public ID or URL] */
type Row = readonly [file: string, remote: string]

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
    video: 'TODO_CLOUDINARY_cashcompass-demo-mp4', // cashcompass-demo.mp4 (Cloudinary resource type: video)
    gif: 'TODO_CLOUDINARY_cashcompass-demo-gif', // optional: cashcompass-demo.gif (resource type: image); only used when there is no working MP4
    desktop: [
      ['cashcompass-desktop-01-landing-page.webp', 'TODO_CLOUDINARY_cashcompass-desktop-01-landing-page'],
      ['cashcompass-desktop-02-dashboard.webp', 'TODO_CLOUDINARY_cashcompass-desktop-02-dashboard'],
      ['cashcompass-desktop-03-transactions.webp', 'TODO_CLOUDINARY_cashcompass-desktop-03-transactions'],
      ['cashcompass-desktop-04-accounts.webp', 'TODO_CLOUDINARY_cashcompass-desktop-04-accounts'],
      ['cashcompass-desktop-05-budgets.webp', 'TODO_CLOUDINARY_cashcompass-desktop-05-budgets'],
      ['cashcompass-desktop-06-savings-goals.webp', 'TODO_CLOUDINARY_cashcompass-desktop-06-savings-goals'],
      ['cashcompass-desktop-07-analytics.webp', 'TODO_CLOUDINARY_cashcompass-desktop-07-analytics'],
      ['cashcompass-desktop-08-recurring-payments.webp', 'TODO_CLOUDINARY_cashcompass-desktop-08-recurring-payments'],
      ['cashcompass-desktop-09-cash-flow-forecast.webp', 'TODO_CLOUDINARY_cashcompass-desktop-09-cash-flow-forecast'],
      ['cashcompass-desktop-10-financial-calendar.webp', 'TODO_CLOUDINARY_cashcompass-desktop-10-financial-calendar'],
      ['cashcompass-desktop-11-financial-reports.webp', 'TODO_CLOUDINARY_cashcompass-desktop-11-financial-reports'],
      ['cashcompass-desktop-12-notifications.webp', 'TODO_CLOUDINARY_cashcompass-desktop-12-notifications'],
      ['cashcompass-desktop-13-dark-dashboard.webp', 'TODO_CLOUDINARY_cashcompass-desktop-13-dark-dashboard'],
      ['cashcompass-desktop-14-khmer-dashboard.webp', 'TODO_CLOUDINARY_cashcompass-desktop-14-khmer-dashboard'],
      ['cashcompass-desktop-15-pdf-export.webp', 'TODO_CLOUDINARY_cashcompass-desktop-15-pdf-export'],
    ],
    mobile: [
      ['cashcompass-mobile-01-home.png', 'TODO_CLOUDINARY_cashcompass-mobile-01-home'],
      ['cashcompass-mobile-02-dashboard.png', 'TODO_CLOUDINARY_cashcompass-mobile-02-dashboard'],
      ['cashcompass-mobile-03-transactions.png', 'TODO_CLOUDINARY_cashcompass-mobile-03-transactions'],
      ['cashcompass-mobile-04-budgets.png', 'TODO_CLOUDINARY_cashcompass-mobile-04-budgets'],
      ['cashcompass-mobile-05-calendar.png', 'TODO_CLOUDINARY_cashcompass-mobile-05-calendar'],
    ],
  },
  resumecraft: {
    dir: 'resume-craft',
    coverDark: 'resumecraft-cover-dark.webp',
    coverLight: 'resumecraft-cover-light.webp',
    poster: 'resumecraft-demo-poster.webp',
    video: 'TODO_CLOUDINARY_resumecraft-demo-mp4', // resumecraft-demo.mp4 (Cloudinary resource type: video)
    gif: 'TODO_CLOUDINARY_resumecraft-demo-gif', // optional: resumecraft-demo.gif (resource type: image); only used when there is no working MP4
    desktop: [
      ['resumecraft-desktop-01-landing-page.webp', 'TODO_CLOUDINARY_resumecraft-desktop-01-landing-page'],
      ['resumecraft-desktop-02-template-gallery.webp', 'TODO_CLOUDINARY_resumecraft-desktop-02-template-gallery'],
      ['resumecraft-desktop-03-resume-editor.webp', 'TODO_CLOUDINARY_resumecraft-desktop-03-resume-editor'],
      ['resumecraft-desktop-04-editor-dark.webp', 'TODO_CLOUDINARY_resumecraft-desktop-04-editor-dark'],
      ['resumecraft-desktop-05-customization.webp', 'TODO_CLOUDINARY_resumecraft-desktop-05-customization'],
      ['resumecraft-desktop-06-ai-assistant.webp', 'TODO_CLOUDINARY_resumecraft-desktop-06-ai-assistant'],
      ['resumecraft-desktop-07-ats-analysis.webp', 'TODO_CLOUDINARY_resumecraft-desktop-07-ats-analysis'],
      ['resumecraft-desktop-08-my-resumes.webp', 'TODO_CLOUDINARY_resumecraft-desktop-08-my-resumes'],
      ['resumecraft-desktop-09-cover-letter.webp', 'TODO_CLOUDINARY_resumecraft-desktop-09-cover-letter'],
      ['resumecraft-desktop-10-cover-letter-templates.webp', 'TODO_CLOUDINARY_resumecraft-desktop-10-cover-letter-templates'],
      ['resumecraft-desktop-11-khmer-resume.webp', 'TODO_CLOUDINARY_resumecraft-desktop-11-khmer-resume'],
      ['resumecraft-desktop-12-pdf-export.webp', 'TODO_CLOUDINARY_resumecraft-desktop-12-pdf-export'],
      ['resumecraft-desktop-13-version-history.webp', 'TODO_CLOUDINARY_resumecraft-desktop-13-version-history'],
    ],
    mobile: [
      ['resumecraft-mobile-01-home.png', 'TODO_CLOUDINARY_resumecraft-mobile-01-home'],
      ['resumecraft-mobile-02-templates.png', 'TODO_CLOUDINARY_resumecraft-mobile-02-templates'],
      ['resumecraft-mobile-03-editor.png', 'TODO_CLOUDINARY_resumecraft-mobile-03-editor'],
      ['resumecraft-mobile-04-preview.png', 'TODO_CLOUDINARY_resumecraft-mobile-04-preview'],
    ],
  },
}

/* ── local files: Vite turns each into a hashed URL string (the image itself is only downloaded when shown) ── */
const local = import.meta.glob(['../assets/projects/*/covers/*.webp', '../assets/projects/*/demo/*-poster.webp'], {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const localUrl = (dir: string, folder: 'covers' | 'demo', file?: string) => (file ? local[`../assets/projects/${dir}/${folder}/${file}`] : undefined)

/* ── what the UI receives ── */

export type MediaShot = {
  id: string
  /** English fallback caption (from the file name); the real, translated one is content.projects.<slug>.media.<id> */
  caption: string
  /** Cloudinary delivery sources */
  remote: { thumb: ResponsiveSrc; full: ResponsiveSrc }
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
/** `cashcompass-desktop-02-dashboard.webp` → `desktop-02-dashboard` (the key of its caption in the locale files) */
const shotId = (file: string) => stem(file).replace(/^[a-z0-9]+-(?=(?:desktop|mobile)-)/, '')
/** "desktop-02-dashboard" → "Dashboard" */
const humanize = (id: string) => {
  const w = id.replace(/^(?:desktop|mobile)-\d+-/, '').replace(/-/g, ' ')
  return w.charAt(0).toUpperCase() + w.slice(1)
}

/** Rows whose reference is still a placeholder (or invalid) are left out: nothing broken is ever shown. */
function shots(rows: readonly Row[], portrait: boolean): MediaShot[] {
  const thumbSizes = portrait ? '96px' : '112px'
  const fullSizes = portrait ? '(min-width: 768px) 320px, 90vw' : '(min-width: 1024px) 860px, 100vw'
  return rows.flatMap(([file, ref]) => {
    const thumb = responsiveImage(ref, thumbSizes, 480)
    const full = responsiveImage(ref, fullSizes, 960)
    const id = shotId(file)
    return thumb && full ? [{ id, caption: humanize(id), remote: { thumb: { src: thumb.src }, full } }] : []
  })
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
    desktop: shots(c.desktop, false),
    mobile: shots(c.mobile, true),
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
