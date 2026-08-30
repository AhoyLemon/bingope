import { expect, test } from "bun:test";

import {
  activeSpecialDay,
  parseDateOverride,
  specialDays,
} from "../src/ts/partials/_specialDays";
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

test("parseDateOverride parses a valid asOf date as local midnight", () => {
  const parsed = parseDateOverride("2026-09-01");
  expect(parsed).not.toBeNull();
  expect(activeSpecialDay(parsed as Date)?.name).toBe("blank-metal");
});

test("parseDateOverride rejects anything missing or malformed", () => {
  expect(parseDateOverride(null)).toBeNull();
  expect(parseDateOverride("")).toBeNull();
  expect(parseDateOverride("not-a-date")).toBeNull();
  expect(parseDateOverride("2026-9-1")).toBeNull();
});
