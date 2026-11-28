/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECT MEDIA  (hybrid: covers + posters local, everything heavy on Cloudinary)
 *
 *  LOCAL (in this repo, src/assets/projects/<dir>/): light + dark covers and the video poster. Nothing else.
 *  CLOUDINARY: desktop screenshots, mobile screenshots, the demo MP4 and the optional GIF preview.
 *
 *  Every Cloudinary reference below is a public ID (= the file name without its extension; with Dynamic folders the
 *  folder is NOT part of it). URLs are built by src/lib/cloudinary.ts from VITE_CLOUDINARY_CLOUD_NAME (df3cyznc):
 *    screenshots  /image/upload/f_auto,q_auto,c_limit,w_N/<id>   (original format kept, responsive widths)
 *    MP4          /video/upload/f_auto,q_auto/<id>               (resource type video)
 *    GIF          /image/upload/<id>.gif                         (untransformed; large GIFs are rejected when transformed)
 *  All 41 were checked against Cloudinary; results are in docs/CLOUDINARY_MEDIA.md.
 *  The first value in each row is the original file name (a label, not loaded by the site).
 *  A reference that cannot be resolved is never rendered: that screenshot is left out and the video section stays hidden.
 *
 *  `dir` is the folder under src/assets/projects/. The key (`cashcompass`, `resumecraft`) must match the slug in portfolio.ts.
 *  Captions and alt text come from content.projects.<slug>.media.<file name without extension> in the locale files.
 * ─────────────────────────────────────────────────────────────
 */
import { gifUrl, mediaUrl, responsiveImage, type ResponsiveSrc } from '../lib/cloudinary'

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
    video: 'cashcompass-demo', // cashcompass-demo.mp4 (Cloudinary resource type: video)
    gif: 'cashcompass-demo', // optional: cashcompass-demo.gif (resource type: image); only used when there is no working MP4
    desktop: [
      ['cashcompass-desktop-01-landing-page.webp', 'cashcompass-desktop-01-landing-page'],
      ['cashcompass-desktop-02-dashboard.webp', 'cashcompass-desktop-02-dashboard'],
      ['cashcompass-desktop-03-transactions.webp', 'cashcompass-desktop-03-transactions'],
      ['cashcompass-desktop-04-accounts.webp', 'cashcompass-desktop-04-accounts'],
      ['cashcompass-desktop-05-budgets.webp', 'cashcompass-desktop-05-budgets'],
      ['cashcompass-desktop-06-savings-goals.webp', 'cashcompass-desktop-06-savings-goals'],
      ['cashcompass-desktop-07-analytics.webp', 'cashcompass-desktop-07-analytics'],
      ['cashcompass-desktop-08-recurring-payments.webp', 'cashcompass-desktop-08-recurring-payments'],
      ['cashcompass-desktop-09-cash-flow-forecast.webp', 'cashcompass-desktop-09-cash-flow-forecast'],
      ['cashcompass-desktop-10-financial-calendar.webp', 'cashcompass-desktop-10-financial-calendar'],
      ['cashcompass-desktop-11-financial-reports.webp', 'cashcompass-desktop-11-financial-reports'],
      ['cashcompass-desktop-12-notifications.webp', 'cashcompass-desktop-12-notifications'],
      ['cashcompass-desktop-13-dark-dashboard.webp', 'cashcompass-desktop-13-dark-dashboard'],
      ['cashcompass-desktop-14-khmer-dashboard.webp', 'cashcompass-desktop-14-khmer-dashboard'],
      ['cashcompass-desktop-15-pdf-export.webp', 'cashcompass-desktop-15-pdf-export'],
    ],
    mobile: [
      ['cashcompass-mobile-01-home.png', 'cashcompass-mobile-01-home'],
      ['cashcompass-mobile-02-dashboard.png', 'cashcompass-mobile-02-dashboard'],
      ['cashcompass-mobile-03-transactions.png', 'cashcompass-mobile-03-transactions'],
      ['cashcompass-mobile-04-budgets.png', 'cashcompass-mobile-04-budgets'],
      ['cashcompass-mobile-05-calendar.png', 'cashcompass-mobile-05-calendar'],
    ],
  },
  resumecraft: {
    dir: 'resume-craft',
    coverDark: 'resumecraft-cover-dark.webp',
    coverLight: 'resumecraft-cover-light.webp',
    poster: 'resumecraft-demo-poster.webp',
    video: 'resumecraft-demo', // resumecraft-demo.mp4 (Cloudinary resource type: video)
    gif: 'resumecraft-demo', // optional: resumecraft-demo.gif (resource type: image); only used when there is no working MP4
    desktop: [
      ['resumecraft-desktop-01-landing-page.webp', 'resumecraft-desktop-01-landing-page'],
      ['resumecraft-desktop-02-template-gallery.webp', 'resumecraft-desktop-02-template-gallery'],
      ['resumecraft-desktop-03-resume-editor.webp', 'resumecraft-desktop-03-resume-editor'],
      ['resumecraft-desktop-04-editor-dark.webp', 'resumecraft-desktop-04-editor-dark'],
      ['resumecraft-desktop-05-customization.webp', 'resumecraft-desktop-05-customization'],
      ['resumecraft-desktop-06-ai-assistant.webp', 'resumecraft-desktop-06-ai-assistant'],
      ['resumecraft-desktop-07-ats-analysis.webp', 'resumecraft-desktop-07-ats-analysis'],
      ['resumecraft-desktop-08-my-resumes.webp', 'resumecraft-desktop-08-my-resumes'],
      ['resumecraft-desktop-09-cover-letter.webp', 'resumecraft-desktop-09-cover-letter'],
      ['resumecraft-desktop-10-cover-letter-templates.webp', 'resumecraft-desktop-10-cover-letter-templates'],
      ['resumecraft-desktop-11-khmer-resume.webp', 'resumecraft-desktop-11-khmer-resume'],
      ['resumecraft-desktop-12-pdf-export.webp', 'resumecraft-desktop-12-pdf-export'],
      ['resumecraft-desktop-13-version-history.webp', 'resumecraft-desktop-13-version-history'],
    ],
    mobile: [
      ['resumecraft-mobile-01-home.png', 'resumecraft-mobile-01-home'],
      ['resumecraft-mobile-02-templates.png', 'resumecraft-mobile-02-templates'],
      ['resumecraft-mobile-03-editor.png', 'resumecraft-mobile-03-editor'],
      ['resumecraft-mobile-04-preview.png', 'resumecraft-mobile-04-preview'],
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
    gif: gifUrl(c.gif),
  }
  cache.set(slug, media)
  return media
}

/** The local cover that matches the current theme (falls back to the other one). */
export function coverFor(slug: string, dark: boolean): string | undefined {
  const m = getProjectMedia(slug)
  return dark ? (m?.coverDark ?? m?.coverLight) : (m?.coverLight ?? m?.coverDark)
}
