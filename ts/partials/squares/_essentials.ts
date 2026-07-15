/**
 * Essential ("must") groups — the guaranteed-square mechanic from PROJECT.md.
 *
 * Each group carries its own rules (how many per card via `minimum`/`maximum`,
 * and who via `essentialFor`) plus its own squares. Unlike `centers`, essential
 * squares are ordinary dealt cells, just guaranteed to appear, so they live only
 * here and never in the main pool. Deal-time enforcement is dealer work (#4/#12).
 *
 * Crop art is the first group. Its ids are prefixed `CA`. Future groups get their
 * own prefix (e.g. `SD` special dares, `LP` Lemon Party). "Crop Art" is the
 * Minnesota State Fair's official term for the seed-portrait exhibit in the
 * Agriculture Horticulture building ("seed art" is the same thing).
 *
 * The Crop Art group ships empty with `minimum: 0` so the id/min-count test stays
 * green until copy is approved. Once squares land, bump `minimum` to `1`.
 */

import type { EssentialGroup } from "./_types.js";

export const essentials: EssentialGroup[] = [
  {
    groupName: "Crop Art",
    essentialFor: "everybody",
    minimum: 0,
    maximum: 1,
    squares: [],
  },
];
