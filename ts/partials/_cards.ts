/**
 * Committed bespoke cards for the five special players.
 *
 * `squareIds` are the dealt square IDs (drawn from the master pool in
 * `_squares.ts`), written by the dealer script (issue #4, `scripts/deal.ts`).
 * Until a deal is committed a player's `squareIds` may be empty. The keys of
 * this object are the canonical list of special names that `resolveCard()`
 * recognises.
 */

export interface PlayerCard {
  slug: string;
  name: string;
  /** Dealt square IDs in grid order. Written by the dealer script (#4). */
  squareIds: number[];
}

export const cards: Record<string, PlayerCard> = {
  lemon: { slug: "lemon", name: "Lemon", squareIds: [] },
  simone: { slug: "simone", name: "Simone", squareIds: [] },
  angie: { slug: "angie", name: "Angie", squareIds: [] },
  mike: { slug: "mike", name: "Mike", squareIds: [] },
  victor: { slug: "victor", name: "Victor", squareIds: [] },
};

export default cards;
