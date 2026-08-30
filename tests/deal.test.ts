import { expect, test } from "bun:test";

import { dealGrid, GRID_SIZE, CENTER_INDEX } from "../src/ts/partials/_deal";
import { mulberry32 } from "../src/ts/partials/_prng";
import { squares, centers, essentials } from "../src/ts/partials/_squares";
import type { BingoSquare, EssentialGroup } from "../src/ts/partials/_squares";

function deal(
  audience: "special" | "unspecial",
  seed: number,
  includeOneDay = false,
): string[] {
  return dealGrid({
    pool: squares,
    centers,
    essentials,
    audience,
    includeOneDay,
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
  const counts = { CA: 0, SD: 0, P: 0, _M: 0 };
  grid.forEach((id, i) => {
    if (i === CENTER_INDEX) return;
    counts[prefix(id) as keyof typeof counts]++;
  });
  expect(counts).toEqual({ CA: 1, SD: 0, P: 23, _M: 0 });
});

test("includeOneDay deals exactly one Blank Metal square, otherwise none", () => {
  const withOneDay = deal("unspecial", 11, true);
  const without = deal("unspecial", 11, false);
  const countOf = (grid: string[], p: string) =>
    grid.filter((id, i) => i !== CENTER_INDEX && prefix(id) === p).length;

  expect(countOf(withOneDay, "_M")).toBe(1);
  expect(countOf(without, "_M")).toBe(0);
});

test("dealt essential ids belong to their applicable group", () => {
  const audience = "special";
  const includeOneDay = false;
  const grid = new Set(deal(audience, 5, includeOneDay));
  for (const group of essentials as EssentialGroup[]) {
    const applies =
      group.essentialFor === audience ||
      group.essentialFor === "everybody" ||
      (group.essentialFor === "one day" && includeOneDay);
    if (!applies) continue;

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
