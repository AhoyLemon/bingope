import { expect, test } from "bun:test";

import {
  isStalePoolVersion,
  poolVersionHash,
  resetStaleCard,
  savePoolVersion,
} from "../ts/partials/_cardVersion";
import { loadMarks, saveMarks } from "../ts/partials/_marks";
import { loadBingos, saveBingos } from "../ts/partials/_bingos";
import type { BingoSquare, EssentialGroup } from "../ts/partials/squares/_types";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const square = (id: string): BingoSquare => ({
  id,
  text: `Square ${id}`,
  rarity: "medium",
  type: "see",
});

const pool: BingoSquare[] = [square("P1"), square("P2")];
const centers: BingoSquare[] = [square("C1")];
const essentials: EssentialGroup[] = [];

test("the same pool always hashes the same", () => {
  expect(poolVersionHash(pool, centers, essentials)).toBe(
    poolVersionHash([...pool], [...centers], [...essentials]),
  );
});

test("adding, editing, or removing a square changes the hash", () => {
  const original = poolVersionHash(pool, centers, essentials);

  const added = poolVersionHash([...pool, square("P3")], centers, essentials);
  const edited = poolVersionHash(
    [{ ...pool[0], text: "Edited" }, pool[1]],
    centers,
    essentials,
  );
  const removed = poolVersionHash([pool[0]], centers, essentials);

  expect(added).not.toBe(original);
  expect(edited).not.toBe(original);
  expect(removed).not.toBe(original);
});

test("a change to centers or essentials also changes the hash", () => {
  const original = poolVersionHash(pool, centers, essentials);
  const newCenters = poolVersionHash(pool, [...centers, square("C2")], essentials);
  const newEssentials = poolVersionHash(pool, centers, [
    { groupName: "Test", essentialFor: "everybody", minimum: 1, maximum: 1, squares: [square("E1")] },
  ]);

  expect(newCenters).not.toBe(original);
  expect(newEssentials).not.toBe(original);
});

test("a fresh visitor with no saved version is treated as stale", () => {
  const storage = new MemoryStorage();
  expect(isStalePoolVersion(poolVersionHash(pool, centers, essentials), storage)).toBe(
    true,
  );
});

test("a matching saved version is not stale", () => {
  const storage = new MemoryStorage();
  const hash = poolVersionHash(pool, centers, essentials);

  savePoolVersion(hash, storage);

  expect(isStalePoolVersion(hash, storage)).toBe(false);
});

test("a pool edit invalidates every saved version", () => {
  const storage = new MemoryStorage();
  savePoolVersion(poolVersionHash(pool, centers, essentials), storage);

  const editedHash = poolVersionHash([...pool, square("P3")], centers, essentials);

  expect(isStalePoolVersion(editedHash, storage)).toBe(true);
});

test("resetStaleCard leaves a matching card's marks and bingos untouched", () => {
  const storage = new MemoryStorage();
  const hash = poolVersionHash(pool, centers, essentials);
  savePoolVersion(hash, storage);
  saveMarks("lemon", { P1: { markedAt: "2026-01-01T00:00:00.000Z" } }, storage);
  saveBingos("lemon", { "row-1": { completedAt: "2026-01-01T00:00:00.000Z" } }, storage);

  const stale = resetStaleCard("lemon", hash, storage);

  expect(stale).toBe(false);
  expect(loadMarks("lemon", storage)).toEqual({
    P1: { markedAt: "2026-01-01T00:00:00.000Z" },
  });
  expect(loadBingos("lemon", storage)).toEqual({
    "row-1": { completedAt: "2026-01-01T00:00:00.000Z" },
  });
});

test("resetStaleCard clears a stale card's marks and bingos from storage, not just in-memory", () => {
  const storage = new MemoryStorage();
  savePoolVersion(poolVersionHash(pool, centers, essentials), storage);
  saveMarks("lemon", { P1: { markedAt: "2026-01-01T00:00:00.000Z" } }, storage);
  saveBingos("lemon", { "row-1": { completedAt: "2026-01-01T00:00:00.000Z" } }, storage);

  const editedHash = poolVersionHash([...pool, square("P3")], centers, essentials);
  const stale = resetStaleCard("lemon", editedHash, storage);

  expect(stale).toBe(true);
  // Marks/bingos must be gone from storage itself, not merely skipped for one
  // render — otherwise a later load could read the pre-invalidation state back.
  expect(loadMarks("lemon", storage)).toEqual({});
  expect(loadBingos("lemon", storage)).toEqual({});
});

test("resetStaleCard always re-stamps the current pool version", () => {
  const storage = new MemoryStorage();
  const editedHash = poolVersionHash([...pool, square("P3")], centers, essentials);

  resetStaleCard("lemon", editedHash, storage);

  expect(isStalePoolVersion(editedHash, storage)).toBe(false);
});
