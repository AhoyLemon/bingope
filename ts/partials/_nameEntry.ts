/**
 * Homepage name-entry form.
 *
 * Progressive enhancement: the form works without JS (its native GET action
 * navigates to card/?card=<raw>). With JS, we trim and collapse whitespace
 * before navigation while preserving the player's casing, e.g.
 * "  Buttface McGee  " -> card/?card=Buttface+McGee.
 *
 * Runs on every page via site.ts; it simply does nothing where the form is
 * absent (the card page).
 */

import { cleanDisplayName } from "./_deal.js";

const form = document.querySelector<HTMLFormElement>("form.name-entry");
const input = form?.querySelector<HTMLInputElement>('input[name="card"]');

if (form && input) {
  form.addEventListener("submit", (event) => {
    const name = cleanDisplayName(input.value);
    if (!name) return; // whitespace-only; let the field stay put

    event.preventDefault();
    const query = new URLSearchParams({ card: name }).toString();
    window.location.href = `card/?${query}`;
  });
}
