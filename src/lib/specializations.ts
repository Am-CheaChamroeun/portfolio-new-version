import { services } from '../data/portfolio'
import { resolveTech } from './tech'

/** Every distinct programming technology across all specializations (NestJS in three cards counts once). Business concepts are tags, not technologies, so they are never counted. */
export const uniqueTechnologies: string[] = (() => {
  const seen = new Map<string, string>()
  services.forEach((s) => s.technologies?.forEach((name) => seen.set(resolveTech(name) ?? name.toLowerCase(), name)))
  return [...seen.values()]
})()
