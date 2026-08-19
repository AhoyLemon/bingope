import { expect, test } from "bun:test";
import fs from "fs";
import path from "path";

const cardStyles = fs.readFileSync(
  path.join(import.meta.dir, "../src/scss/pages/_card.scss"),
  "utf8",
);
const headTemplate = fs.readFileSync(
  path.join(import.meta.dir, "../src/pug/partials/_head.pug"),
  "utf8",
);

test("card shell leaves room for its site shell's bottom padding", () => {
  const cardShell = cardStyles.match(/\.card-shell\s*\{(?<rules>[^}]*)\}/);

  expect(cardShell?.groups?.rules).toContain(
    "var(--card-viewport-height) - var(--card-bottom-inset)",
  );
});

test("card layout follows the browser's visible PWA viewport", () => {
  expect(cardStyles).toContain(
    "--card-viewport-height: var(--viewport-height, 100dvh);",
  );
  expect(cardStyles).toContain("min-height: var(--card-viewport-height);");
  expect(cardStyles).toContain(
    "var(--card-viewport-height) - var(--card-bottom-inset)",
  );
  expect(headTemplate).toContain("window.visualViewport");
  expect(headTemplate).toContain('setProperty("--viewport-height"');
});

test("installed cards reserve room for Android's gesture bar", () => {
  expect(cardStyles).toContain(
    "--card-bottom-inset: max(3rem, env(safe-area-inset-bottom, 0px));",
  );
  expect(cardStyles).toContain("padding-block: 0 var(--card-bottom-inset);");
});
