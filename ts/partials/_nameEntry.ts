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
const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]');

if (form && input && button) {
  // Starts disabled only once JS confirms it can re-enable the button; a
  // no-JS visitor keeps a normal, always-enabled button backed by `required`.
  button.disabled = input.value.trim().length === 0;

  input.addEventListener("input", () => {
    button.disabled = input.value.trim().length === 0;
  });

  form.addEventListener("submit", (event) => {
    const name = normalizeName(input.value);
    if (!name) return; // whitespace-only; let the field stay put

    event.preventDefault();
    const query = new URLSearchParams({ card: name }).toString();
    window.location.href = `card/?${query}`;
  });
}
