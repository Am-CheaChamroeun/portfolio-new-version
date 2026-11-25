/**
 * Skill proficiency. Skills are stored as a percentage in portfolio.ts (never shown to visitors);
 * the label and the segmented meter are both derived from it here, so there is one source of truth.
 *
 *   Expert 95–100 · Advanced 85–94 · Proficient 70–84 · Intermediate 50–69 · Learning below 50
 */
export const PROFICIENCY_LEVELS = ['expert', 'advanced', 'proficient', 'intermediate', 'learning'] as const
export type Proficiency = (typeof PROFICIENCY_LEVELS)[number]

/** Number of bars in the meter */
export const SKILL_SEGMENTS = 12

export const proficiencyOf = (percent: number): Proficiency =>
  percent >= 95 ? 'expert' : percent >= 85 ? 'advanced' : percent >= 70 ? 'proficient' : percent >= 50 ? 'intermediate' : 'learning'

/** How many of the 12 bars are lit (any skill above 0% shows at least one) */
export const segmentsOf = (percent: number): number => Math.min(SKILL_SEGMENTS, Math.max(percent > 0 ? 1 : 0, Math.round((percent / 100) * SKILL_SEGMENTS)))
