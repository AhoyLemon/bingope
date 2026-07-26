/**
 * Square data barrel.
 *
 * The data is split by group under `squares/` (`_pool`, `_centers`,
 * `_essentials`) with shared shapes in `_types`. This file re-exports all of it
 * so consumers keep importing from one place. See WRITING_STYLE.md for authoring
 * rules. IDs are permanent, group-prefixed, and never reused.
 */

export type {
  BingoSquare,
  Rarity,
  SquareType,
  EssentialAudience,
  EssentialGroup,
} from "./squares/_types.js";

export { squares } from "./squares/_pool.js";
export { centers } from "./squares/_centers.js";
export { essentials } from "./squares/_essentials.js";
