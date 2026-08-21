/**
 * Homepage name-entry form.
 *
 * A returning player skips the form entirely: if this browser has a saved
 * card, we forward straight to it (the installed PWA launches at the bare
 * URL, and retyping a name here would deal a different card). `?new` is the
 * deliberate way back to the form.
 *
 * Progressive enhancement: the form works without JS (its native GET action
 * navigates to card/?card=<raw>). With JS, we normalize the typed name first
 * so the resulting URL is tidy and matches what resolveCard expects, e.g.
 * "  Buttface McGee  " -> card/?card=buttface+mcgee.
 *
 * Runs on every page via site.ts; it simply does nothing where the form is
 * absent (the card page).
 */

import { normalizeName } from "./_deal.js";
import { browserStorage, returningCardUrl } from "./_player.js";

const form = document.querySelector<HTMLFormElement>("form.name-entry");
const input = form?.querySelector<HTMLInputElement>('input[name="card"]');
const storage = browserStorage();

const returning =
  form && storage ? returningCardUrl(window.location.search, storage) : null;

if (returning) {
  window.location.replace(returning);
} else if (form && input) {
  form.addEventListener("submit", (event) => {
    const name = normalizeName(input.value);
    if (!name) return; // whitespace-only; let the field stay put

    event.preventDefault();
    const query = new URLSearchParams({ card: name }).toString();
    window.location.href = `card/?${query}`;
  });
}
