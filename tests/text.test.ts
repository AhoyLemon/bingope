import { expect, test } from "bun:test";

import { squares, centers, essentials } from "../src/ts/partials/_squares";

/** Every square from every group: pool, centers, and all essential groups. */
const allSquares = [...squares, ...centers, ...essentials.flatMap((g) => g.squares)];

/**
 * `text` is always a complete first-person sentence, so it always ends like one.
 * See _docs/writing-style.md. Guarded because the convention was only normalized
 * after the fact, and a single unpunctuated square reads as a typo next to the
 * rest of the card.
 */
test("every square's text ends with terminal punctuation", () => {
  const offenders = allSquares
    .filter((s) => !/[.!?]$/.test(s.text.trim()))
    .map((s) => `${s.id}: ${s.text}`);

  expect(offenders).toEqual([]);
});

/**
 * `shortText` is the grid label, not a sentence, so it stays bare. `!` and `?`
 * are allowed, since a label can legitimately shout ("A TOILET HORROR!").
 */
test("no shortText ends with a period", () => {
  const offenders = allSquares
    .filter((s) => s.shortText && /\.$/.test(s.shortText.trim()))
    .map((s) => `${s.id}: ${s.shortText}`);

  expect(offenders).toEqual([]);
});

/**
 * Lemon's global writing rules ban em-dashes and semicolons everywhere, and the
 * squares use single quotes internally because the field itself is a
 * double-quoted string.
 */
test("no square uses banned punctuation", () => {
  const banned = /[—–;]/;
  const offenders = allSquares
    .filter((s) => banned.test(s.text) || banned.test(s.shortText ?? ""))
    .map((s) => `${s.id}: ${s.text}`);

  expect(offenders).toEqual([]);
});
