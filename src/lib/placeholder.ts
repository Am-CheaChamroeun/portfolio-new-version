/**
 * Placeholder handling. Anything written as [SQUARE BRACKETS] is content the owner still has to supply.
 * While developing (`npm run dev`) placeholders stay visible so they are easy to find;
 * in a production build they are hidden, so visitors never see "[PROJECT NAME]".
 */
export const SHOW_PLACEHOLDERS: boolean = import.meta.env.DEV

export const isPlaceholder = (text: string | undefined | null): boolean => !!text && text.includes('[') && text.includes(']')

/** True when the text may be shown to visitors */
export const shown = (text: string | undefined | null): text is string => !!text && (SHOW_PLACEHOLDERS || !isPlaceholder(text))

/** Drops placeholder entries in production builds */
export const onlyReal = <T,>(items: readonly T[], text: (item: T) => string | undefined): T[] => items.filter((i) => shown(text(i)))
