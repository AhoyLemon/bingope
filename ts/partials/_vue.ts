/**
 * Vue application setup.
 *
 * The card page (`card/?card=<name>`) resolves its card from the query string
 * at runtime. The homepage mounts the same app but references none of this
 * card state, so it is simply inert there.
 */

// Vue is loaded from the CDN in the HTML.
declare const Vue: any;

import { CENTER_INDEX, resolveCard } from "./_deal.js";
import { markActionText, resolveCardSquares } from "./_cardSquares.js";
import { loadMarks, saveMarks, toggleMark } from "./_marks.js";
import type { CardSquare } from "./_cardSquares.js";
import type { ResolvedCard } from "./_deal.js";
import type { Marks } from "./_marks.js";
import type { SquareType } from "./_squares.js";

const { createApp, nextTick } = Vue;

// The square whose tap opened the dialog — the origin the ticket zooms out of
// (and collapses back into). Kept module-local so it stays out of reactive data.
let markOrigin: HTMLElement | null = null;

const OPEN_MS = 280;
const CLOSE_MS = 230;

function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Transform that maps the centred dialog onto the origin square's rect. */
function originTransform(dialog: HTMLElement): string {
  const fallback = "translateY(1.5rem) scale(0.96)";
  if (!markOrigin) return fallback;

  const d = dialog.getBoundingClientRect();
  const o = markOrigin.getBoundingClientRect();
  if (!d.width || !d.height) return fallback;

  const scale = Math.max(0.08, o.width / d.width);
  const translateX = o.left + o.width / 2 - (d.left + d.width / 2);
  const translateY = o.top + o.height / 2 - (d.top + d.height / 2);

  return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

interface CardAppData {
  resolved: ResolvedCard | null;
  hasCard: boolean;
  cardLabel: string;
  cardSquares: CardSquare[];
  dauberPaths: string[];
  marks: Marks;
  selectedSquare: CardSquare | null;
}

interface CardAppMethods {
  isMarked(squareId: string): boolean;
  modalActionText(type: SquareType, marked: boolean): string;
  squareClasses(
    square: CardSquare,
    squareIndex: number,
  ): Record<string, boolean>;
  openSquare(square: CardSquare, event?: Event): void;
  closeSquare(): void;
  onBackdropClick(event: MouseEvent): void;
  clearSelectedSquare(): void;
  toggleSelectedSquare(): void;
}

interface CardAppInstance extends CardAppData, CardAppMethods {
  $refs: {
    markDialog?: HTMLDialogElement;
  };
}

const rawCard = new URLSearchParams(window.location.search).get("card");
const resolved = resolveCard(rawCard);
const cardSquares = resolved ? resolveCardSquares(resolved.squareIds) : [];
const dauberPaths = [
  "M50 4C69 3 86 15 94 34C102 55 91 79 73 91C54 103 28 98 13 81C-1 64 2 37 16 19C24 9 37 3 50 4Z",
  "M52 5C73 4 90 19 96 39C101 60 89 83 69 93C49 102 24 95 12 76C2 59 5 34 19 18C28 8 41 4 52 5Z",
  "M47 4C67 1 87 13 95 32C104 52 95 76 78 90C61 104 34 101 17 86C1 71-2 45 10 25C18 12 32 6 47 4Z",
  "M54 6C75 6 92 22 96 43C100 64 86 84 66 94C45 102 21 92 10 72C1 54 7 30 23 16C31 9 42 5 54 6Z",
  "M49 3C71 2 89 17 95 37C101 58 90 80 70 92C50 103 25 96 12 78C0 61 3 37 17 20C25 10 37 4 49 3Z",
  "M53 4C72 5 90 18 96 36C103 57 93 80 74 92C55 104 30 99 15 83C0 67 1 42 14 23C23 10 39 3 53 4Z",
];

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const storage = browserStorage();

const cardAppOptions: {
  data: () => CardAppData;
  methods: CardAppMethods;
  mounted: () => void;
} &
  ThisType<CardAppInstance> = {
  data() {
    return {
      resolved,
      hasCard: resolved !== null,
      cardLabel: resolved ? `${resolved.name}'s Card` : "",
      cardSquares,
      dauberPaths,
      marks: resolved && storage ? loadMarks(resolved.slug, storage) : ({} as Marks),
      selectedSquare: null as CardSquare | null,
    };
  },
  methods: {
    isMarked(squareId: string): boolean {
      return Boolean(this.marks[squareId]);
    },
    modalActionText(type: SquareType, marked: boolean): string {
      return markActionText(type, marked);
    },
    squareClasses(
      square: CardSquare,
      squareIndex: number,
    ): Record<string, boolean> {
      const longestWordLength = Math.max(
        ...square.label.split(/\s+/).map((word) => word.length),
      );

      return {
        marked: this.isMarked(square.id),
        "square-center": squareIndex === CENTER_INDEX,
        "task-see": square.type === "see",
        "task-do": square.type === "do",
        "copy-long": square.label.length > 22 || longestWordLength > 8,
        "copy-very-long": square.label.length > 28 || longestWordLength > 12,
      };
    },
    openSquare(square: CardSquare, event?: Event): void {
      markOrigin = (event?.currentTarget as HTMLElement) ?? null;
      this.selectedSquare = square;
      nextTick(() => {
        const dialog = this.$refs.markDialog as HTMLDialogElement | undefined;
        if (!dialog || dialog.open) return;

        dialog.showModal();
        if (prefersReducedMotion()) return;

        // Clear any leftover fill from a prior close animation before opening,
        // or its persisted end-state reasserts once this entry finishes.
        dialog.getAnimations().forEach((animation) => animation.cancel());
        dialog.animate(
          [
            { transform: originTransform(dialog), opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          { duration: OPEN_MS, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)", fill: "backwards" },
        );
      });
    },
    closeSquare(): void {
      const dialog = this.$refs.markDialog as HTMLDialogElement | undefined;
      if (!dialog?.open) {
        this.clearSelectedSquare();
        return;
      }

      if (prefersReducedMotion()) {
        dialog.close();
        return;
      }

      // Zoom the ticket back into the origin square, fade the backdrop, then close.
      dialog.classList.add("is-closing");
      dialog.getAnimations().forEach((animation) => animation.cancel());
      const animation = dialog.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: originTransform(dialog), opacity: 0 },
        ],
        { duration: CLOSE_MS, easing: "cubic-bezier(0.4, 0.05, 0.7, 0.2)", fill: "forwards" },
      );
      animation.onfinish = () => {
        dialog.classList.remove("is-closing");
        dialog.close();
        // Drop the forwards-fill so it can't leak into the next open.
        animation.cancel();
      };
    },
    onBackdropClick(event: MouseEvent): void {
      // A click whose target is the dialog element itself landed on the
      // backdrop (not the ticket) — treat it as a cancel.
      if (event.target === this.$refs.markDialog) this.closeSquare();
    },
    clearSelectedSquare(): void {
      this.selectedSquare = null;
    },
    toggleSelectedSquare(): void {
      if (!this.selectedSquare || !this.resolved) return;

      this.marks = toggleMark(this.marks, this.selectedSquare.id);
      if (storage) saveMarks(this.resolved.slug, this.marks, storage);
      this.closeSquare();
    },
  },
  mounted() {
    document.documentElement.dataset.appReady = "true";
  },
};

const app = createApp(cardAppOptions);

app.mount("#app");

export default app;
