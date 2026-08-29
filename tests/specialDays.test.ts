import { expect, test } from "bun:test";

import { activeSpecialDay, specialDays } from "../src/ts/partials/_specialDays";
import cards from "../src/ts/partials/_cards";

test("activeSpecialDay matches Lemon Day on its exact date", () => {
  const day = activeSpecialDay(new Date(2026, 8, 3));
  expect(day?.name).toBe("lemon-day");
});

test("activeSpecialDay matches Blank Metal Day on its exact date", () => {
  const day = activeSpecialDay(new Date(2026, 8, 1));
  expect(day?.name).toBe("blank-metal");
});

test("activeSpecialDay is undefined on any other day", () => {
  expect(activeSpecialDay(new Date(2026, 8, 2))).toBeUndefined();
  expect(activeSpecialDay(new Date(2026, 7, 29))).toBeUndefined();
});

test("Lemon Day's bespokeSlugs matches the committed roster", () => {
  const lemonDay = specialDays.find((day) => day.name === "lemon-day");
  expect(lemonDay?.bespokeSlugs).toEqual(Object.keys(cards));
});

test("Blank Metal Day has no fixed roster", () => {
  const blankMetal = specialDays.find((day) => day.name === "blank-metal");
  expect(blankMetal?.bespokeSlugs).toBeUndefined();
});
