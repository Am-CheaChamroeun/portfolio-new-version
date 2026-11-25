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
 *     text there by `id` (e.g. education "kit" → content.education.kit).
 *
 *  Anything in [SQUARE BRACKETS] is a placeholder to replace.
 * ─────────────────────────────────────────────────────────────
 *
 *  Images: put files in /public and reference them by path,
 *  e.g. photo: '/profile.jpg'. Leave a field empty ('') to show
 *  the built-in placeholder instead.
 */
import aibodiaLogo from '../assets/experience/aibodia-logo.png'
import ibankLogo from '../assets/experience/ibank-cambodia-logo.png'
import isbLogo from '../assets/experience/isb-vietnam-logo.png'
import cheaSimLogo from '../assets/education/chea-sim-santhor-mok-high-school-logo.png'
import kitLogo from '../assets/education/kirirom-institute-of-technology-logo.png'
import tgiLogo from '../assets/education/tux-global-institute-logo.png'
import profilePhoto from '../assets/profile/profile-photo.png'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  Database,
  FlaskConical,
  Gauge,
  Landmark,
  Layers,
  ShieldCheck,
  GitBranch,
  Network,
  PanelsTopLeft,
  Radio,
  Server,
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
  photo: profilePhoto, // src/assets/profile/profile-photo.png (square, 800×800)
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
  featureIcons: [Layers, GitBranch, Gauge, ShieldCheck] as LucideIcon[],
}

/* ───────────── Education ───────────── */

export type EducationItem = {
  id: string // text: content.education.<id> → degree, type, location, details[]
  school: string // institution names stay as written, in every language
  /** "2021 – 2025", or just the year when `graduation` is true */
  period: string
  /** the period is a single graduation year (no enrollment year is shown) */
  graduation?: boolean
  /** dates not confirmed yet — shows a "provisional" tag. Remove this line once confirmed. */
  provisional?: boolean
  batch?: number
  current?: boolean
  url?: string
  logo?: string // imported from src/assets/education/
}

export const education: EducationItem[] = [
  {
    id: 'kit',
    school: 'Kirirom Institute of Technology',
    period: '2021 – 2025',
    batch: 9,
    url: 'https://www.kit.edu.kh/',
    logo: kitLogo,
  },
  {
    id: 'tgi',
    school: 'TUX Global Institute',
    period: '2022 – 2023',
    provisional: true, // TODO: confirm the exact years, then delete this line
    batch: 2,
    url: 'https://www.tuxglobalinstitute.edu.kh/',
    logo: tgiLogo,
  },
  {
    id: 'chea-sim',
    school: 'Chea Sim Santhor Mok High School',
    period: '2020',
    graduation: true,
    logo: cheaSimLogo,
  },
]

/* ───────────── Skills ───────────── */

/**
 * percent: 0–100, used internally only — visitors see the label (Expert 95+, Advanced 85+, Proficient 70+,
 * Intermediate 50+, Learning below 50) and a 12-bar meter, both derived from it in lib/proficiency.ts.
 */
export type Skill = { name: string; icon: TechKey; percent: number }
/** `key` also picks the group's translated label: content.skills.<key> */
export type SkillGroup = { key: string; icon: LucideIcon; skills: Skill[] }

// Git, Claude Code and Figma keep their earlier levels (10, 9 and 7 of 12 bars), written here as percentages.
export const skillGroups: SkillGroup[] = [
  {
    key: 'frontend',
    icon: PanelsTopLeft,
    skills: [
      { name: 'React', icon: 'react', percent: 90 },
      { name: 'Vue.js', icon: 'vue', percent: 85 },
      { name: 'Angular', icon: 'angular', percent: 75 },
      { name: 'Next.js', icon: 'nextjs', percent: 90 },
      { name: 'Nuxt.js', icon: 'nuxt', percent: 85 },
      { name: 'TypeScript', icon: 'typescript', percent: 85 },
      { name: 'JavaScript', icon: 'javascript', percent: 90 },
      { name: 'TanStack Query', icon: 'tanstack', percent: 80 },
    ],
  },
  {
    key: 'backend',
    icon: Server,
    skills: [
      { name: 'Express.js', icon: 'express', percent: 70 },
      { name: 'NestJS', icon: 'nestjs', percent: 80 },
      { name: 'Node.js', icon: 'nodejs', percent: 80 },
      { name: 'Spring Boot', icon: 'springboot', percent: 70 },
    ],
  },
  {
    key: 'data',
    icon: Network,
    skills: [
      { name: 'GraphQL', icon: 'graphql', percent: 75 },
      { name: 'Headless WordPress', icon: 'wordpress', percent: 75 },
    ],
  },
  {
    key: 'databases',
    icon: Database,
    skills: [
      { name: 'PostgreSQL', icon: 'postgresql', percent: 70 },
      { name: 'MySQL', icon: 'mysql', percent: 70 },
      { name: 'Supabase', icon: 'supabase', percent: 65 },
      { name: 'Firebase', icon: 'firebase', percent: 65 },
      { name: 'MongoDB', icon: 'mongodb', percent: 70 },
    ],
  },
  {
    key: 'tools',
    icon: Wrench,
    skills: [
      { name: 'Git', icon: 'git', percent: 83 },
      { name: 'Claude Code', icon: 'claude', percent: 75 },
      { name: 'Figma', icon: 'figma', percent: 58 },
    ],
  },
]

/* ───────────── Work experience ───────────── */

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
export type WorkplaceType = 'on-site' | 'remote' | 'hybrid'

/** A project inside a position (shown as an expandable item). Its name, role and bullets live in locale `content.experience.<id>.projects.<project id>`. */
export type ExperienceProject = {
  id: string
  technologies: string[]
}

/**
 * One position. Facts (company, dates, technologies, links) live here; the wording — job title, location,
 * description, responsibilities and projects — lives in the locale files under `content.experience.<id>`
 * so it can be translated.
 *
 * HOW TO ADD A JOB:
 *   1. Add an object to `workExperience` below (copy one).
 *   2. Put the logo in src/assets/experience/ (kebab-case, e.g. acme-co-logo.png), import it at the top of this file
 *      and set `logo`.
 *   3. Add `content.experience.<id>` with title, location, description, responsibilities[] (and optionally
 *      achievements[], projects) to en.json, km.json and zh-CN.json.
 * Order does not matter — the app sorts the newest position first. Leave `end` out for a job you still hold.
 * Entries whose company name still contains [BRACKETS] are hidden from visitors in a production build.
 */
export type WorkExperience = {
  id: string // kebab-case, matches content.experience.<id>
  company: string // company names stay as written, in every language
  /** Leave out when it is not known / not stated */
  employmentType?: EmploymentType
  workplaceType?: WorkplaceType
  /** 'YYYY-MM' */
  start: string
  /** 'YYYY-MM'. Leave out for a current position. */
  end?: string
  /** Leave empty until you want to list them */
  technologies: string[]
  projects?: ExperienceProject[]
  /** Imported image from src/assets/experience/ */
  logo?: string
  /** Company website */
  url?: string
}

const unique = (items: string[]) => [...new Set(items)]

const aibodiaProjects: ExperienceProject[] = [
  { id: 'card-request', technologies: ['Vite', 'Nuxt.js', 'Pinia', 'Tailwind CSS', 'TanStack Query', 'WebSocket', 'Vitest', 'Playwright', 'K6'] },
  { id: 'hr-management', technologies: ['Vite', 'Next.js', 'Tailwind CSS', 'TanStack Query', 'PWA', 'NestJS', 'Spring Boot'] },
  { id: 'chat-sdk', technologies: ['Nuxt.js', 'Pinia', 'Tailwind CSS', 'PWA', 'WebSocket', 'NestJS', 'Electron.js'] },
  { id: 'investment-ecommerce', technologies: ['Vue.js', 'Nuxt.js', 'Tailwind CSS', 'Pinia', 'WebSocket', 'NestJS', 'Spring Boot'] },
]

export const workExperience: WorkExperience[] = [
  {
    id: 'ibank-cambodia',
    company: 'IBANK Cambodia',
    start: '2026-08', // no end date: current position
    technologies: [], // to be provided
    logo: ibankLogo,
  },
  {
    id: 'aibodia',
    company: 'AIBODIA',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    start: '2025-05',
    end: '2026-08',
    technologies: unique(aibodiaProjects.flatMap((p) => p.technologies)),
    projects: aibodiaProjects,
    logo: aibodiaLogo,
  },
  {
    id: 'isb-vietnam',
    company: 'ISB Vietnam Co., Ltd. (IVC)',
    employmentType: 'full-time',
    workplaceType: 'on-site',
    start: '2024-10',
    end: '2025-04',
    technologies: ['Vue.js', 'Vuetify', 'React.js', 'Angular', 'NestJS', 'Spring Boot', 'PWA'],
    logo: isbLogo,
  },
]

/* ───────────── Certifications ───────────── */

/** Kept for future use — Certificates is not shown in the app navigation right now. */

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

/* ───────────── Specializations ───────────── */

/**
 * The Specializations app. Title, description and `tags` live in content.services.<id> (translated).
 *  • `technologies` = real programming technologies / tools. They get official logos, and they are what the
 *    "Technologies" counter counts (each distinct technology once).
 *  • `tags` (in the locale file) = domains, practices and business concepts — shown as plain badges, never counted as technologies.
 *  • `core` = highlighted card; the "Core practices" counter is the number of these.
 */
export type Specialization = { id: string; icon: LucideIcon; core?: boolean; technologies?: string[] }

export const services: Specialization[] = [
  { id: 'fullstack', icon: Layers, core: true, technologies: ['React', 'Next.js', 'Vue.js', 'Nuxt.js', 'NestJS', 'Spring Boot', 'TypeScript'] },
  { id: 'backend', icon: Server, core: true, technologies: ['Node.js', 'NestJS', 'Spring Boot', 'Java', 'REST API'] },
  {
    id: 'frontend',
    icon: PanelsTopLeft,
    core: true,
    technologies: ['React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'TypeScript', 'Tailwind CSS', 'Vuetify', 'Pinia', 'TanStack Query', 'Vite'],
  },
  { id: 'fintech', icon: Landmark },
  { id: 'enterprise', icon: Building2 },
  { id: 'integration', icon: Network, technologies: ['REST API', 'GraphQL'] },
  { id: 'realtime', icon: Radio, technologies: ['WebSocket', 'NestJS', 'PWA', 'Electron.js'] },
  { id: 'security', icon: ShieldCheck },
  { id: 'quality', icon: FlaskConical, technologies: ['Vitest', 'Playwright', 'k6'] },
]

/** Number of highlighted (core) specializations — counted from the data */
export const highlightedServices = services.filter((s) => s.core).length

/* ───────────── Stats band ───────────── */

// Counts are derived from the real data above. `years` is the only hand-written number — keep it truthful.
export const stats = [
  { id: 'technologies', value: skillGroups.reduce((n, g) => n + g.skills.length, 0), suffix: '' },
  { id: 'areas', value: skillGroups.length, suffix: '' },
  { id: 'years', value: 3, suffix: '+' },
  { id: 'languages', value: 3, suffix: '' },
]
