/** Build-scoped browser storage reset for BINGOPE-owned state only. */

export const BINGOPE_STORAGE_PREFIX = "bingope:";

export interface BuildStorage {
  readonly length: number;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
}

export function buildStorageKey(): string {
  return `${BINGOPE_STORAGE_PREFIX}build`;
}

/** Read the single build ID emitted into every page by the Pug build. */
export function currentBuildId(documentRoot: Document = document): string | null {
  return documentRoot
    .querySelector('meta[name="bingope-build"]')
    ?.getAttribute("content") || null;
}

/**
 * Forget BINGOPE state when this page belongs to a different deployed build.
 * Other projects share the GitHub Pages origin, so no non-BINGOPE key is touched.
 */
export function synchronizeBuildState(
  storage: BuildStorage | null,
  buildId: string | null | undefined,
): boolean {
  if (!storage || !buildId) return false;

  try {
    if (storage.getItem(buildStorageKey()) === buildId) return false;

    const bingoKeys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(BINGOPE_STORAGE_PREFIX)) bingoKeys.push(key);
    }

    bingoKeys.forEach((key) => storage.removeItem(key));
    storage.setItem(buildStorageKey(), buildId);
    return true;
  } catch {
    // Browser privacy settings must not stop an otherwise playable card.
    return false;
  }
}
