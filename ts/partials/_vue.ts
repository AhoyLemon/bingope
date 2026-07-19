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
import { currentBuildId, synchronizeBuildState } from "./_buildState.js";
import {
  activeBingoLines,
  bingoCelebrationMessage,
  bingoLines,
  loadBingos,
  reconcileBingos,
  reconcileSavedBingos,
  saveBingos,
} from "./_bingos.js";
import { markActionText, resolveCardSquares } from "./_cardSquares.js";
import { loadMarks, saveMarks, toggleMark } from "./_marks.js";
import type { BingoLine, Bingos } from "./_bingos.js";
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
// Beat between the modal fully leaving and the mark landing on the board.
const MARK_DELAY_MS = 300;
// How long the stamp-slap plays before the one-shot `just-stamped` class drops.
const STAMP_MS = 320;
const BINGO_CHECK_MS = 300;
const BINGO_LINE_MS = 1_500;
const BINGO_LINE_GAP_MS = 180;
const FAIR_STAR_MAX = 80;
// 35% calmer than the lively stream: still festive, with breathing room.
const FAIR_STAR_MIN_DELAY_MS = 280;
const FAIR_STAR_MAX_DELAY_MS = 620;
const FAIR_STAR_COLORS = [
  "#dd3843",
  "#e0aa22",
  "#21a8eb",
  "#247c42",
  "#30266d",
  "#c76f2d",
  "#a52c43",
];
// Guards a double-tap from re-triggering the mark while the modal is exiting.
let dismissing = false;
let fairStarId = 0;
let fairStarTimer: number | null = null;

interface FairBurstPiece {
  id: number;
  expiresAt: number;
  sourceX: string;
  sourceY: string;
  flightX: string;
  flightY: string;
  curveX: string;
  curveY: string;
  approachX: string;
  approachY: string;
  startRotation: number;
  curveRotation: number;
  approachRotation: number;
  landingRotation: number;
  size: string;
  color: string;
  duration: string;
  landingScale: string;
}

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
  bingos: Bingos;
  bingoLines: readonly BingoLine[];
  selectedSquare: CardSquare | null;
  justStamped: string | null;
  pendingBingoLineIds: string[];
  revealingBingoLineIds: string[];
  celebrating: boolean;
  celebrationVisible: boolean;
  celebrationMessage: string;
  bingoAnnouncement: string;
  fairBurst: FairBurstPiece[];
}

interface CardAppMethods {
  isMarked(squareId: string): boolean;
  modalActionText(type: SquareType, marked: boolean): string;
  squareClasses(
    square: CardSquare,
    squareIndex: number,
  ): Record<string, boolean>;
  bingoLinePath(line: BingoLine): string;
  bingoLineClasses(line: BingoLine): Record<string, boolean>;
  openSquare(square: CardSquare, event?: Event): void;
  closeSquare(afterClose?: () => void): void;
  onBackdropClick(event: MouseEvent): void;
  clearSelectedSquare(): void;
  toggleSelectedSquare(): void;
  playBingoReveal(lines: BingoLine[]): void;
  prepareCelebration(lines: BingoLine[]): void;
  fairStarStyle(piece: FairBurstPiece): Record<string, string>;
  startFairBurst(): void;
  stopFairBurst(): void;
  dismissCelebration(): void;
}

interface CardAppInstance extends CardAppData, CardAppMethods {
  $refs: {
    markDialog?: HTMLDialogElement;
    bingoGrid?: HTMLElement;
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
if (storage) synchronizeBuildState(storage, currentBuildId());

function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function randomBetween(minimum: number, maximum: number): number {
  return minimum + Math.random() * (maximum - minimum);
}

function round(value: number): string {
  return value.toFixed(2);
}

/** One star's improvised toss and landing spot on the card. */
function fairStar(grid: DOMRect): FairBurstPiece {
  const durationMs = randomBetween(13_000, 20_000);
  // The thrower lives just beyond the card's lower-right corner. Each toss
  // receives a different landing point, force (distance), and sideways curl.
  const sourceX = grid.width * randomBetween(1.03, 1.15);
  const sourceY = grid.height * randomBetween(1.03, 1.12);
  const landingX = grid.width * randomBetween(0.07, 0.93);
  const landingY = grid.height * randomBetween(0.07, 0.93);
  const flightX = landingX - sourceX;
  const flightY = landingY - sourceY;
  const arcHeight = randomBetween(grid.height * 0.32, grid.height * 0.62);
  const sidewaysCurl = randomBetween(-grid.width * 0.2, grid.width * 0.2);
  const controlX = flightX * randomBetween(0.18, 0.38) + sidewaysCurl;
  const controlY = flightY * randomBetween(0.16, 0.32) - arcHeight;
  const pointOnArc = (progress: number) => ({
    x: 2 * (1 - progress) * progress * controlX + progress ** 2 * flightX,
    y: 2 * (1 - progress) * progress * controlY + progress ** 2 * flightY,
  });
  const curve = pointOnArc(0.33);
  const approach = pointOnArc(0.72);

  return {
    id: fairStarId += 1,
    expiresAt: Date.now() + durationMs,
    sourceX: `${round(sourceX)}px`,
    sourceY: `${round(sourceY)}px`,
    flightX: `${round(flightX)}px`,
    flightY: `${round(flightY)}px`,
    curveX: `${round(curve.x)}px`,
    curveY: `${round(curve.y)}px`,
    approachX: `${round(approach.x)}px`,
    approachY: `${round(approach.y)}px`,
    startRotation: Math.round(randomBetween(-230, 230)),
    curveRotation: Math.round(randomBetween(-120, 120)),
    approachRotation: Math.round(randomBetween(-70, 70)),
    landingRotation: Math.round(randomBetween(-38, 38)),
    size: `${round(randomBetween(1.5, 2.13))}rem`,
    color: FAIR_STAR_COLORS[Math.floor(Math.random() * FAIR_STAR_COLORS.length)],
    duration: `${Math.round(durationMs)}ms`,
    landingScale: round(randomBetween(0.8, 1.18)),
  };
}

/** A deterministic, gently imperfect Sharpie path through a line's cell centres. */
function sharpiePath(line: BingoLine): string {
  const points = line.indexes.map((index) => ({
    x: (index % 5) * 100 + 50,
    y: Math.floor(index / 5) * 100 + 50,
  }));
  const start = points[0];
  const end = points[points.length - 1];
  const distance = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const normal = {
    x: -(end.y - start.y) / distance,
    y: (end.x - start.x) / distance,
  };
  const seed = [...line.id].reduce((total, character) => total + character.charCodeAt(0), 0);
  // Slight enough to feel hand-drawn, not so much that it reads as a doodle.
  const wobble = (step: number) => ((seed + step * 7) % 11 - 5) * 0.45;
  let path = `M ${start.x + normal.x * wobble(0)} ${start.y + normal.y * wobble(0)}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    const controlWobble = wobble(index * 2 - 1) * 1.1;
    const endWobble = wobble(index * 2);
    path += ` Q ${(previous.x + point.x) / 2 + normal.x * controlWobble} ${(previous.y + point.y) / 2 + normal.y * controlWobble} ${point.x + normal.x * endWobble} ${point.y + normal.y * endWobble}`;
  }

  return path;
}

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
      bingos: resolved && storage ? loadBingos(resolved.slug, storage) : ({} as Bingos),
      bingoLines,
      selectedSquare: null as CardSquare | null,
      justStamped: null as string | null,
      pendingBingoLineIds: [],
      revealingBingoLineIds: [],
      celebrating: false,
      celebrationVisible: false,
      celebrationMessage: "",
      bingoAnnouncement: "",
      fairBurst: [],
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
        "just-stamped": square.id === this.justStamped,
      };
    },
    bingoLinePath(line: BingoLine): string {
      return sharpiePath(line);
    },
    bingoLineClasses(line: BingoLine): Record<string, boolean> {
      return {
        "is-pending": this.pendingBingoLineIds.includes(line.id),
        "is-revealing": this.revealingBingoLineIds.includes(line.id),
      };
    },
    openSquare(square: CardSquare, event?: Event): void {
      if (this.celebrating) return;

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
    closeSquare(afterClose?: () => void): void {
      // Templates wire `@click="closeSquare"`, which would pass the DOM event as
      // this arg — only honour a real callback.
      const done = typeof afterClose === "function" ? afterClose : undefined;
      const dialog = this.$refs.markDialog as HTMLDialogElement | undefined;
      if (!dialog?.open) {
        this.clearSelectedSquare();
        done?.();
        return;
      }

      // Already zooming out (e.g. Esc during the exit) — don't start a second pass.
      if (dialog.classList.contains("is-closing")) return;

      if (prefersReducedMotion()) {
        dialog.close();
        done?.();
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
        done?.();
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
      if (!this.selectedSquare || !this.resolved || dismissing) return;

      const squareId = this.selectedSquare.id;
      const slug = this.resolved.slug;
      dismissing = true;

      // Take the window away first, then land the mark ~300ms after it's gone —
      // the state change is never visible mid-zoom. The stamp animates in on the
      // board via the one-shot `just-stamped` class.
      this.closeSquare(() => {
        window.setTimeout(() => {
          const markedAt = new Date().toISOString();
          this.marks = toggleMark(this.marks, squareId, markedAt);
          if (storage) saveMarks(slug, this.marks, storage);

          const reconciled = reconcileBingos(
            this.resolved!.squareIds,
            this.marks,
            this.bingos,
            markedAt,
          );
          this.bingos = reconciled.bingos;
          if (storage) saveBingos(slug, this.bingos, storage);

          if (this.marks[squareId]) {
            this.justStamped = squareId;
            window.setTimeout(() => {
              if (this.justStamped === squareId) this.justStamped = null;
            }, STAMP_MS);

            if (reconciled.newlyCompleted.length) {
              this.pendingBingoLineIds = reconciled.newlyCompleted.map(
                (line) => line.id,
              );
              this.celebrating = true;
              window.setTimeout(() => {
                this.playBingoReveal(reconciled.newlyCompleted);
              }, STAMP_MS);
            }
          }

          dismissing = false;
        }, MARK_DELAY_MS);
      });
    },
    playBingoReveal(lines: BingoLine[]): void {
      void (async () => {
        this.prepareCelebration(lines);

        if (prefersReducedMotion()) {
          this.pendingBingoLineIds = [];
          this.bingoAnnouncement = this.celebrationMessage;
          this.celebrating = false;
          return;
        }

        this.bingoAnnouncement = "Checking for a bingo…";
        await waitFor(BINGO_CHECK_MS);

        for (const [index, line] of lines.entries()) {
          this.pendingBingoLineIds = this.pendingBingoLineIds.filter(
            (lineId) => lineId !== line.id,
          );
          this.revealingBingoLineIds = [
            ...this.revealingBingoLineIds,
            line.id,
          ];
          await nextTick();
          await waitFor(BINGO_LINE_MS);

          if (index < lines.length - 1) await waitFor(BINGO_LINE_GAP_MS);
        }

        this.celebrationVisible = true;
        this.startFairBurst();
        this.bingoAnnouncement = this.celebrationMessage;
      })();
    },
    prepareCelebration(lines: BingoLine[]): void {
      const activeLines = activeBingoLines(this.bingos);
      const blackout = this.cardSquares.every((square) => this.isMarked(square.id));

      this.celebrationMessage = bingoCelebrationMessage(
        lines,
        activeLines,
        blackout,
      );
    },
    fairStarStyle(piece: FairBurstPiece): Record<string, string> {
      return {
        "--star-source-x": piece.sourceX,
        "--star-source-y": piece.sourceY,
        "--star-flight-x": piece.flightX,
        "--star-flight-y": piece.flightY,
        "--star-curve-x": piece.curveX,
        "--star-curve-y": piece.curveY,
        "--star-approach-x": piece.approachX,
        "--star-approach-y": piece.approachY,
        "--star-start-rotation": `${piece.startRotation}deg`,
        "--star-curve-rotation": `${piece.curveRotation}deg`,
        "--star-approach-rotation": `${piece.approachRotation}deg`,
        "--star-landing-rotation": `${piece.landingRotation}deg`,
        "--star-size": piece.size,
        "--star-color": piece.color,
        "--star-duration": piece.duration,
        "--star-landing-scale": piece.landingScale,
      };
    },
    startFairBurst(): void {
      this.stopFairBurst();
      const grid = this.$refs.bingoGrid;
      if (!grid) return;
      const makeStar = () => fairStar(grid.getBoundingClientRect());
      // A light, irregular mist leaves room for the message. The eighty-star
      // cap is a safety rail, not the intended visual density.
      this.fairBurst = Array.from({ length: 2 }, makeStar);
      const throwNextStar = () => {
        const now = Date.now();
        const next = makeStar();
        this.fairBurst = [...this.fairBurst.filter((piece) => piece.expiresAt > now), next]
          .slice(-FAIR_STAR_MAX);
        fairStarTimer = window.setTimeout(
          throwNextStar,
          randomBetween(FAIR_STAR_MIN_DELAY_MS, FAIR_STAR_MAX_DELAY_MS),
        );
      };
      fairStarTimer = window.setTimeout(
        throwNextStar,
        randomBetween(FAIR_STAR_MIN_DELAY_MS, FAIR_STAR_MAX_DELAY_MS),
      );
    },
    stopFairBurst(): void {
      if (fairStarTimer !== null) window.clearTimeout(fairStarTimer);
      fairStarTimer = null;
      this.fairBurst = [];
    },
    dismissCelebration(): void {
      if (!this.celebrationVisible) return;

      this.celebrationVisible = false;
      this.pendingBingoLineIds = [];
      this.revealingBingoLineIds = [];
      this.celebrationMessage = "";
      this.stopFairBurst();
      this.bingoAnnouncement = "";
      this.celebrating = false;
    },
  },
  mounted() {
    if (this.resolved) {
      // Existing cards predate Bingo records: use their latest required mark as
      // the best faithful completion timestamp, without replaying a celebration.
      this.bingos = reconcileSavedBingos(
        this.resolved.squareIds,
        this.marks,
        this.bingos,
      ).bingos;
      if (storage) saveBingos(this.resolved.slug, this.bingos, storage);
    }

    document.documentElement.dataset.appReady = "true";
  },
};

const app = createApp(cardAppOptions);

app.mount("#app");

export default app;
