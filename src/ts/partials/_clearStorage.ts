export const STORAGE_VERSION = "1";
const STORAGE_VERSION_KEY = "bingope:version";

export function clearStorageIfVersionChanged(storage: Storage | null): void {
  if (!storage) return;

  const savedVersion = storage.getItem(STORAGE_VERSION_KEY);
  if (savedVersion !== STORAGE_VERSION) {
    Array.from(new Array(storage.length), (_, i) => storage.key(i))
      .filter((key): key is string => key !== null && key !== undefined && key.startsWith("bingope:"))
      .forEach((key) => storage.removeItem(key));
    storage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
  }
}
