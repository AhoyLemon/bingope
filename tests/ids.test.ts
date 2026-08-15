import { expect, test } from "bun:test";

import { squares, centers, essentials } from "../src/ts/partials/_squares";

/** Every square from every group: pool, centers, and all essential groups. */
const allSquares = [...squares, ...centers, ...essentials.flatMap((g) => g.squares)];

/**
 * Square IDs namespace saved state, so a collision would let one player's mark
 * leak onto another square. Pool, centers, and essentials all share one id space
 * (distinguished by prefix), so the guard covers them together. Ids are not
 * permanent: they renumber on delete (see _docs/writing-style.md), which makes
 * this uniqueness check load-bearing rather than incidental.
 */
test("every square id is unique across pool, centers, and essentials", () => {
  const ids = allSquares.map((s) => s.id);
  const seen = new Set<string>();
  const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));

  expect(duplicates).toEqual([]);
});

/**
 * Pool ids are kept contiguous (`P1`..`Pn`, matching array order) so deleting a
 * square renumbers rather than leaving a gap. A gap is not a correctness bug on
 * its own, but it means a renumber was done by hand and something downstream
 * (`_cards.ts`, the plan doc) was probably missed.
 */
test("pool ids are contiguous P1..Pn in array order", () => {
  const actual = squares.map((s) => s.id);
  const expected = squares.map((_, i) => `P${i + 1}`);

  expect(actual).toEqual(expected);
});

/**
 * Each essential group's counts must be sane: no negatives, max not below min,
 * and enough squares to satisfy the minimum (a group can't promise more than it
 * holds). `maximum` is a cap, so it may exceed the square count.
 */
test("every essential group has valid minimum/maximum counts", () => {
  for (const group of essentials) {
    expect(Number.isInteger(group.minimum)).toBe(true);
    expect(Number.isInteger(group.maximum)).toBe(true);
    expect(group.minimum).toBeGreaterThanOrEqual(0);
    expect(group.maximum).toBeGreaterThanOrEqual(group.minimum);
    expect(group.squares.length).toBeGreaterThanOrEqual(group.minimum);
  }
});
