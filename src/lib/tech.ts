import {
  siClaude,
  siDocker,
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
  siPostgresql,
  siPostman,
  siReact,
  siRedux,
  siSpringboot,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
  siWordpress,
  type SimpleIcon,
} from 'simple-icons'

/**
 * Open-source brand icons (simple-icons, CC0).
 * To add a technology: import its `si*` icon above and add it to this map.
 * Browse names at https://simpleicons.org
 */
export const techIcons = {
  react: siReact,
  nextjs: siNextdotjs,
  typescript: siTypescript,
  javascript: siJavascript,
  vite: siVite,
  tailwind: siTailwindcss,
  redux: siRedux,
  nestjs: siNestjs,
  nodejs: siNodedotjs,
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
} satisfies Record<string, SimpleIcon>

export type TechKey = keyof typeof techIcons
