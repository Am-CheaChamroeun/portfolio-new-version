/**
 * Cloudinary URL helper (no SDK, no network calls, no secrets).
 *
 * A media reference in src/data/projectMedia.ts can be either:
 *   • a full public URL      → https://res.cloudinary.com/<cloud>/image/upload/v123/portfolio/x/y.webp
 *   • a Cloudinary public ID → portfolio/cashcompass/screenshots/dashboard   (needs VITE_CLOUDINARY_CLOUD_NAME)
 *
 * Anything that is empty, still a placeholder (TODO_…, REPLACE_…, [..]) or invalid resolves to `undefined`,
 * so callers can fall back to the local copy or hide the section. Nothing here ever throws.
 *
 * Only the cloud NAME is read from the environment. It is public (it is part of every delivery URL), but API keys,
 * secrets and upload presets must never be put in a VITE_ variable.
 */

const RAW_CLOUD = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '').trim()

/** The configured cloud name, or '' when it is missing or still the `.env.example` placeholder. */
export const CLOUD_NAME = /^[a-z0-9_-]+$/i.test(RAW_CLOUD) && !/^your_/i.test(RAW_CLOUD) ? RAW_CLOUD : ''

/** Widths we ask Cloudinary for. A short, fixed list keeps the number of cached variants (and transformations) small. */
export const IMAGE_WIDTHS = [480, 960, 1600] as const

export type MediaKind = 'image' | 'video'

/** True for empty values and obvious placeholders — those are never turned into a URL. */
export function isPlaceholder(ref?: string | null): boolean {
  const v = (ref ?? '').trim()
  return v === '' || /^(todo|replace|your_|changeme)/i.test(v) || /[[\]{}<>\s]/.test(v)
}

/** Smallest allowed width that is at least `w` (the largest one if `w` is bigger). */
const snap = (w: number) => IMAGE_WIDTHS.find((x) => x >= w) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]

/** Transformations: automatic format + quality; `c_limit` keeps the aspect ratio and never upscales. */
const imageTransform = (w: number) => `f_auto,q_auto,c_limit,w_${snap(w)}`
const videoTransform = 'f_auto,q_auto'

/** A path segment right after `/upload/` that already holds transformations (e.g. `f_auto,q_auto` or `w_800`). */
const looksLikeTransform = (seg: string) => seg.includes(',') || /^[a-z]{1,3}_[^/]+$/i.test(seg)

function fromUrl(raw: string, kind: MediaKind, width: number): string | undefined {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return undefined
  }
  if (u.protocol !== 'https:') return undefined
  if (u.hostname !== 'res.cloudinary.com') return u.href // some other https host: used exactly as given
  const m = /^(\/[^/]+\/(?:image|video)\/upload\/)(.*)$/.exec(u.pathname)
  if (!m) return u.href
  const [, head, rest] = m
  if (looksLikeTransform(rest.split('/')[0])) return u.href // the URL already carries its own transformations
  u.pathname = `${head}${kind === 'video' ? videoTransform : imageTransform(width)}/${rest}`
  return u.href
}

function fromPublicId(id: string, kind: MediaKind, width: number): string | undefined {
  if (!CLOUD_NAME) return undefined
  const clean = id.replace(/^\/+/, '')
  if (!clean || clean.includes('..') || /[?#\\]/.test(clean)) return undefined
  const path = clean.split('/').map(encodeURIComponent).join('/')
  const t = kind === 'video' ? videoTransform : imageTransform(width)
  return `https://res.cloudinary.com/${CLOUD_NAME}/${kind}/upload/${t}/${path}`
}

/** One delivery URL for a reference, or `undefined` if it cannot be resolved. `width` only matters for images. */
export function mediaUrl(ref: string | undefined, kind: MediaKind = 'image', width = 960): string | undefined {
  if (isPlaceholder(ref)) return undefined
  const v = ref!.trim()
  return /^https?:\/\//i.test(v) ? fromUrl(v, kind, width) : fromPublicId(v, kind, width)
}

export type ResponsiveSrc = { src: string; srcSet?: string; sizes?: string }

/**
 * `src` + `srcSet` for an image reference. A `res.cloudinary.com` URL / public ID gets the width ladder;
 * any other https URL is used as a single plain `src`.
 */
export function responsiveImage(ref: string | undefined, sizes: string, base = 960): ResponsiveSrc | undefined {
  const src = mediaUrl(ref, 'image', base)
  if (!src) return undefined
  if (!src.startsWith('https://res.cloudinary.com/') || !/[,/]w_\d+/.test(src)) return { src }
  const urls = IMAGE_WIDTHS.map((w) => mediaUrl(ref, 'image', w))
  if (new Set(urls).size < IMAGE_WIDTHS.length) return { src } // the URL had its own fixed transformations
  return { src, srcSet: urls.map((u, i) => `${u} ${IMAGE_WIDTHS[i]}w`).join(', '), sizes }
}
