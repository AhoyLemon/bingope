import { expect, test } from "bun:test";
import fs from "fs";
import path from "path";

const cardStyles = fs.readFileSync(
  path.join(import.meta.dir, "../src/scss/pages/_card.scss"),
  "utf8",
);

test("card shell leaves room for its site shell's bottom padding", () => {
  const cardShell = cardStyles.match(/\.card-shell\s*\{(?<rules>[^}]*)\}/);

  expect(cardShell?.groups?.rules).toContain(
    "min-height: calc(100dvh - 0.75rem);",
  );
});
