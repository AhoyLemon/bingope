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

test("the homepage forwards a returning player to their saved card", () => {
  expect(nameEntrySource).toContain("returningCardUrl");
  expect(nameEntrySource).toContain("window.location.replace");
});

test("rendering a card claims it for this browser", () => {
  expect(vueSource).toContain("claimCard(");
});

test("the card page carries the rename affordance and the form escape hatch", () => {
  expect(cardTemplate).toContain("sections/_nameDialog");
  expect(cardTemplate).toContain("card-ticket__edit-name");
  expect(cardTemplate).toContain('href="../?new"');
});
