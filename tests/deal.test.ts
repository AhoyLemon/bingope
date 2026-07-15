import { expect, test } from "bun:test";

import { dealGrid, GRID_SIZE, CENTER_INDEX } from "../ts/partials/_deal";
import { squares, centers, essentials } from "../ts/partials/_squares";
import type { BingoSquare, EssentialGroup } from "../ts/partials/_squares";

/**
 * A tiny seeded PRNG so tests are deterministic. This stands in for the
 * name-seeded PRNG the public path (#12) will supply; `dealGrid` only needs
 * something returning 0..1.
 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deal(audience: "special" | "unspecial", seed: number): string[] {
  return dealGrid({
    pool: squares,
    centers,
    essentials,
    audience,
    rng: mulberry32(seed),
  });
}

const prefix = (id: string): string => id.replace(/[0-9]+$/, "");

test("same seed yields an identical grid (deterministic)", () => {
  expect(deal("special", 42)).toEqual(deal("special", 42));
});

test("a grid is 25 cells with no duplicate ids", () => {
  const grid = deal("special", 1);
  expect(grid.length).toBe(GRID_SIZE);
  expect(new Set(grid).size).toBe(GRID_SIZE);
});

test("the center sits at CENTER_INDEX and nowhere else", () => {
  const centerIds = new Set(centers.map((c) => c.id));
  const grid = deal("special", 7);
  expect(centerIds.has(grid[CENTER_INDEX])).toBe(true);
  grid.forEach((id, i) => {
    if (i !== CENTER_INDEX) expect(centerIds.has(id)).toBe(false);
  });
});

test("a special card carries exactly one Crop Art and one Special Dare", () => {
  const grid = deal("special", 3);
  const counts = { CA: 0, SD: 0, P: 0 };
  grid.forEach((id, i) => {
    if (i === CENTER_INDEX) return;
    counts[prefix(id) as keyof typeof counts]++;
  });
  expect(counts).toEqual({ CA: 1, SD: 1, P: 22 });
});

test("an unspecial card gets Crop Art but not the special-only dare", () => {
  const grid = deal("unspecial", 9);
  const counts = { CA: 0, SD: 0, P: 0 };
  grid.forEach((id, i) => {
    if (i === CENTER_INDEX) return;
    counts[prefix(id) as keyof typeof counts]++;
  });
  expect(counts).toEqual({ CA: 1, SD: 0, P: 23 });
});

test("dealt essential ids belong to their group", () => {
  const grid = new Set(deal("special", 5));
  for (const group of essentials as EssentialGroup[]) {
    const groupIds = group.squares.map((s) => s.id);
    const dealt = groupIds.filter((id) => grid.has(id));
    expect(dealt.length).toBeGreaterThanOrEqual(group.minimum);
    expect(dealt.length).toBeLessThanOrEqual(group.maximum);
  }
});

test("throws when the pool is too small to fill the grid", () => {
  const tinyPool: BingoSquare[] = squares.slice(0, 3);
  expect(() =>
    dealGrid({
      pool: tinyPool,
      centers,
      essentials,
      audience: "special",
      rng: mulberry32(1),
    }),
  ).toThrow();
});

test("throws when there are no center candidates", () => {
  expect(() =>
    dealGrid({
      pool: squares,
      centers: [],
      essentials,
      audience: "special",
      rng: mulberry32(1),
    }),
  ).toThrow();
});
