import { expect, test } from "bun:test";

import {
  buildStorageKey,
  synchronizeBuildState,
} from "../ts/partials/_buildState";

class MemoryStorage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
}

test("a first-seen build removes old BINGOPE state but preserves other storage", () => {
  const storage = new MemoryStorage();
  storage.setItem("bingope:marks:harry", "old marks");
  storage.setItem("bingope:bingos:harry", "old bingos");
  storage.setItem("another-project:setting", "keep me");

  expect(synchronizeBuildState(storage, "build-2026-07-18")).toBe(true);
  expect(storage.getItem("bingope:marks:harry")).toBeNull();
  expect(storage.getItem("bingope:bingos:harry")).toBeNull();
  expect(storage.getItem("another-project:setting")).toBe("keep me");
  expect(storage.getItem(buildStorageKey())).toBe("build-2026-07-18");
});

test("the same build leaves saved BINGOPE state alone", () => {
  const storage = new MemoryStorage();
  storage.setItem(buildStorageKey(), "build-2026-07-18");
  storage.setItem("bingope:marks:harry", "current marks");

  expect(synchronizeBuildState(storage, "build-2026-07-18")).toBe(false);
  expect(storage.getItem("bingope:marks:harry")).toBe("current marks");
});

test("a changed build resets every BINGOPE key", () => {
  const storage = new MemoryStorage();
  storage.setItem(buildStorageKey(), "old-build");
  storage.setItem("bingope:marks:harry", "old marks");
  storage.setItem("bingope:bingos:harry", "old bingos");
  storage.setItem("not-bingope:marks:harry", "keep me");

  expect(synchronizeBuildState(storage, "new-build")).toBe(true);
  expect(storage.getItem("bingope:marks:harry")).toBeNull();
  expect(storage.getItem("bingope:bingos:harry")).toBeNull();
  expect(storage.getItem("not-bingope:marks:harry")).toBe("keep me");
  expect(storage.getItem(buildStorageKey())).toBe("new-build");
});

test("unavailable storage does not interrupt startup", () => {
  expect(synchronizeBuildState(null, "build-2026-07-18")).toBe(false);
});
