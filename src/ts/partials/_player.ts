/**
 * The remembered player: which card this browser owns and what the ticket
 * calls them. Claiming is last-viewed-wins — rendering a card makes it this
 * browser's card — and the display name only changes what the ticket shows,
 * never the dealt card or its saved marks.
 */

import type { StorageLike } from "./_marks.js";

export const PLAYER_STORAGE_KEY = "bingope:player";

export interface Player {
  /** Normalized card slug — the same value that seeds the deal and namespaces marks. */
  slug: string;
  /** Optional ticket-header override. Never changes the dealt card or saved marks. */
  displayName?: string;
}

/** localStorage, or null where the browser blocks it (private mode). */
export function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Read the saved player defensively; bad browser data means no player, never a crash. */
export function loadPlayer(storage: StorageLike): Player | null {
  try {
    const raw = storage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return null;

    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== "object" || saved === null || Array.isArray(saved)) {
      return null;
    }

    const { slug, displayName } = saved as {
      slug?: unknown;
      displayName?: unknown;
    };
    if (typeof slug !== "string" || !slug) return null;

    const player: Player = { slug };
    if (typeof displayName === "string" && displayName.trim()) {
      player.displayName = displayName;
    }
    return player;
  } catch {
    return null;
  }
}

/** Persist the player, silently tolerating blocked storage. */
export function savePlayer(player: Player, storage: StorageLike): void {
  try {
    storage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
  } catch {
    // Private browsing or a full quota must not prevent play.
  }
}

/**
 * Claim a card as this browser's player (last-viewed-wins). Re-claiming the
 * same slug keeps a custom displayName; a different slug starts fresh.
 */
export function claimCard(slug: string, storage: StorageLike): Player {
  const existing = loadPlayer(storage);
  const player: Player =
    existing?.slug === slug && existing.displayName
      ? { slug, displayName: existing.displayName }
      : { slug };

  savePlayer(player, storage);
  return player;
}

/** Persist a display-name override for `slug`. Trims; a blank name is a no-op. */
export function saveDisplayName(
  slug: string,
  displayName: string,
  storage: StorageLike,
): Player | null {
  const trimmed = displayName.trim();
  if (!trimmed) return null;

  const player: Player = { slug, displayName: trimmed };
  savePlayer(player, storage);
  return player;
}

/**
 * Where a bare homepage visit should land: the saved card, or null to stay on
 * the form (no saved player, corrupt data, or the ?new escape hatch).
 */
export function returningCardUrl(
  search: string,
  storage: StorageLike,
): string | null {
  if (new URLSearchParams(search).has("new")) return null;

  const player = loadPlayer(storage);
  if (!player) return null;

  return `card/?${new URLSearchParams({ card: player.slug })}`;
}
