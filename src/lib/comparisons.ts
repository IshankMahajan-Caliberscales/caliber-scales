export interface Comparison {
  intro?: string;
  columns: string[];
  rows: { feature: string; values: string[] }[];
}

/**
 * Editorial comparison tables, keyed by product slug. Code-managed (rather than
 * per-entry frontmatter) so they stay out of Keystatic and can't be dropped on
 * save. The same comparison is shown on both products it compares.
 *
 * Content here describes general, well-established differences between product
 * *types* — not fabricated specifications for a specific model.
 */
const PITLESS_VS_PITMOUNTED: Comparison = {
  intro: 'How the two most common weighbridge designs compare at a glance.',
  columns: ['Surface mounted', 'Pit type'],
  rows: [
    { feature: 'Installation', values: ['Above ground on ramps — no excavation', 'Set flush into an excavated pit'] },
    { feature: 'Civil work', values: ['Lower — raised foundation only', 'Higher — pit excavation + drainage'] },
    { feature: 'Yard space', values: ['Needs approach ramps', 'Saves space; level approach from any side'] },
    { feature: 'Maintenance access', values: ['Open underside — easy to clean & service', 'Access within the pit'] },
    { feature: 'Drainage / groundwater', values: ['Well suited to high-water sites', 'Needs good drainage design'] },
    { feature: 'Typical lead time', values: ['Faster to install', 'Longer (civil work)'] },
  ],
};

export const COMPARISONS: Record<string, Comparison> = {
  'surface-mounted': PITLESS_VS_PITMOUNTED,
  'pit-type': PITLESS_VS_PITMOUNTED,
};
