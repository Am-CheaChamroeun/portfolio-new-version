import { certificates, education, featuredProject, projects, workExperience, type Project } from './portfolio'
import { onlyReal } from '../lib/placeholder'

/**
 * What visitors actually see. In a production build, entries that still contain [PLACEHOLDER] text are left out
 * (see lib/placeholder.ts); `npm run dev` keeps them so they are easy to spot and replace.
 */
export const visibleProjects: Project[] = onlyReal([featuredProject, ...projects], (p) => p.name)
export const visibleEducation = onlyReal(education, (e) => e.school)
export const visibleCertificates = onlyReal(certificates, (c) => c.title)

/** 'YYYY-MM' → sortable number; anything else (an unfilled [DATE]) sorts last */
const monthIndex = (d?: string) => {
  const m = /^(\d{4})-(\d{2})$/.exec(d ?? '')
  return m ? Number(m[1]) * 12 + Number(m[2]) - 1 : 0
}
/** Newest position first: jobs you still hold, then by end date, then by start date */
const endKey = (e: { end?: string }) => (e.end ? monthIndex(e.end) : Number.MAX_SAFE_INTEGER)
export const visibleExperience = onlyReal(workExperience, (e) => e.company)
  .slice()
  .sort((a, b) => (endKey(a) === endKey(b) ? monthIndex(b.start) - monthIndex(a.start) : endKey(b) < endKey(a) ? -1 : 1))
