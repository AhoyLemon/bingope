/**
 * The shared card dealer.
 *
 * `dealCard` is a pure, deterministic pick from any pool given an `rng`. The
 * dealer script (#4) calls it with a random `rng` and commits the result; the
 * public path calls it with a name-seeded `rng`. Because it is generic over the
 * pool item, it stays decoupled from the square pool while that content lands
 * separately (#3).
 *
 * `dealGrid` is the square-aware layer built on top: it composes `dealCard` to
 * lay out a full 5x5 card (center + audience-filtered essentials + pool fill) as
 * 25 square IDs in grid order. It is the shared entry point for both deal paths.
 * The dealer script (#4) passes `Math.random`; the seeded public path (#12) will
 * pass a name-seeded PRNG. Only the `rng` differs, so the RNG-consumption order
 * inside `dealGrid` is a compatibility contract: reordering it would change every
 * seeded public card. Do not reorder the draws.
 *
 * `resolveCard` turns a name from the URL into a card. The five special names
 * resolve to committed grids in `_cards.ts`; every other name gets a public
 * seeded grid from the current square pool.
 */

import { shuffle } from "../globals/_functions.js";
import cards from "./_cards.js";
import { centers, essentials, squares } from "./_squares.js";
import type {
  BingoSquare,
  EssentialAudience,
  EssentialGroup,
} from "./squares/_types.js";

export type CardSource = "bespoke" | "seeded";

export interface ResolvedCard {
  /** Normalized name, also the localStorage namespace. */
  slug: string;
  /** Display name. */
  name: string;
  source: CardSource;
  /**
   * 25 dealt square IDs in grid order (row-major 5x5). Index `CENTER_INDEX`
   * (12) is the player-marked center. May be empty until a deal is committed.
   */
  squareIds: string[];
}

/** Total cells on a card (5x5). */
export const GRID_SIZE = 25;

/**
 * Grid-order index of the center cell: row 2, col 2 of a row-major 5x5. The
 * center is the player-marked near-lock, drawn from `centers`, never the pool.
 */
export const CENTER_INDEX = 12;

export interface DealGridInput {
  /** Ordinary-cell pool (the `P` squares). Never contains center/essential squares. */
  pool: BingoSquare[];
  /**
   * Center candidates. The caller pre-filters this to enforce distinctness
   * across cards; `dealGrid` just picks one via `rng`.
   */
  centers: BingoSquare[];
  /** All essential groups; `dealGrid` filters them by `audience`. */
  essentials: EssentialGroup[];
  /**
   * "special" for the five bespoke cards; "unspecial" for the public seeded
   * path (#12). "everybody" groups apply to both, so it is not selectable here.
   */
  audience: Exclude<EssentialAudience, "everybody">;
  /** Injected RNG (0..1). #4 passes `Math.random`; #12 a name-seeded PRNG. */
  rng: () => number;
}

/**
 * Canonicalize a name for special-name matching, seeding, saved-state
 * namespacing, and building a tidy `?card=` URL. Trims, lowercases, and
 * collapses internal whitespace runs so a hand-typed URL and a form submit
 * land on the same value.
 */
export function normalizeName(raw: string): string {
  return cleanDisplayName(raw).toLowerCase();
}

/** Preserve a player's intended casing while making whitespace presentable. */
export function cleanDisplayName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** A compact xmur3-style hash that turns a canonical name into a uint32 seed. */
export function stringToSeed(value: string): number {
  let hash = 1_779_033_703 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3_432_918_353);
    hash = (hash << 13) | (hash >>> 19);
  }

  hash = Math.imul(hash ^ (hash >>> 16), 2_246_822_507);
  hash = Math.imul(hash ^ (hash >>> 13), 3_266_489_909);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/** A tiny seeded PRNG returning the same 0..1 sequence for the same seed. */
export function mulberry32(seed: number): () => number {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
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
 * Lay out a full 5x5 card as 25 square IDs in grid order, with the center at
 * `CENTER_INDEX`. Deterministic: same data + same `rng` sequence yields the same
 * grid.
 *
 * The draw order (center, then essential groups in array order, then the pool
 * fill, then a placement shuffle) is fixed on purpose — it is the compatibility
 * contract the seeded public path (#12) reuses. See the module doc.
 *
 * `pool`, `centers`, and essential squares occupy disjoint id spaces (invariant
 * guarded by `tests/ids.test.ts`), so no cross-group dedup is needed. Audience
 * selection and center distinctness are the caller's job; this only picks from
 * what it is handed.
 */
export function dealGrid(input: DealGridInput): string[] {
  const { pool, centers, essentials, audience, rng } = input;

  if (centers.length === 0) {
    throw new Error("dealGrid: no center candidates to draw from.");
  }
  const center = dealCard(centers, 1, rng)[0];

  const essentialIds: string[] = [];
  for (const group of essentials) {
    if (group.essentialFor !== audience && group.essentialFor !== "everybody") {
      continue;
    }
    if (group.minimum > group.squares.length) {
      throw new Error(
        `dealGrid: essential group "${group.groupName}" needs ${group.minimum} squares but has ${group.squares.length}.`,
      );
    }
    const span = group.maximum - group.minimum + 1;
    const count = group.minimum + Math.floor(rng() * span);
    essentialIds.push(...dealCard(group.squares, count, rng).map((s) => s.id));
  }

  const remaining = GRID_SIZE - 1 - essentialIds.length;
  if (remaining > pool.length) {
    throw new Error(
      `dealGrid: pool has ${pool.length} squares but ${remaining} are needed.`,
    );
  }
  const poolIds = dealCard(pool, remaining, rng).map((s) => s.id);

  const cells = shuffle([...essentialIds, ...poolIds], rng);
  return [
    ...cells.slice(0, CENTER_INDEX),
    center.id,
    ...cells.slice(CENTER_INDEX),
  ];
}

/**
 * Resolve a raw `?card=` value into a card, or `null` when there is nothing to
 * show (no name or a blank name). The five special names use their committed
 * cards; every other name is dealt deterministically from the current pool.
 */
export function resolveCard(
  rawName: string | null | undefined,
): ResolvedCard | null {
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

  return {
    slug,
    name: cleanDisplayName(rawName),
    source: "seeded",
    squareIds: dealGrid({
      pool: squares,
      centers,
      essentials,
      audience: "unspecial",
      rng: mulberry32(stringToSeed(slug)),
    }),
  };
}
