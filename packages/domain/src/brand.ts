/**
 * The product's display name is a placeholder and WILL change before launch.
 * This file and the i18n strings (through the {{appName}} variable) are the only
 * places it may appear. See docs/DECISIONS.md → "Renaming the product".
 *
 * Never use these values for storage keys, cache names, package names or IDs.
 * Those use the permanent internal codename in `CODENAME`.
 */
export const BRAND = {
  name: 'CurioFeed',
  shortName: 'CurioFeed',
} as const;

/** Permanent internal codename. Renaming it would wipe guest data. Do not change. */
export const CODENAME = 'lumen';
