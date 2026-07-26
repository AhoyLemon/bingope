/** Current-state Bingo detection and persistence for one 5×5 card. */

import type { Marks, StorageLike } from "./_marks.js";

export type BingoLineDirection = "horizontal" | "vertical" | "diagonal";

export interface BingoLine {
  /** Stable storage and SVG identity; never expose grid order as an API. */
  id: string;
  direction: BingoLineDirection;
  /** Row-major card indexes, ordered from the line's visual start to end. */
  indexes: readonly number[];
}

export interface Bingo {
  completedAt: string;
}

export type Bingos = Record<string, Bingo>;

export interface ReconciledBingos {
  bingos: Bingos;
  newlyCompleted: BingoLine[];
}

const rows: BingoLine[] = Array.from({ length: 5 }, (_, row) => ({
  id: `row-${row + 1}`,
  direction: "horizontal",
  indexes: Array.from({ length: 5 }, (_, column) => row * 5 + column),
}));

const columns: BingoLine[] = Array.from({ length: 5 }, (_, column) => ({
  id: `column-${column + 1}`,
  direction: "vertical",
  indexes: Array.from({ length: 5 }, (_, row) => row * 5 + column),
}));

/** Every line a 5×5 bingo board can award, in reveal order. */
export const bingoLines: readonly BingoLine[] = [
  ...rows,
  ...columns,
  { id: "diagonal-down", direction: "diagonal", indexes: [0, 6, 12, 18, 24] },
  { id: "diagonal-up", direction: "diagonal", indexes: [4, 8, 12, 16, 20] },
];

const bingoLineIds = new Set(bingoLines.map((line) => line.id));

/** Per-card current-state storage; mark history continues to live separately. */
export function bingosStorageKey(cardSlug: string): string {
  return `bingope:bingos:${cardSlug}`;
}

function isBingo(value: unknown): value is Bingo {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const completedAt = (value as { completedAt?: unknown }).completedAt;
  return typeof completedAt === "string" && !Number.isNaN(Date.parse(completedAt));
}

/** Read only known, timestamped line records; malformed browser data is ignored. */
export function loadBingos(cardSlug: string, storage: StorageLike): Bingos {
  try {
    const raw = storage.getItem(bingosStorageKey(cardSlug));
    if (!raw) return {};

    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== "object" || saved === null || Array.isArray(saved)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved).filter(
        ([lineId, value]) => bingoLineIds.has(lineId) && isBingo(value),
      ),
    ) as Bingos;
  } catch {
    return {};
  }
}

/** Save the active lines without letting unavailable browser storage interrupt play. */
export function saveBingos(
  cardSlug: string,
  bingos: Bingos,
  storage: StorageLike,
): void {
  try {
    storage.setItem(bingosStorageKey(cardSlug), JSON.stringify(bingos));
  } catch {
    // Private browsing or a full quota must not prevent marking this card.
  }
}

/** Resolve one line's stable square IDs from a card dealt in row-major order. */
export function lineSquareIds(
  line: BingoLine,
  squareIds: readonly string[],
): string[] {
  return line.indexes.map((index) => squareIds[index]).filter(Boolean);
}

function latestMarkedAt(squareIds: readonly string[], marks: Marks): string {
  return squareIds.reduce((latest, squareId) => {
    const markedAt = marks[squareId]?.markedAt;
    return markedAt && markedAt > latest ? markedAt : latest;
  }, "");
}

/**
 * Reconcile stored active lines with the card's current marks.
 *
 * `completedAt` is used only for a newly completed line. Passing a function
 * lets startup derive historic wins from the latest mark that made them true.
 */
export function reconcileBingos(
  squareIds: readonly string[],
  marks: Marks,
  previous: Bingos,
  completedAt: string | ((lineSquareIds: readonly string[]) => string) = new Date().toISOString(),
): ReconciledBingos {
  const bingos: Bingos = {};
  const newlyCompleted: BingoLine[] = [];

  for (const line of bingoLines) {
    const ids = lineSquareIds(line, squareIds);
    const complete = ids.length === line.indexes.length && ids.every((id) => marks[id]);
    if (!complete) continue;

    const existing = previous[line.id];
    if (existing) {
      bingos[line.id] = existing;
      continue;
    }

    bingos[line.id] = {
      completedAt:
        typeof completedAt === "function" ? completedAt(ids) : completedAt,
    };
    newlyCompleted.push(line);
  }

  return { bingos, newlyCompleted };
}

/** Derive legacy Bingo timestamps from the last mark required by each line. */
export function reconcileSavedBingos(
  squareIds: readonly string[],
  marks: Marks,
  previous: Bingos,
): ReconciledBingos {
  return reconcileBingos(squareIds, marks, previous, (ids) =>
    latestMarkedAt(ids, marks),
  );
}

/** Return active lines in the same stable order used for drawing them. */
export function activeBingoLines(bingos: Bingos): BingoLine[] {
  return bingoLines.filter((line) => bingos[line.id]);
}

/** Give a win its correct voice based on the card's current state. */
export function bingoCelebrationMessage(
  newlyCompleted: readonly BingoLine[],
  activeLines: readonly BingoLine[],
  blackout: boolean,
): string {
  if (blackout) return "You won bingo!";
  if (newlyCompleted.length > 1) {
    return `You got ${newlyCompleted.length} bingos!`;
  }
  if (activeLines.length > 1) return "You got another bingo!";

  return "You got a bingo!";
}

/** Group active wins into compact, human-readable congratulations copy. */
export function bingoLineSummary(lines: readonly BingoLine[]): string[] {
  const counts: Record<BingoLineDirection, number> = {
    horizontal: 0,
    vertical: 0,
    diagonal: 0,
  };

  for (const line of lines) counts[line.direction] += 1;

  return (Object.entries(counts) as [BingoLineDirection, number][])
    .filter(([, count]) => count > 0)
    .map(([direction, count]) =>
      `${count} ${direction} line${count === 1 ? "" : "s"}`,
    );
}
