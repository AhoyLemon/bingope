import { expect, test } from "bun:test";

import {
  STORAGE_VERSION,
  clearStorageIfVersionChanged,
} from "../src/ts/partials/_clearStorage";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  get length(): number {
    return this.values.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.values.keys());
    return keys[index] ?? null;
  }
}

test("clears all bingope: keys when version changes", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  storage.setItem("bingope:player", '{"slug":"test"}');
  storage.setItem("bingope:marks:test", "{}");
  storage.setItem("bingope:bingos:test", "{}");
  storage.setItem("other:data", "keep this");

  clearStorageIfVersionChanged(storage);

  expect(storage.getItem("bingope:player")).toBe(null);
  expect(storage.getItem("bingope:marks:test")).toBe(null);
  expect(storage.getItem("bingope:bingos:test")).toBe(null);
  expect(storage.getItem("other:data")).toBe("keep this");
});

test("stores the new version after clearing", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  clearStorageIfVersionChanged(storage);

  expect(storage.getItem("bingope:version")).toBe(STORAGE_VERSION);
});

test("does not clear storage when version is unchanged", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  storage.setItem("bingope:version", STORAGE_VERSION);
  storage.setItem("bingope:player", '{"slug":"test"}');

  clearStorageIfVersionChanged(storage);

  expect(storage.getItem("bingope:player")).toBe('{"slug":"test"}');
});

test("handles null storage gracefully", () => {
  expect(() => {
    clearStorageIfVersionChanged(null);
  }).not.toThrow();
});
