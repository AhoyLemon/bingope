import { expect, test } from "bun:test";
import fs from "fs";
import path from "path";

const nameEntrySource = fs.readFileSync(
  path.join(import.meta.dir, "../src/ts/partials/_nameEntry.ts"),
  "utf8",
);
const vueSource = fs.readFileSync(
  path.join(import.meta.dir, "../src/ts/partials/_vue.ts"),
  "utf8",
);
const cardTemplate = fs.readFileSync(
  path.join(import.meta.dir, "../src/pug/card.pug"),
  "utf8",
);
const nameDialogTemplate = fs.readFileSync(
  path.join(import.meta.dir, "../src/pug/sections/_nameDialog.pug"),
  "utf8",
);

test("the homepage forwards a returning player to their saved card", () => {
  expect(nameEntrySource).toContain("returningCardUrl");
  expect(nameEntrySource).toContain("window.location.replace");
});

test("rendering a card claims it for this browser", () => {
  expect(vueSource).toContain("claimCard(");
});

test("the ticket name opens the dialog, and the escape hatch reaches the form", () => {
  expect(cardTemplate).toContain("sections/_nameDialog");
  expect(cardTemplate).toContain('@click="openNameDialog"');
  expect(cardTemplate).toContain('href="../?new"');
});

test("the ticket dialog can deal a fresh card for a fresh day", () => {
  expect(nameDialogTemplate).toContain('@click="dealNewCard"');
  expect(vueSource).toContain("dealNewCard(");
});
