/**
 * usGenericInfo.js
 *
 * Generic facts that are true for (almost) every accredited US university,
 * used ONLY as a fallback when a specific university record has no verified
 * visa_info / min_gpa. These are NOT fabricated per-university data — they
 * are federal immigration law (F-1 visa) and a well-documented, widely-cited
 * admissions norm (holistic review, no fixed GPA cutoff at most US schools).
 *
 * Anywhere these are shown in the UI, they must be visually/textually labeled
 * as "general information" so they are never confused with a university's own
 * verified numbers. Per-university verified data (when we have it) always
 * takes priority over these constants.
 */

export const US_GENERIC_VISA_INFO = {
  visa_required: true,
  work_allowed_hours: 20,
  post_study_work_visa: true,
  visa_details:
    "International students in the US study on an F-1 visa. You can work up to 20 hours/week on campus during the semester (full-time during breaks). After graduation, most students qualify for OPT (Optional Practical Training) — up to 12 months of work authorization in your field, extendable to 3 years total for STEM degrees.",
};

export const US_GPA_HOLISTIC_NOTE =
  "Most US universities use holistic admissions — they weigh essays, extracurriculars, and recommendations alongside grades, rather than a single fixed GPA cutoff. A higher GPA still helps, but there's no universal minimum like in some other countries.";

export const US_GENERIC_SUPPORT_NOTE =
  "Most US universities have a dedicated International Student Office (sometimes called ISSS) that helps with visa paperwork, orientation, and cultural adjustment — exact services vary by school.";
