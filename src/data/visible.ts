import { certificates, education, featuredProject, projects, type Project } from './portfolio'
import { onlyReal } from '../lib/placeholder'

/**
 * What visitors actually see. In a production build, entries that still contain [PLACEHOLDER] text are left out
 * (see lib/placeholder.ts); `npm run dev` keeps them so they are easy to spot and replace.
 */
export const visibleProjects: Project[] = onlyReal([featuredProject, ...projects], (p) => p.name)
export const visibleEducation = onlyReal(education, (e) => e.school)
export const visibleCertificates = onlyReal(certificates, (c) => c.title)
