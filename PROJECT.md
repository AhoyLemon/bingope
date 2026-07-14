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
  id: number;
  text: string;
  shortText?: string;
  rarity: "gimme" | "medium" | "rare";
  type: "see" | "do";
}
```

`text` is the canonical wording and defines what counts. The grid displays `shortText ?? text`, and the larger zoomed view always displays `text`. Since the player always reads full `text` before marking, `text` can be declarative and longer than the grid allows. `shortText` is the concise card label: optional but strongly encouraged, and required whenever `text` is too long to fit the grid.

Square IDs are sequential integers. An ID stays with the same idea through wording changes. Retired IDs are never reused for different content. IDs do not describe order, rarity, or card position.

`rarity` and `type` are authoring-time judgments recorded for the eventual card deal. `rarity` ('gimme', 'medium', 'rare') lets the deal weight cards so every card stays winnable. `type` ('see', 'do') marks whether the square is witnessed or performed. Both are hints, not gospel, and stay tunable.

[`WRITING_STYLE.md`](WRITING_STYLE.md) is the source of truth for square writing. No square copy ships without Lemon's approval. [`SQUARES_PLAN.md`](SQUARES_PLAN.md) tracks area coverage and the log of parked and rejected ideas.

The center square is still an open question. It may be an easy sighting the player marks, or a joke the game treats as already seen. Make that decision after reviewing the writing.

### Guaranteed and special squares (idea, not built)

Some squares sit between the free center and the ordinary pool: not free, because you do not get them on walk-in, but things we want every one of our five players to do or catch. The first example is "Throw a pair of underwear from the Skyglider." A candidate deal rule is a small subroutine that guarantees each dealt card includes at least one such special square and at least one crop art square. This is a maybe, and implementation is paused. It probably wants its own issue once the square pool is settled.

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

Automated testing stays extremely small. If the pages build, Sass compiles, and TypeScript type-checks, that is enough. The final experience gets checked manually on the five real phones.

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
