/**
 * The shared card dealer.
 *
 * `dealCard` is a pure, deterministic pick from any pool given an `rng`. The
 * dealer script (#4) calls it with a random `rng` and commits the result; the
 * seeded public path (#12) will call it with a name-seeded `rng`. Because it is
 * generic over the pool item, it stays decoupled from the square pool while
 * that content lands separately (#3).
 *
 * `resolveCard` turns a name from the URL into a card. Right now it only knows
 * the five special names (committed in `_cards.ts`); the seeded fallback for
 * any other name is Milestone 2 (#12).
 */

import { shuffle } from "../globals/_functions.js";
import cards from "./_cards.js";

export type CardSource = "bespoke" | "seeded";

export interface ResolvedCard {
  /** Normalized name, also the localStorage namespace. */
  slug: string;
  /** Display name. */
  name: string;
  source: CardSource;
  /** Dealt square IDs in grid order. May be empty until a deal is committed. */
  squareIds: number[];
}

/**
 * Canonicalize a name for special-name matching, seeding, saved-state
 * namespacing, and building a tidy `?card=` URL. Trims, lowercases, and
 * collapses internal whitespace runs so a hand-typed URL and a form submit
 * land on the same value.
 */
export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Deterministically deal `count` items from `pool` using the supplied `rng`.
 * Same pool + same `rng` sequence always yields the same result.
 */
export function dealCard<T>(
  pool: T[],
  count: number,
  rng: () => number = Math.random,
): T[] {
  return shuffle(pool, rng).slice(0, count);
}

/**
 * Resolve a raw `?card=` value into a card, or `null` when there is nothing to
 * show (no name, blank name, or a non-special name until the seeded path ships).
 */
export function resolveCard(rawName: string | null | undefined): ResolvedCard | null {
  if (!rawName) return null;
  const slug = normalizeName(rawName);
  if (!slug) return null;

  const bespoke = cards[slug];
  if (bespoke) {
    return {
      slug,
      name: bespoke.name,
      source: "bespoke",
      squareIds: bespoke.squareIds,
    };
  }

  // Seeded deal for any other name is Milestone 2 (#12).
  return null;
}
