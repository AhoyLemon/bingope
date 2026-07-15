import { expect, test } from "bun:test";

import { squares, centers, essentials } from "../ts/partials/_squares";

/** Every square from every group: pool, centers, and all essential groups. */
const allSquares = [...squares, ...centers, ...essentials.flatMap((g) => g.squares)];

/**
 * Square IDs are permanent and namespace saved state, so a collision would let
 * one player's mark leak onto another square. Pool, centers, and essentials all
 * share one id space (distinguished by prefix), so the guard covers them together.
 */
test("every square id is unique across pool, centers, and essentials", () => {
  const ids = allSquares.map((s) => s.id);
  const seen = new Set<string>();
  const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));

  expect(duplicates).toEqual([]);
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
