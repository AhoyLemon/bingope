/**
 * Vue application setup.
 *
 * The card page (`card/?card=<name>`) resolves its card from the query string
 * at runtime. The homepage mounts the same app but references none of this
 * card state, so it is simply inert there.
 */

// Vue is loaded from the CDN in the HTML.
declare const Vue: any;

import { resolveCard } from "./_deal.js";
import { resolveCardSquares } from "./_cardSquares.js";
import { loadMarks, saveMarks, toggleMark } from "./_marks.js";
import type { CardSquare } from "./_cardSquares.js";
import type { ResolvedCard } from "./_deal.js";
import type { Marks } from "./_marks.js";

const { createApp, nextTick } = Vue;

interface CardAppData {
  resolved: ResolvedCard | null;
  hasCard: boolean;
  displayName: string;
  cardSquares: CardSquare[];
  marks: Marks;
  selectedSquare: CardSquare | null;
}

interface CardAppMethods {
  isMarked(squareId: string): boolean;
  squareClasses(square: CardSquare): Record<string, boolean>;
  openSquare(square: CardSquare): void;
  closeSquare(): void;
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
      displayName: resolved ? resolved.name : "",
      cardSquares,
      marks: resolved && storage ? loadMarks(resolved.slug, storage) : ({} as Marks),
      selectedSquare: null as CardSquare | null,
    };
  },
  methods: {
    isMarked(squareId: string): boolean {
      return Boolean(this.marks[squareId]);
    },
    squareClasses(square: CardSquare): Record<string, boolean> {
      const longestWordLength = Math.max(
        ...square.label.split(/\s+/).map((word) => word.length),
      );

      return {
        marked: this.isMarked(square.id),
        "copy-long": square.label.length > 22 || longestWordLength > 8,
        "copy-very-long": square.label.length > 28 || longestWordLength > 12,
      };
    },
    openSquare(square: CardSquare): void {
      this.selectedSquare = square;
      nextTick(() => {
        const dialog = this.$refs.markDialog as HTMLDialogElement | undefined;
        if (dialog && !dialog.open) dialog.showModal();
      });
    },
    closeSquare(): void {
      const dialog = this.$refs.markDialog as HTMLDialogElement | undefined;
      if (dialog?.open) {
        dialog.close();
      } else {
        this.clearSelectedSquare();
      }
    },
    clearSelectedSquare(): void {
      this.selectedSquare = null;
    },
    toggleSelectedSquare(): void {
      if (!this.selectedSquare || !this.resolved) return;

      this.marks = toggleMark(this.marks, this.selectedSquare.id);
      if (storage) saveMarks(this.resolved.slug, this.marks, storage);
    },
  },
  mounted() {
    document.documentElement.dataset.appReady = "true";
  },
};

const app = createApp(cardAppOptions);

app.mount("#app");

export default app;
