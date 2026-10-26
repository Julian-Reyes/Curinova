/**
 * The product's display name is a placeholder and WILL change before launch.
 * This file and the i18n strings (through the {{appName}} variable) are the only
 * places it may appear. See docs/DECISIONS.md → "Renaming the product".
 *
 * Never use these values for storage keys, cache names, package names or IDs.
 * Those use the permanent internal codename in `CODENAME`.
 */
export const BRAND = {
  name: 'Curinova',
  shortName: 'Curinova',
} as const;

/**
 * Earlier working titles. Tests make sure they never reappear outside the rename
 * history (docs/DECISIONS.md) and the original spec (docs/SPEC.md).
 */
export const RETIRED_BRAND_NAMES = ['CurioFeed'] as const;

/** Matches a brand name case-insensitively, also when split into words ("Curio Feed"). */
export function brandNamePattern(name: string): RegExp {
  const parts = name.split(/(?=[A-Z])/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(parts.join('\\s?'), 'i');
}

/** Permanent internal codename. Renaming it would wipe guest data. Do not change. */
export const CODENAME = 'lumen';
