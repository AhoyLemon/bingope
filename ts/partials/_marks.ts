/** Browser-local mark state for one resolved bingo card. */

export interface Mark {
  markedAt: string;
}

export type Marks = Record<string, Mark>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Each normalized card name owns a map keyed by permanent square IDs. */
export function marksStorageKey(cardSlug: string): string {
  return `bingope:marks:${cardSlug}`;
}

function isMark(value: unknown): value is Mark {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const markedAt = (value as { markedAt?: unknown }).markedAt;
  return typeof markedAt === "string" && !Number.isNaN(Date.parse(markedAt));
}

/** Read saved state defensively; bad browser data should never break a card. */
export function loadMarks(cardSlug: string, storage: StorageLike): Marks {
  try {
    const raw = storage.getItem(marksStorageKey(cardSlug));
    if (!raw) return {};

    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== "object" || saved === null || Array.isArray(saved)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved).filter(([, value]) => isMark(value)),
    ) as Marks;
  } catch {
    return {};
  }
}

/** Save the current card state, silently preserving play when storage is blocked. */
export function saveMarks(
  cardSlug: string,
  marks: Marks,
  storage: StorageLike,
): void {
  try {
    storage.setItem(marksStorageKey(cardSlug), JSON.stringify(marks));
  } catch {
    // Private browsing or a full quota must not prevent marking this card.
  }
}

/** Return the next state: add a timestamped mark, or remove the existing mark. */
export function toggleMark(
  marks: Marks,
  squareId: string,
  markedAt: string = new Date().toISOString(),
): Marks {
  const next = { ...marks };

  if (next[squareId]) {
    delete next[squareId];
  } else {
    next[squareId] = { markedAt };
  }

  return next;
}
