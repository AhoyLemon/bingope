/**
 * Homepage name-entry form.
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

const form = document.querySelector<HTMLFormElement>("form.name-entry");
const input = form?.querySelector<HTMLInputElement>('input[name="card"]');

if (form && input) {
  form.addEventListener("submit", (event) => {
    const name = normalizeName(input.value);
    if (!name) return; // whitespace-only; let the field stay put

    event.preventDefault();
    const query = new URLSearchParams({ card: name }).toString();
    window.location.href = `card/?${query}`;
  });
}
