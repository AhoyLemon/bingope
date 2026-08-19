/**
 * Center-square candidates for the five bespoke cards (issue #14).
 *
 * The center anchors both diagonals plus a row and a column, so every candidate
 * is a near-lock (`gimme`). The center is player-marked, not auto-marked: it
 * starts unmarked but is markable in seconds, so it hands the player an instant
 * mark plus something funnier than "free space" to recite when calling a bingo.
 * Where the pool rewards sharp specificity, a good center is absurdly universal.
 *
 * Kept in a separate array so centers are never dealt into ordinary cells. Center
 * ids are prefixed `C`. Wiring the deal to place a center lives with the dealer
 * script (#4) and seeded path (#12).
 */

import type { BingoSquare } from "./_types.js";

export const centers: BingoSquare[] = [
  {
    id: "C1",
    text: "I saw a white person.",
    shortText: "A white person",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C2",
    text: "I saw something fried.",
    shortText: "Something fried",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C3",
    text: "I saw food on a stick.",
    shortText: "Food on a stick",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C4",
    text: "I saw Crocs.",
    shortText: "Crocs",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C5",
    text: "I saw Twins merch.",
    shortText: "Twins merch",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C6",
    text: "I saw a flag.",
    shortText: "A flag",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C7",
    text: "I saw corn.",
    shortText: "Corn",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C8",
    text: "I saw trash.",
    shortText: "Trash",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C9",
    text: "I saw something with cheese.",
    shortText: "Something with cheese",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C10",
    text: "I saw daytime drinking.",
    shortText: "Daytime drinking",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C11",
    text: "I saw a line.",
    shortText: "A line",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C12",
    text: "I saw a t-shirt with words on it.",
    shortText: "A t-shirt with words",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C13",
    text: "I saw someone eating while walking.",
    shortText: "Eating while walking",
    difficulty: "gimme",
    type: "see",
  },
  {
    id: "C14",
    text: "I saw a bench.",
    shortText: "A bench",
    difficulty: "gimme",
    type: "see",
  },
];
