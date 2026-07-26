import { expect, test } from "bun:test";

import {
  loadMarks,
  marksStorageKey,
  saveMarks,
  toggleMark,
} from "../ts/partials/_marks";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("marking records an ISO timestamp and unmarking removes it", () => {
  const marked = toggleMark({}, "P22", "2026-09-03T14:30:00.000Z");
  expect(marked).toEqual({ P22: { markedAt: "2026-09-03T14:30:00.000Z" } });

  expect(toggleMark(marked, "P22")).toEqual({});
});

test("saved marks are isolated by normalized card namespace", () => {
  const storage = new MemoryStorage();
  const lemonMarks = toggleMark({}, "C3", "2026-09-03T14:30:00.000Z");

  saveMarks("lemon", lemonMarks, storage);

  expect(marksStorageKey("lemon")).not.toBe(marksStorageKey("simone"));
  expect(loadMarks("lemon", storage)).toEqual(lemonMarks);
  expect(loadMarks("simone", storage)).toEqual({});
});

test("malformed saved data falls back without leaking invalid marks", () => {
  const storage = new MemoryStorage();
  storage.setItem(marksStorageKey("lemon"), "not json");
  expect(loadMarks("lemon", storage)).toEqual({});

  storage.setItem(
    marksStorageKey("lemon"),
    JSON.stringify({
      P1: { markedAt: "not a date" },
      P2: { markedAt: "2026-09-03T14:30:00.000Z" },
    }),
  );
  expect(loadMarks("lemon", storage)).toEqual({
    P2: { markedAt: "2026-09-03T14:30:00.000Z" },
  });
});
