import {
  siClaude,
  siElectron,
  siK6,
  siPinia,
  siPwa,
  siVitest,
  siVuetify,
  siAngular,
  siDocker,
  siExpress,
  siFirebase,
  siFigma,
  siGit,
  siGithub,
  siGraphql,
  siJavascript,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siNuxt,
  siPostgresql,
  siPostman,
  siReactquery,
  siSupabase,
  siReact,
  siRedux,
  siSpringboot,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
  siVuedotjs,
  siWordpress,
  type SimpleIcon,
} from 'simple-icons'

/**
 * Open-source brand icons (simple-icons, CC0).
 * THE one registry for technology logos — Skills, the About toolbox, Work Experience, Projects and case studies all read from here.
 * To add a technology: import its `si*` icon above, add it to this map, and (if people write it in other ways,
 * e.g. "Tailwind CSS") add those spellings to `techAliases` below. Browse names at https://simpleicons.org
 * A technology with no official icon here (e.g. WebSocket, Playwright) automatically gets the neutral fallback icon.
 */
export const techIcons = {
  react: siReact,
  nextjs: siNextdotjs,
  vue: siVuedotjs,
  angular: siAngular,
  nuxt: siNuxt,
  tanstack: siReactquery,
  typescript: siTypescript,
  javascript: siJavascript,
  vite: siVite,
  tailwind: siTailwindcss,
  redux: siRedux,
  nestjs: siNestjs,
  nodejs: siNodedotjs,
  express: siExpress,
  supabase: siSupabase,
  firebase: siFirebase,
  springboot: siSpringboot,
  graphql: siGraphql,
  wordpress: siWordpress,
  postgresql: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  docker: siDocker,
  git: siGit,
  github: siGithub,
  figma: siFigma,
  postman: siPostman,
  vercel: siVercel,
  claude: siClaude,
  pinia: siPinia,
  vitest: siVitest,
  k6: siK6,
  pwa: siPwa,
  electron: siElectron,
  vuetify: siVuetify,
} satisfies Record<string, SimpleIcon>

export type TechKey = keyof typeof techIcons

/** Other ways a technology is written in the data → its icon key (lower-case). Registry keys always work too. */
const techAliases: Record<string, TechKey> = {
  'react.js': 'react',
  reactjs: 'react',
  'next.js': 'nextjs',
  'vue.js': 'vue',
  vuejs: 'vue',
  'nuxt.js': 'nuxt',
  nuxtjs: 'nuxt',
  'tanstack query': 'tanstack',
  'react query': 'tanstack',
  'express.js': 'express',
  expressjs: 'express',
  'nest.js': 'nestjs',
  'spring boot': 'springboot',
  'node.js': 'nodejs',
  node: 'nodejs',
  postgres: 'postgresql',
  'tailwind css': 'tailwind',
  tailwindcss: 'tailwind',
  'claude code': 'claude',
  'electron.js': 'electron',
  electronjs: 'electron',
  'progressive web app': 'pwa',
}

/** "Tailwind CSS", "tailwind", "TailwindCSS" … → 'tailwind'. Undefined when there is no official icon (use the fallback). */
export function resolveTech(name: string): TechKey | undefined {
  const k = name.trim().toLowerCase()
  if (techAliases[k]) return techAliases[k]
  return Object.hasOwn(techIcons, k) ? (k as TechKey) : undefined
}
