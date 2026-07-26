import { expect, test } from "bun:test";

import { markActionText } from "../ts/partials/_cardSquares";

test("modal action text follows the square verb until it is marked", () => {
  expect(markActionText("see", false)).toBe("I saw that");
  expect(markActionText("do", false)).toBe("I did that");
});

test("a marked square always offers the reversible undo action", () => {
  expect(markActionText("see", true)).toBe("Oops, undo that");
  expect(markActionText("do", true)).toBe("Oops, undo that");
});
