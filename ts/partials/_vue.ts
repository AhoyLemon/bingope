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
