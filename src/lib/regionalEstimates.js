/**
 * regionalEstimates.js
 *
 * Fallback ranges shown ONLY when a university record has no verified value
 * (min_gpa / required_ielts / topikLevel are null). These are NOT written into
 * the database and NOT used in the chance-matching math in UniversityCard.jsx /
 * UniversityDetailModal.jsx — they exist purely for display, clearly labeled as
 * an estimate, so a student isn't staring at a blank field with zero context.
 *
 * Deliberately excluded: tuition, acceptance_rate, degree_levels, notable_programs.
 * These vary too widely within a single country/region to have an honest
 * "typical range" (e.g. tuition can differ 5-10x between two universities in
 * the same country). Inventing a number for those would mislead rather than
 * inform — for those fields, show "Not published by university" instead.
 */

export const REGIONAL_ESTIMATES = {
  'South Korea': {
    gpa: { min: 2.5, max: 3.5, note: 'Most Korean universities: min. eligible GPA ~2.5–3.0/4.0–4.5; competitive applicants typically 3.5+' },
    ielts: { min: 6.0, max: 6.5, note: 'Typical for English-taught undergraduate programs; top-tier schools (SNU, KAIST, Korea Univ.) often ask 6.5–7.0' },
    topik: { min: 3, max: 4, note: 'Korean-taught programs typically require TOPIK Level 3, competitive programs prefer Level 4+' },
  },
  Europe: {
    gpa: null, // Most European systems use national leaving-exam scores, not a 4.0 GPA — a GPA range here would be misleading, not just imprecise
    ielts: { min: 6.0, max: 6.5, note: 'Typical for English-taught undergraduate programs across the UK, Germany, Netherlands; competitive/law/medicine programs often 7.0+' },
    topik: null,
  },
  'North America': {
    gpa: { min: 3.0, max: 3.5, note: 'Broad ballpark for non-elite four-year institutions; selective schools commonly expect 3.7+' },
    ielts: { min: 6.5, max: 7.0, note: 'Typical minimum for US/Canadian undergraduate admission' },
    topik: null,
  },
};

/**
 * Returns an estimate object for a given field, or null if no honest
 * region-level estimate exists (region unmapped, or field intentionally
 * excluded per the note above).
 */
export function getRegionalEstimate(region, field) {
  const table = REGIONAL_ESTIMATES[region];
  if (!table) return null;
  return table[field] || null;
}
