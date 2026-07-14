import { expect, test } from "bun:test";

import { squares, centers } from "../ts/partials/_squares";

/**
 * Square IDs are permanent and namespace saved state, so a collision would let
 * one player's mark leak onto another square. Centers share the pool's number
 * sequence, so the guard covers both arrays together.
 */
test("every square and center id is unique", () => {
  const ids = [...squares, ...centers].map((s) => s.id);
  const seen = new Set<number>();
  const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));

  expect(duplicates).toEqual([]);
});
