/**
 * Seeded PRNG for the public path (#12): turn a player's name into a
 * reproducible `rng` for `dealGrid`, so the same name always deals the same
 * card. `hashSeed` reduces an arbitrary string to a 32-bit integer seed;
 * `mulberry32` expands that seed into a 0..1 stream. Paired per the common
 * xmur3 + mulberry32 recipe for small, dependency-free seeded PRNGs.
 */

/** Reduce a string to a 32-bit integer seed (xmur3-style). */
export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** Expand a 32-bit seed into a deterministic 0..1 number stream. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
