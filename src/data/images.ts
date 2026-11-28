/**
 * ─────────────────────────────────────────────────────────────
 *  TEMPORARY MOCK IMAGES
 *
 *  Every illustration below is a placeholder (original SVG art in
 *  src/assets/mock/). None of them are real screenshots, photos or
 *  certificates — the site labels them as previews/placeholders.
 *
 *  HOW TO SWAP IN A REAL IMAGE
 *  Put your file in /public (e.g. public/projects/shop.webp) and set the
 *  matching field in src/data/portfolio.ts:
 *    • profile photo        → profile.photo = '/profile.jpg'
 *    • project screenshot   → project.image = '/projects/shop.webp'
 *    • certificate scan     → certificate.image = '/certs/devops.jpg'
 *    • school logo          → education item .logo = '/education/uni.png'
 *  A real image always wins; the mock is only used while the field is empty.
 *  No component changes are needed.
 *
 *  Purely decorative art (welcome-widget workstation, specialization
 *  illustrations, messages window, etc.) can be replaced by changing the
 *  import path here.
 * ─────────────────────────────────────────────────────────────
 */
import heroWorkstation from '../assets/mock/hero/developer-workstation.svg'
import profilePortrait from '../assets/mock/profile/portrait-illustration.svg'
import galleryMobile from '../assets/mock/projects/gallery-mobile.svg'
import galleryCode from '../assets/mock/projects/gallery-code.svg'
import emblemUniversity from '../assets/mock/education/emblem-university.svg'
import emblemAcademy from '../assets/mock/education/emblem-academy.svg'
import emblemSchool from '../assets/mock/education/emblem-school.svg'
import certClassic from '../assets/mock/certifications/certificate-preview-classic.svg'
import certModern from '../assets/mock/certifications/certificate-preview-modern.svg'
import specFrontend from '../assets/mock/specializations/frontend-components.svg'
import specApi from '../assets/mock/specializations/api-endpoints.svg'
import specAuth from '../assets/mock/specializations/auth-access.svg'
import specIntegration from '../assets/mock/specializations/integration-network.svg'
import specFullStack from '../assets/mock/specializations/full-stack-layers.svg'
import specFintech from '../assets/mock/specializations/fintech-card.svg'
import specEnterprise from '../assets/mock/specializations/enterprise-dashboard.svg'
import specRealtime from '../assets/mock/specializations/realtime-chat.svg'
import specQuality from '../assets/mock/specializations/quality-testing.svg'
import contactMessages from '../assets/mock/contact/messages-window.svg'
import skillsCodeWindow from '../assets/mock/skills/code-window.svg'

export const mockImages = {
  /** Welcome widget: a developer workstation (decorative) */
  hero: heroWorkstation,
  /** Profile app portrait, until profile.photo is set */
  profile: profilePortrait,
  /** Project previews by project slug (none needed now: every project has a local cover; kept for future placeholders) */
  projects: {
  } as Record<string, string>,
  /** Extra mock frames for the case-study gallery (used after the project's own preview) */
  projectGallery: [galleryMobile, galleryCode],
  /** Education emblems by education id, until item.logo is set */
  education: {
    'edu-1': emblemUniversity,
    'edu-2': emblemAcademy,
    'edu-3': emblemSchool,
  } as Record<string, string>,
  /** Certificate layouts, used in order, until certificate.image is set */
  certificates: [certClassic, certModern],
  /** Illustrations for the Specializations cards, by service id */
  specializations: {
    fullstack: specFullStack,
    backend: specApi,
    frontend: specFrontend,
    fintech: specFintech,
    enterprise: specEnterprise,
    integration: specIntegration,
    realtime: specRealtime,
    security: specAuth,
    quality: specQuality,
  } as Record<string, string>,
  /** Messages app illustration */
  contact: contactMessages,
  /** Tech Stack app, shown when a filter matches nothing */
  skillsDecoration: skillsCodeWindow,
}

/** The image to show, and whether it is a temporary mock. */
export function pickImage(real: string | undefined, mock: string | undefined) {
  if (real) return { src: real, isMock: false }
  if (mock) return { src: mock, isMock: true }
  return null
}
