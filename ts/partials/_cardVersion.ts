/**
 * Detects when the squares pool has changed since a player last visited, so a
 * squares-pool edit (adding, editing, or removing a square, center, or
 * essential) can invalidate everyone's stale marks and bingos instead of
 * showing marks that no longer line up with what's on screen. The pool, not
 * any one card, is the thing that changes, so there is one shared version for
 * every player rather than a per-card fingerprint.
 */

import { hashSeed } from "./_prng.js";
import type { BingoSquare, EssentialGroup } from "./squares/_types.js";
import type { StorageLike } from "./_marks.js";

const STORAGE_KEY = "bingope:poolVersion";

/** Content hash of the entire squares pool. */
export function poolVersionHash(
  pool: readonly BingoSquare[],
  centers: readonly BingoSquare[],
  essentials: readonly EssentialGroup[],
): string {
  return hashSeed(
    JSON.stringify(pool) + JSON.stringify(centers) + JSON.stringify(essentials),
  ).toString(36);
}

/** True when there is no saved pool version, or it no longer matches. */
export function isStalePoolVersion(
  currentHash: string,
  storage: StorageLike,
): boolean {
  try {
    return storage.getItem(STORAGE_KEY) !== currentHash;
  } catch {
    return false;
  }
}

/** Stamp the current pool hash so future loads can detect drift. */
export function savePoolVersion(currentHash: string, storage: StorageLike): void {
  try {
    storage.setItem(STORAGE_KEY, currentHash);
  } catch {
    // Private browsing or a full quota must not prevent marking this card.
  }
}
