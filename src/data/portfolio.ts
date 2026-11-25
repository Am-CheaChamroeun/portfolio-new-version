/**
 * ─────────────────────────────────────────────────────────────
 *  YOUR CONTENT LIVES IN TWO PLACES:
 *
 *  1. This file — everything that stays the same in every language:
 *     names, links, images, tech names, skill levels, colours.
 *
 *  2. src/i18n/locales/{en,km,zh-CN}.json — every piece of text a
 *     visitor reads (bio, taglines, descriptions…) in each language.
 *     Look under the "content" key. Items here are matched to their
 *     text there by `id` (e.g. education "edu-1" → content.education.edu-1).
 *
 *  Anything in [SQUARE BRACKETS] is a placeholder to replace.
 * ─────────────────────────────────────────────────────────────
 *
 *  Images: put files in /public and reference them by path,
 *  e.g. photo: '/profile.jpg'. Leave a field empty ('') to show
 *  the built-in placeholder instead.
 */
import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  Bot,
  Boxes,
  CodeXml,
  Database,
  Gauge,
  GitBranch,
  KeyRound,
  LayoutTemplate,
  Network,
  PanelsTopLeft,
  Server,
  Sparkles,
  Wrench,
} from 'lucide-react'
import type { TechKey } from '../lib/tech'

/* ───────────── Identity ───────────── */

export const profile = {
  name: 'Roeun', // [YOUR FULL NAME]
  initials: 'R',
  /** Shown in the logo as `${handle}${handleSuffix}` → "roeun.dev" */
  handle: 'roeun',
  handleSuffix: '.dev',
  locationFlag: '🇰🇭',
  /** [lat, lng] for the marker on the globe — null hides the marker */
  globeMarker: [11.5564, 104.9282] as [number, number] | null, // Phnom Penh
  photo: '', // e.g. '/profile.jpg' (portrait, 4:5 works best)
  logo: '', // small round avatar in the header — falls back to `photo`, then initials
  cvUrl: '/cv.pdf', // drop your CV at public/cv.pdf
  /** Entry number printed on the journal page */
  badgeId: 'RN · 2026 · 001',
  missionCode: 'RN-2026', // entry code in the hero's page header
}

export const socials = {
  email: 'amcheachamroeun87@gmail.com',
  github: { url: 'https://github.com/Am-CheaChamroeun', label: '@Am-CheaChamroeun' },
  linkedin: {
    url: 'https://www.linkedin.com/in/am-cheachamroeun-430406234/',
    label: '/in/am-cheachamroeun-430406234',
  },
  telegram: { url: 'https://t.me/Am_Cheachamroeun', label: '@Am_Cheachamroeun' },
}

/**
 * Optional: a form endpoint (e.g. Formspree) that accepts POSTed JSON.
 * Leave empty to have the contact form open the visitor's email app instead.
 */
export const contactFormEndpoint = ''

/* ───────────── Navigation ───────────── */

/** Labels come from `nav.<key>` in the locale files */
export const navLinks = [
  { key: 'about', href: '#about' },
  { key: 'education', href: '#education' },
  { key: 'skills', href: '#skills' },
  { key: 'projects', href: '#projects' },
  { key: 'services', href: '#services' },
  { key: 'contact', href: '#contact' },
] as const

/* ───────────── Hero decorations ───────────── */

export const preloader = {
  chips: ['React', 'TypeScript', 'Next.js', 'NestJS', 'Vite'],
}

/**
 * Commands drafted on the hero drafting sheet, on a loop.
 * Their output lines are translated: content.terminal.<index> in the locale files.
 */
export const terminalCommands = ['$ npm run deploy', 'vite build --mode production', 'vercel deploy --prod', 'curl /api/health']
/** Which output lines are "info" (neon) rather than "success" — by index */
export const terminalInfoLines = [3]

/** Location label shown in the System Monitor (a real location, not a server region). */
export const heroTelemetry = {
  region: 'PHNOM-PENH-KH',
}

/* ───────────── About ───────────── */

export const about = {
  /** Logos in the page-flipping "My toolbox" sketchbook (inner list first, then outer) */
  orbitInner: ['react', 'nextjs', 'typescript', 'nestjs', 'vite'] as TechKey[],
  orbitOuter: ['springboot', 'graphql', 'wordpress', 'git'] as TechKey[],
  /** Icons for the four feature cards — their labels are content.about.features */
  featureIcons: [CodeXml, GitBranch, Gauge, Sparkles] as LucideIcon[],
}

/* ───────────── Education ───────────── */

export type EducationItem = {
  id: string // text: content.education.<id>.details
  school: string // institution names stay as written, in every language
  period: string
  current?: boolean
  url?: string
  logo?: string // e.g. '/education/university.png'
}

export const education: EducationItem[] = [
  {
    id: 'edu-1',
    school: '[UNIVERSITY / SCHOOL NAME]',
    period: '[YEAR] — [YEAR]',
    current: true,
    url: '',
  },
  {
    id: 'edu-2',
    school: '[COURSE, BOOTCAMP OR ACADEMY]',
    period: '[YEAR] — [YEAR]',
    url: '',
  },
  { id: 'edu-3', school: '[HIGH SCHOOL]', period: '[YEAR] — [YEAR]' },
]

/* ───────────── Skills ───────────── */

/** level: 1–12 segments. 11+ = expert, 9–10 = advanced, 7–8 = proficient, below = learning */
export type Skill = { name: string; icon: TechKey; level: number }
/** `key` also picks the group's translated label: content.skills.<key> */
export type SkillGroup = { key: string; icon: LucideIcon; skills: Skill[] }

// TODO: adjust levels to how you'd rate yourself.
export const skillGroups: SkillGroup[] = [
  {
    key: 'frontend',
    icon: PanelsTopLeft,
    skills: [
      { name: 'React', icon: 'react', level: 11 },
      { name: 'Vue', icon: 'vue', level: 6 }, // TODO: set your own level
      { name: 'Angular', icon: 'angular', level: 5 }, // TODO: set your own level
      { name: 'Next.js', icon: 'nextjs', level: 10 },
      { name: 'Nuxt.js', icon: 'nuxt', level: 6 }, // TODO: set your own level
      { name: 'TypeScript', icon: 'typescript', level: 10 },
      { name: 'JavaScript', icon: 'javascript', level: 11 },
      { name: 'TanStack Query', icon: 'tanstack', level: 7 }, // TODO: set your own level
    ],
  },
  {
    key: 'backend',
    icon: Server,
    skills: [
      { name: 'Express.js', icon: 'express', level: 7 }, // TODO: set your own level
      { name: 'NestJS', icon: 'nestjs', level: 8 },
      { name: 'Node.js', icon: 'nodejs', level: 8 },
      { name: 'Spring Boot', icon: 'springboot', level: 5 },
    ],
  },
  {
    key: 'data',
    icon: Network,
    skills: [
      { name: 'GraphQL', icon: 'graphql', level: 7 },
      { name: 'Headless WordPress', icon: 'wordpress', level: 7 },
    ],
  },
  {
    key: 'databases',
    icon: Database,
    skills: [
      { name: 'PostgreSQL', icon: 'postgresql', level: 6 },
      { name: 'MySQL', icon: 'mysql', level: 6 }, // TODO: set your own level
      { name: 'Supabase', icon: 'supabase', level: 6 }, // TODO: set your own level
      { name: 'Firebase', icon: 'firebase', level: 6 }, // TODO: set your own level
      { name: 'MongoDB', icon: 'mongodb', level: 6 }, // TODO: set your own level
    ],
  },
  {
    key: 'tools',
    icon: Wrench,
    skills: [
      { name: 'Git', icon: 'git', level: 10 },
      { name: 'Claude Code', icon: 'claude', level: 9 },
      { name: 'Figma', icon: 'figma', level: 7 },
    ],
  },
]

/* ───────────── Certifications ───────────── */

/** Official certificate titles and issuer names stay as written, in every language. */
export type Certificate = {
  title: string
  issuer: string
  issuerFull?: string
  date: string
  image?: string // e.g. '/certs/my-certificate.jpg' (landscape)
}

export const certificates: Certificate[] = [
  {
    title: '[CERTIFICATE TITLE]',
    issuer: '[ISSUER]',
    issuerFull: '[ISSUER FULL NAME]',
    date: '[MON YEAR]',
  },
  {
    title: '[CERTIFICATE TITLE]',
    issuer: '[ISSUER]',
    issuerFull: '[ISSUER FULL NAME]',
    date: '[MON YEAR]',
  },
]

/* ───────────── Projects ───────────── */

/** Text (tagline, description, highlights) lives in content.projects.<slug> */
export type Project = {
  name: string // project names stay as written, in every language
  slug: string
  tech: string[]
  /** Accent colour for the preview (hex) */
  accent: string
  liveUrl?: string
  repoUrl?: string
  image?: string // screenshot or logo in /public
  imageFit?: 'cover' | 'contain'
  /** Optional: overrides the category shown on the card (otherwise it is worked out from `tech`) */
  category?: 'frontend' | 'fullstack' | 'backend' | 'cms'
  /** Optional: extra screenshots for the case-study gallery, e.g. ['/projects/shop-1.webp'] (mock visuals are used until set) */
  gallery?: string[]
}

export const featuredProject: Project = {
  name: '[FEATURED PROJECT]',
  slug: 'featured-project',
  tech: ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL'],
  accent: '#efff00',
  liveUrl: '',
  repoUrl: '',
}

export const projects: Project[] = [
  {
    name: '[PROJECT NAME]',
    slug: 'project-one',
    tech: ['React', 'TypeScript', 'Vite'],
    accent: '#ffd600',
    repoUrl: '',
  },
  {
    name: '[PROJECT NAME]',
    slug: 'project-two',
    tech: ['Next.js', 'WordPress', 'GraphQL'],
    accent: '#efff00',
    repoUrl: '',
  },
  {
    name: '[PROJECT NAME]',
    slug: 'project-three',
    tech: ['NestJS', 'PostgreSQL', 'Docker'],
    accent: '#ffd600',
    repoUrl: '',
  },
]

/* ───────────── Services ───────────── */

/** Title + description live in content.services.<id> */
export const services: { id: string; stack: string; icon: LucideIcon }[] = [
  {
    id: 'frontend',
    stack: 'React · TypeScript · Vite · Tailwind',
    icon: PanelsTopLeft,
  },
  {
    id: 'nextjs',
    stack: 'Next.js · App Router · ISR · Vercel',
    icon: LayoutTemplate,
  },
  { id: 'cms', stack: 'WordPress · REST · GraphQL', icon: Boxes },
  { id: 'api', stack: 'NestJS · Node.js · Spring Boot', icon: Server },
  { id: 'auth', stack: 'RBAC · Guards · JWT', icon: KeyRound },
  {
    id: 'performance',
    stack: 'Lighthouse · Web Vitals · Profiler',
    icon: Gauge,
  },
  { id: 'a11y', stack: 'WCAG · ARIA · Semantic HTML', icon: Accessibility },
  { id: 'integration', stack: 'REST · GraphQL · Webhooks', icon: Network },
  { id: 'ai', stack: 'Claude Code · Prompting · Review', icon: Bot },
]

/** Highlights the first N service cards (the rest render faded) */
export const highlightedServices = 2

/* ───────────── Stats band ───────────── */

// Counts are derived from the real data above. `years` is the only hand-written number — keep it truthful.
export const stats = [
  { id: 'technologies', value: skillGroups.reduce((n, g) => n + g.skills.length, 0), suffix: '' },
  { id: 'areas', value: skillGroups.length, suffix: '' },
  { id: 'years', value: 3, suffix: '+' },
  { id: 'languages', value: 3, suffix: '' },
]
