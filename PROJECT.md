# BINGOPE Project Notes

This file records the project decisions that are not obvious from the code. Current work, sequencing, and acceptance criteria live in the [GitHub milestones](https://github.com/AhoyLemon/bingope/milestones) and their issues. Milestone 1 (the five, the must-ship) and Milestone 2 ("Publicly Playable", the seeded name path) are the ones with deadlines. Milestones 3 (extra fun) and 4 (publicity) are maybe-someday.

## The goal

BINGOPE is a personal, one-day observation bingo game for Lemon, Simone, Angie, Mike, and Victor at the 2026 Minnesota State Fair.

Each person gets a distinct, pre-dealt card. The cards pull from one shared pool of funny, specific things someone might plausibly see at the fair. The five cards should differ but can overlap.

The site is publicly accessible because it is hosted on GitHub Pages. Its heart is still those five people, and their five hand-tuned cards are the one thing that must ship. Beyond them, anyone can play: you type a name and get a card. It never needs accounts, privacy controls, a backend, or shared state between phones.

## How the game works

Each player opens their own URL and marks sightings on their own phone. Marks stay in that browser.

Completing a row, column, or diagonal makes a bingo. A card can have more than one bingo at a time. A bingo gets highlighted and celebrated, but it does not end the game. Everyone keeps playing, and the group decides how to score the day afterward.

The site does not announce a winner or synchronize anything between phones.

## Getting your card

There is one card page, not five folders. The homepage asks for a name and sends you to `card/?card=<name>`. What card you get depends on the name:

- **The five special names** (`lemon`, `simone`, `angie`, `mike`, `victor`) resolve to their bespoke, hand-tuned card, committed as plain data.
- **Any other name** is used as a seed. A deterministic deal turns the name into a card, so the same name always produces the same card in any browser or session, until the squares pool changes.

Names are normalized (lowercased and trimmed) before matching and before namespacing saved state. Landing on `card/` with no name, or a name that resolves to nothing, shows a friendly nudge back to the homepage rather than a broken grid.

## Square data

```ts
interface BingoSquare {
  id: string;
  text: string;
  shortText?: string;
  rarity: "gimme" | "medium" | "rare";
  type: "see" | "do";
}
```

The data lives under [`ts/partials/squares/`](ts/partials/squares/), split by group (`_pool`, `_centers`, `_essentials`) with shared shapes in `_types`, and re-exported by [`ts/partials/_squares.ts`](ts/partials/_squares.ts).

`text` is the canonical wording and defines what counts. The grid displays `shortText ?? text`, and the larger zoomed view always displays `text`. Since the player always reads full `text` before marking, `text` can be declarative and longer than the grid allows. `shortText` is the concise card label: optional but strongly encouraged, and required whenever `text` is too long to fit the grid.

Square IDs are group-prefixed strings: `P` for the pool (`P1`…`P62`, `P5` retired), `C` for centers (`C1`…`C10`), and a per-group prefix for essentials (`CA` crop art, `SD` special dares, future groups their own). An ID stays with the same idea through wording changes. Retired IDs are never reused for different content. The number is a unique tag: IDs do not describe order, rarity, or card position, so they need not be sequential. Group prefixes also keep a bare id from auto-linking to a GitHub issue.

`rarity` and `type` are authoring-time judgments recorded for the eventual card deal. `rarity` ('gimme', 'medium', 'rare') lets the deal weight cards so every card stays winnable. `type` ('see', 'do') marks whether the square is witnessed or performed. Both are hints, not gospel, and stay tunable.

[`WRITING_STYLE.md`](WRITING_STYLE.md) is the source of truth for square writing. No square copy ships without Lemon's approval. [`SQUARES_PLAN.md`](SQUARES_PLAN.md) tracks area coverage and the log of parked and rejected ideas.

The center square is **player-marked**, not auto-marked (issue #14). It starts unmarked but is a near-lock the player can mark in seconds, so it hands out an instant mark and gives the player something funnier than "free space" to recite when calling a bingo. Candidates live in the `centers` array in [`ts/partials/squares/_centers.ts`](ts/partials/squares/_centers.ts), one distinct center per bespoke card. Wiring the deal to reserve and place a center is separate work (dealer script #4, seeded path #12).

### Essential ("must") squares

Some squares sit between the free center and the ordinary pool: not free, because you do not get them on walk-in, but things we want on cards. These are **essential groups**, a real data structure in [`ts/partials/squares/_essentials.ts`](ts/partials/squares/_essentials.ts) (issue #15). Each group carries its own rules plus its own squares:

```ts
interface EssentialGroup {
  groupName: string;
  essentialFor: "everybody" | "special" | "unspecial";
  minimum: number;
  maximum: number;
  squares: BingoSquare[];
}
```

`essentialFor` sets the audience: `everybody` (all cards), `special` (just the five bespoke cards), or `unspecial` (public seeded cards only). `minimum`/`maximum` say how many of the group land on an applicable card, and may be 0 ("might not happen" / "definitely won't"). Unlike centers, essential squares are ordinary dealt cells that are merely guaranteed, so they live only in their group, never in the main pool, which is what makes the count authoritative.

Two groups exist. **Crop Art** (`everybody`, `CA` id prefix) is a reliably findable theme in the Agriculture Horticulture building. **Special Dares** (`special`, `SD` id prefix) is one shared dare placed on all five bespoke cards, the same square in a different cell on each: the Skyglider underwear-throw tradition (`SD1`).

The structure exists now; the deal actually reserving and placing essential squares is still separate work (dealer script #4, seeded path #12).

## Saved state

Saved state represents what is true now, not a permanent event log.

- Marking a square saves an ISO `markedAt` timestamp.
- Unmarking it removes the mark and timestamp.
- Each active bingo stores its own completion timestamp.
- One mark may complete more than one bingo.
- Unmarking a square invalidates only the bingo lines that depend on it.
- Re-completing an invalidated line creates a new completion timestamp.

The initial version does not show timestamps. Keeping them makes a later scoring screen possible.

## Technical boundaries

- The site is static and multipage.
- Pug builds two pages: a homepage and a single card page. The homepage takes a name and sends you to `card/?card=<name>`. Player identity comes from that query parameter, not from a folder route.
- Sass handles styling.
- TypeScript and Vue 3 handle interactive card behavior.
- Vue loads from a CDN. Do not add Vite, Nuxt, a router, or a state library without a real need.
- Bun is Lemon's preferred package manager and is used in GitHub Actions. Harmless npm compatibility can stay.
- Marks and bingo state live in `localStorage`, namespaced by the normalized player name and stable square ID.
- Recent iPhones and Pixels are the only meaningful browser targets.
- The personal version does not need PWA or guaranteed offline support. Once loaded, gameplay itself requires no network traffic.
- Asset URLs must work from the GitHub Pages `/bingope/` project path and from one-folder-deep player routes.

Automated testing stays extremely small. If the pages build, Sass compiles, and TypeScript type-checks, that is enough. The one unit test (`tests/ids.test.ts`, run by `bun run test`) guards square-ID uniqueness across the pool, centers, and essentials (and sanity-checks each essential group's min/max counts), since IDs namespace saved state and a collision would leak marks between squares. The final experience gets checked manually on the five real phones.

## Commits and attribution

Do not add AI-tool attribution to commits or pull requests in this repo. No `Co-Authored-By` trailer for an assistant, no "generated with" footer. Contributors appear as themselves. Agents working here must strip those lines before committing.

## Deal and freeze

The five bespoke cards are dealt on Lemon's machine and committed as plain data. The deployed site never shuffles them. For the five, the commit is the lock.

Public seeded cards are different: they are dealt in the browser, but deterministically from the name. So the lock for everyone else is the **squares pool**. Freeze the pool and every public card freezes with it. Editing the pool after someone has played reshuffles their seeded card and can orphan saved marks (which are keyed by square ID). That is acceptable for a party toy, and the pre-fair pool freeze covers it.

The personal version must be finished by September 1, 2026. Both code and content freeze that day. Everyone arrives September 2, and the group goes to the fair September 3.

The freeze covers the approved writing, center-square treatment, five dealt cards, application code, styling, and deployed build. Lemon owns the project and can override his own deadline if reality requires it.

## Maybe later

These live in Milestones 3 and 4. None have deadlines, and none block the fair.

- A scoring screen built from the saved `markedAt` / `completedAt` timestamps.
- Randomized or increasingly extravagant celebrations, and a game-over screen.
- A possible Firebase hook for game reports.
- Offline or installable-PWA support.
- A one-page BINGOPE explainer, a public-facing README, and an Issue/PR contribution policy.

The reusable-public-version question is no longer hypothetical: the seeded name path (Milestone 2, "Publicly Playable") is that version, shipped without a refactor.
