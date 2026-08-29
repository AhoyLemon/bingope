/**
 * Special fair days: a homepage opt-in question that only appears on one
 * specific date. A day with `bespokeSlugs` (Lemon Day) offers a picker among
 * a fixed roster of already-committed bespoke cards — pure navigation, no
 * effect on dealing. A day without one (Blank Metal Day) has no fixed
 * roster, so opting in has to be remembered against whatever name the player
 * types (see `_player.ts`'s `specialGroup` and `_deal.ts`'s `includeOneDay`).
 */

import cards from "./_cards.js";

export interface SpecialDay {
  /** Internal id. Matches `Player.specialGroup` for the opt-in path. */
  name: string;
  /** UI phrase: "Are you part of {label}?" */
  label: string;
  /** Exact "YYYY-MM-DD". These are one-off real dates, not a recurring year. */
  date: string;
  /** Present only when there's a fixed roster to pick from. */
  bespokeSlugs?: string[];
}

export const specialDays: SpecialDay[] = [
  {
    name: "lemon-day",
    label: "Lemon's group",
    date: "2026-09-03",
    bespokeSlugs: Object.keys(cards),
  },
  {
    name: "blank-metal",
    label: "Blank Metal",
    date: "2026-09-01",
  },
];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The special day matching today's local date, if any. */
export function activeSpecialDay(
  date: Date,
  days: SpecialDay[] = specialDays,
): SpecialDay | undefined {
  const key = dateKey(date);
  return days.find((day) => day.date === key);
}
