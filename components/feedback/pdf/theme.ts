/** PDF color theme — hex values for @react-pdf/renderer (no HSL support). */

export const colors = {
  primary: "#D9922B",       // warm amber (brand)
  primaryLight: "#FEF3C7",  // amber-50 equivalent
  background: "#FFFFFF",
  text: "#1C1917",          // stone-900
  textSecondary: "#78716C", // stone-500
  textMuted: "#A8A29E",     // stone-400
  border: "#E7E5E4",        // stone-200
  borderLight: "#F5F5F4",   // stone-100

  // Scoring tiers
  exceptional: "#10B981",       // emerald-500
  exceptionalBg: "#ECFDF5",    // emerald-50
  proficient: "#0EA5E9",       // sky-500
  proficientBg: "#F0F9FF",     // sky-50
  developing: "#F59E0B",       // amber-500
  developingBg: "#FFFBEB",     // amber-50
  needsWork: "#EF4444",        // red-500
  needsWorkBg: "#FEF2F2",     // red-50
} as const

export const fonts = {
  serif: "Libre Caslon Text",
  sans: "Inter",
} as const

export const fontSize = {
  xs: 8,
  sm: 9,
  base: 10,
  md: 11,
  lg: 14,
  xl: 18,
  xxl: 22,
} as const

export type ScoringTier = "exceptional" | "proficient" | "developing" | "needsWork"

export interface TierInfo {
  key: ScoringTier
  label: string
  color: string
  bg: string
}

export function getScoringTier(score: number): TierInfo {
  if (score >= 85) return { key: "exceptional", label: "Exceptional", color: colors.exceptional, bg: colors.exceptionalBg }
  if (score >= 70) return { key: "proficient", label: "Proficient", color: colors.proficient, bg: colors.proficientBg }
  if (score >= 50) return { key: "developing", label: "Developing", color: colors.developing, bg: colors.developingBg }
  return { key: "needsWork", label: "Needs Work", color: colors.needsWork, bg: colors.needsWorkBg }
}
