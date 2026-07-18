import { expect, test } from "bun:test";

import {
  activeBingoLines,
  bingoCelebrationMessage,
  bingoLineSummary,
  bingoLines,
  bingosStorageKey,
  loadBingos,
  reconcileBingos,
  reconcileSavedBingos,
  saveBingos,
} from "../ts/partials/_bingos";
import type { Marks } from "../ts/partials/_marks";

const cardIds = Array.from({ length: 25 }, (_, index) => `P${index + 1}`);

function marksFor(...indexes: number[]): Marks {
  return Object.fromEntries(
    indexes.map((index) => [
      cardIds[index],
      { markedAt: `2026-09-03T14:${String(index).padStart(2, "0")}:00.000Z` },
    ]),
  );
}

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("detects every row, column, and diagonal as a stable Bingo line", () => {
  for (const line of bingoLines) {
    const result = reconcileBingos(cardIds, marksFor(...line.indexes), {}, "2026-09-03T15:00:00.000Z");
    expect(result.newlyCompleted.map((entry) => entry.id)).toEqual([line.id]);
    expect(result.bingos[line.id]).toEqual({
      completedAt: "2026-09-03T15:00:00.000Z",
    });
  }
});

test("preserves active timestamps, invalidates only broken lines, and timestamps a re-win", () => {
  const first = reconcileBingos(cardIds, marksFor(0, 1, 2, 3, 4, 5, 10, 15, 20), {}, "2026-09-03T15:00:00.000Z");
  expect(Object.keys(first.bingos)).toEqual(["row-1", "column-1"]);

  const broken = reconcileBingos(cardIds, marksFor(0, 1, 2, 3, 5, 10, 15, 20), first.bingos, "2026-09-03T15:10:00.000Z");
  expect(broken.bingos).toEqual({
    "column-1": { completedAt: "2026-09-03T15:00:00.000Z" },
  });

  const rewon = reconcileBingos(cardIds, marksFor(0, 1, 2, 3, 4, 5, 10, 15, 20), broken.bingos, "2026-09-03T15:20:00.000Z");
  expect(rewon.newlyCompleted.map((line) => line.id)).toEqual(["row-1"]);
  expect(rewon.bingos["row-1"]).toEqual({
    completedAt: "2026-09-03T15:20:00.000Z",
  });
  expect(rewon.bingos["column-1"]).toEqual({
    completedAt: "2026-09-03T15:00:00.000Z",
  });
});

test("reports two simultaneous new lines and none for ordinary marks or unmarks", () => {
  const twoLines = reconcileBingos(cardIds, marksFor(0, 1, 2, 3, 4, 5, 10, 15, 20), {}, "2026-09-03T15:00:00.000Z");
  expect(twoLines.newlyCompleted.map((line) => line.id)).toEqual([
    "row-1",
    "column-1",
  ]);

  const ordinary = reconcileBingos(cardIds, marksFor(0, 1), {}, "2026-09-03T15:05:00.000Z");
  expect(ordinary.newlyCompleted).toEqual([]);

  const unmarked = reconcileBingos(cardIds, marksFor(0, 1, 2, 3), twoLines.bingos, "2026-09-03T15:10:00.000Z");
  expect(unmarked.newlyCompleted).toEqual([]);
});

test("derives legacy timestamps from the latest mark and stores only valid known lines", () => {
  const marks = marksFor(0, 1, 2, 3, 4);
  const hydrated = reconcileSavedBingos(cardIds, marks, {});
  expect(hydrated.bingos["row-1"]).toEqual({
    completedAt: "2026-09-03T14:04:00.000Z",
  });

  const storage = new MemoryStorage();
  saveBingos("lemon", hydrated.bingos, storage);
  storage.setItem(
    bingosStorageKey("simone"),
    JSON.stringify({ "row-1": hydrated.bingos["row-1"], invented: { completedAt: "2026-09-03T14:04:00.000Z" } }),
  );

  expect(loadBingos("lemon", storage)).toEqual(hydrated.bingos);
  expect(loadBingos("simone", storage)).toEqual({
    "row-1": hydrated.bingos["row-1"],
  });
});

test("summarizes active wins and varies the congratulations copy", () => {
  const active = [bingoLines[0], bingoLines[1], bingoLines[10]];

  expect(bingoLineSummary(active)).toEqual([
    "2 horizontal lines",
    "1 diagonal line",
  ]);
  expect(bingoCelebrationMessage([bingoLines[0]], [bingoLines[0]], false)).toBe(
    "You got a bingo!",
  );
  expect(bingoCelebrationMessage([bingoLines[1]], active, false)).toBe(
    "You got another bingo!",
  );
  expect(bingoCelebrationMessage([bingoLines[0], bingoLines[5]], active, false)).toBe(
    "You got 2 bingos!",
  );
  expect(bingoCelebrationMessage([bingoLines[0]], active, true)).toBe(
    "You won bingo!",
  );
  expect(activeBingoLines({ "row-1": { completedAt: "2026-09-03T15:00:00.000Z" } })).toEqual([
    bingoLines[0],
  ]);
});
