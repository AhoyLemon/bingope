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
  /** The full homepage question, phrased however fits this day. */
  question: string;
  /** Exact "YYYY-MM-DD". These are one-off real dates, not a recurring year. */
  date: string;
  /** Present only when there's a fixed roster to pick from. */
  bespokeSlugs?: string[];
}

export const specialDays: SpecialDay[] = [
  {
    name: "lemon-day",
    question: "Are you here with Lemon?",
    date: "2026-09-03",
    bespokeSlugs: Object.keys(cards),
  },
  {
    name: "blank-metal",
    question: "Do you work for Blank Metal?",
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

/**
 * Parse a `?asOf=YYYY-MM-DD` debug override into a local-midnight `Date`, for
 * testing a special day without changing the system clock. Returns `null`
 * for anything missing or malformed. Deliberately hand-parsed rather than
 * `new Date(raw)` — a bare ISO date string parses as UTC midnight, which can
 * land on the wrong local day depending on timezone.
 */
export function parseDateOverride(raw: string | null): Date | null {
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
