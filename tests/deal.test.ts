import { expect, test } from "bun:test";

import {
  CENTER_INDEX,
  cleanDisplayName,
  dealGrid,
  GRID_SIZE,
  mulberry32,
  normalizeName,
  resolveCard,
  stringToSeed,
} from "../ts/partials/_deal";
import cards from "../ts/partials/_cards";
import { squares, centers, essentials } from "../ts/partials/_squares";
import type { BingoSquare, EssentialGroup } from "../ts/partials/_squares";

/**
 * A tiny seeded PRNG so tests are deterministic. This stands in for the
 * name-seeded PRNG the public path (#12) will supply; `dealGrid` only needs
 * something returning 0..1.
 */
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

test("name identity is canonical while the ticket preserves entered casing", () => {
  expect(normalizeName("  Harry   Potter  ")).toBe("harry potter");
  expect(cleanDisplayName("  Harry   Potter  ")).toBe("Harry Potter");
});

test("the name seed and PRNG repeat for the same normalized name", () => {
  const seed = stringToSeed("harry potter");

  expect(seed).toBe(stringToSeed("harry potter"));
  expect(seed).not.toBe(stringToSeed("hermione granger"));

  const first = mulberry32(seed);
  const second = mulberry32(seed);
  expect(Array.from({ length: 5 }, () => first())).toEqual(
    Array.from({ length: 5 }, () => second()),
  );
});

test("a non-special name resolves to one deterministic public card", () => {
  const first = resolveCard("  Harry   Potter  ");
  const second = resolveCard("harry potter");

  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(first).toMatchObject({
    slug: "harry potter",
    name: "Harry Potter",
    source: "seeded",
  });
  expect(first?.squareIds).toEqual(second?.squareIds);
  expect(first?.squareIds).toHaveLength(GRID_SIZE);
  expect(new Set(first?.squareIds).size).toBe(GRID_SIZE);
  expect(first?.squareIds.some((id) => id.startsWith("CA"))).toBe(true);
  expect(first?.squareIds.some((id) => id.startsWith("SD"))).toBe(false);
});

test("a special name continues to use its committed bespoke grid", () => {
  expect(resolveCard("LEMON")).toMatchObject({
    slug: "lemon",
    name: "Lemon",
    source: "bespoke",
    squareIds: cards.lemon.squareIds,
  });
});

test("blank names still do not resolve to a card", () => {
  expect(resolveCard(null)).toBeNull();
  expect(resolveCard("   ")).toBeNull();
});
