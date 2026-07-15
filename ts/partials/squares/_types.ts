/**
 * Shared types for the square data.
 *
 * Split out from the data files so the pool, centers, and essentials can each
 * import the shapes without importing each other.
 */

/** How reliably a player will get to mark this square. A dealing hint, tunable. */
export type Rarity = "gimme" | "medium" | "rare";

/** Whether the square is witnessed or performed by the player. */
export type SquareType = "see" | "do";

export interface BingoSquare {
  /**
   * Permanent, globally unique, never reused. Namespaces saved state, so a
   * collision would leak marks between squares. Prefixed by group: `P` pool,
   * `C` centers, `CA` crop art (future essential groups get their own prefix).
   * The number is a unique tag, not an order or a rarity.
   */
  id: string;
  text: string;
  shortText?: string;
  rarity: Rarity;
  type: SquareType;
}

/**
 * Who a guaranteed group applies to.
 * - `everybody`  — every card, bespoke and public seeded.
 * - `special`    — only the five bespoke cards.
 * - `unspecial`  — only public seeded cards (everyone but the five).
 */
export type EssentialAudience = "everybody" | "special" | "unspecial";

/**
 * A guaranteed ("must") group. The deal places between `minimum` and `maximum`
 * of these squares on each applicable card. `minimum`/`maximum` may be 0
 * ("might not happen" / "definitely won't"); neither is negative and
 * `maximum >= minimum`. A group's squares live only here, never in the main
 * pool, so the min/max count is authoritative.
 *
 * Deal-time enforcement is dealer work (#4 dealer script, #12 seeded path). For
 * now this is authoring-time data the deal will later honor.
 */
export interface EssentialGroup {
  groupName: string;
  essentialFor: EssentialAudience;
  minimum: number;
  maximum: number;
  squares: BingoSquare[];
}
