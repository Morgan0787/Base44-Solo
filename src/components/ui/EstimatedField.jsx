import React from 'react';
import { getRegionalEstimate } from '@/lib/regionalEstimates';

/**
 * Shows a verified value if present. If null, falls back to a regional
 * ballpark range (GPA / IELTS / TOPIK only — see regionalEstimates.js for
 * why other fields don't get this treatment), visually distinguished so it's
 * never confused with a real, university-confirmed number.
 *
 * If there's no verified value AND no honest regional estimate either,
 * shows a plain "not published" note instead of inventing anything.
 */
export default function EstimatedField({ value, field, region, format = (v) => v, unit = '' }) {
  if (value !== null && value !== undefined && value !== '') {
    return <span className="font-semibold text-slate-800">{format(value)}{unit}</span>;
  }

  const estimate = getRegionalEstimate(region, field);

  if (!estimate) {
    return <span className="text-slate-400 italic text-sm">Not published by university</span>;
  }

  return (
    <span className="italic text-slate-500" title={estimate.note}>
      ~{format(estimate.min)}–{format(estimate.max)}{unit}
      <span className="ml-1 text-[10px] not-italic uppercase tracking-wide text-amber-600 align-middle">estimate</span>
    </span>
  );
}
