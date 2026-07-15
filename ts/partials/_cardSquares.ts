/**
 * Resolve the IDs on a dealt card into the display data the card UI needs.
 *
 * The dealer intentionally stores IDs only; this keeps the committed cards
 * stable while square wording can be refined independently.
 */

import { centers, essentials, squares } from "./_squares.js";
import type { BingoSquare } from "./_squares.js";

export interface CardSquare extends BingoSquare {
  /** Concise grid label; the zoom view always uses canonical `text`. */
  label: string;
}

const squaresById = new Map<string, BingoSquare>(
  [...squares, ...centers, ...essentials.flatMap((group) => group.squares)].map(
    (square) => [square.id, square],
  ),
);

/** Resolve card-order IDs into their full square data. */
export function resolveCardSquares(squareIds: string[]): CardSquare[] {
  return squareIds.map((id) => {
    const square = squaresById.get(id);
    if (!square) {
      throw new Error(`resolveCardSquares: unknown square id "${id}".`);
    }

    return {
      ...square,
      label: square.shortText ?? square.text,
    };
  });
}
