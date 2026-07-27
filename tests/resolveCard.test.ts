import { expect, test } from "bun:test";

import { resolveCard, GRID_SIZE } from "../src/ts/partials/_deal";

test("an unknown name resolves to a seeded card", () => {
  const resolved = resolveCard("fdsffsdfd");
  expect(resolved).not.toBeNull();
  expect(resolved?.source).toBe("seeded");
  expect(resolved?.squareIds.length).toBe(GRID_SIZE);
});

test("the same name always deals the same seeded card", () => {
  const first = resolveCard("Riley Q");
  const second = resolveCard("  riley   q ");
  expect(first?.squareIds).toEqual(second?.squareIds ?? []);
  expect(first?.slug).toBe(second?.slug ?? "");
});

test("different rando names produce different seeds", () => {
  const a = resolveCard("alpha");
  const b = resolveCard("bravo");
  expect(a?.squareIds).not.toEqual(b?.squareIds);
});

test("blank or missing names still resolve to null", () => {
  expect(resolveCard(null)).toBeNull();
  expect(resolveCard(undefined)).toBeNull();
  expect(resolveCard("")).toBeNull();
  expect(resolveCard("   ")).toBeNull();
});

test("a bespoke name still resolves via the bespoke path", () => {
  const resolved = resolveCard("lemon");
  expect(resolved?.source).toBe("bespoke");
  expect(resolved?.name).toBe("Lemon");
});
