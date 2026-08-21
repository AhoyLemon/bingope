import { expect, test } from "bun:test";

import {
  PLAYER_STORAGE_KEY,
  claimCard,
  loadPlayer,
  returningCardUrl,
  saveDisplayName,
} from "../src/ts/partials/_player";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class ThrowingStorage {
  getItem(): string | null {
    throw new Error("storage blocked");
  }

  setItem(): void {
    throw new Error("storage blocked");
  }
}

test("claiming a card remembers it as this browser's player", () => {
  const storage = new MemoryStorage();

  expect(loadPlayer(storage)).toBeNull();
  expect(claimCard("lemon", storage)).toEqual({ slug: "lemon" });
  expect(loadPlayer(storage)).toEqual({ slug: "lemon" });
});

test("re-claiming the same slug preserves a custom display name", () => {
  const storage = new MemoryStorage();
  claimCard("lemon", storage);
  saveDisplayName("lemon", "Lemon the Magnificent", storage);

  claimCard("lemon", storage);

  expect(loadPlayer(storage)).toEqual({
    slug: "lemon",
    displayName: "Lemon the Magnificent",
  });
});

test("claiming a different slug drops the old display name", () => {
  const storage = new MemoryStorage();
  claimCard("lemon", storage);
  saveDisplayName("lemon", "Lemon the Magnificent", storage);

  claimCard("simone", storage);

  expect(loadPlayer(storage)).toEqual({ slug: "simone" });
});

test("saveDisplayName trims and round-trips through loadPlayer", () => {
  const storage = new MemoryStorage();
  claimCard("lemon", storage);

  saveDisplayName("lemon", "  Lemon 🌽  ", storage);

  expect(loadPlayer(storage)).toEqual({
    slug: "lemon",
    displayName: "Lemon 🌽",
  });
});

test("a blank display name is a no-op", () => {
  const storage = new MemoryStorage();
  claimCard("lemon", storage);
  saveDisplayName("lemon", "Lemon the Magnificent", storage);

  expect(saveDisplayName("lemon", "   ", storage)).toBeNull();

  expect(loadPlayer(storage)).toEqual({
    slug: "lemon",
    displayName: "Lemon the Magnificent",
  });
});

test("malformed saved data means no player, never a crash", () => {
  const badValues = [
    "not json",
    "[]",
    "{}",
    JSON.stringify({ slug: 5 }),
    JSON.stringify({ slug: "" }),
  ];

  for (const bad of badValues) {
    const storage = new MemoryStorage();
    storage.setItem(PLAYER_STORAGE_KEY, bad);
    expect(loadPlayer(storage)).toBeNull();
  }
});

test("a blank saved display name is dropped on load", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    PLAYER_STORAGE_KEY,
    JSON.stringify({ slug: "lemon", displayName: "   " }),
  );

  expect(loadPlayer(storage)).toEqual({ slug: "lemon" });
});

test("storage that throws never breaks play", () => {
  const storage = new ThrowingStorage();

  expect(loadPlayer(storage)).toBeNull();
  expect(claimCard("lemon", storage)).toEqual({ slug: "lemon" });
  expect(saveDisplayName("lemon", "Lemon", storage)).toEqual({
    slug: "lemon",
    displayName: "Lemon",
  });
  expect(returningCardUrl("", storage)).toBeNull();
});

test("returningCardUrl matches the name form's URL shape", () => {
  const storage = new MemoryStorage();
  claimCard("buttface mcgee", storage);

  expect(returningCardUrl("", storage)).toBe("card/?card=buttface+mcgee");
});

test("returningCardUrl honors the ?new escape hatch", () => {
  const storage = new MemoryStorage();
  claimCard("lemon", storage);

  expect(returningCardUrl("?new", storage)).toBeNull();
  expect(returningCardUrl("?new=1", storage)).toBeNull();
  expect(returningCardUrl("?utm_source=qr&new", storage)).toBeNull();
  expect(returningCardUrl("?utm_source=qr", storage)).toBe("card/?card=lemon");
});

test("returningCardUrl stays on the form without a saved player", () => {
  const empty = new MemoryStorage();
  expect(returningCardUrl("", empty)).toBeNull();

  const corrupt = new MemoryStorage();
  corrupt.setItem(PLAYER_STORAGE_KEY, "not json");
  expect(returningCardUrl("", corrupt)).toBeNull();
});
